import os
import glob
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv
from google.oauth2 import service_account
import pandas as pd
import re
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
load_dotenv(override=True)
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY', 'your-key-if-not-using-env')
db_name = "vector_db"
creds = service_account.Credentials.from_service_account_file(
    os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'your-key-if-not-using-env')
)



def chunking(companyNoExclusive):
    chunks = []
    companies_path_lst = [f"data/c{(3 - len(str(i))) * "0"}{i}" for i in range(1, companyNoExclusive)]
    for company_path in companies_path_lst:
        df = pd.read_csv(company_path + "/core.csv")
        files_summary = glob.glob(company_path + "/summary/*")
        text_loader_kwargs = {'encoding': 'utf-8'}
        documents = []
        loader = DirectoryLoader(company_path + "/summary", glob="*.*", loader_cls=TextLoader,
                                 loader_kwargs=text_loader_kwargs)
        folder_docs = loader.load()
        for doc in folder_docs:
            doc.metadata["doc_type"] = os.path.basename(doc.metadata["source"].split(".")[0])
            doc.metadata['company_name'] = df.at[0, "name"]
            documents.append(doc)

        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = chunks + text_splitter.split_documents(documents)

    for chunk in chunks:
        match = re.search(r"##\s*(.+?)\s*##", chunk.page_content, re.DOTALL)
        if match:
            chunk.metadata['doc_content_notes'] = match.group(1)
    return chunks


def rag_setup_vectorize_data(chunks,new=False):
    embeddings = VertexAIEmbeddings(model_name="text-embedding-004", location="us-central1", credentials=creds)
    if new:
        Chroma(persist_directory=db_name, embedding_function=embeddings).delete_collection()
    vectorstore = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=db_name)
    print(f"Vectorstore created with {vectorstore._collection.count()} documents")
    return vectorstore

def llm_init(vectorstore,system_prompt="",model="gemini-2.5-pro"):
    if len(system_prompt) == 0:
        system_prompt = "You are a concise market researcher. Use the provided context to answer."
    llm = ChatVertexAI(model_name=model, location="us-central1")
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Question: {input}\n\nContext:\n{context}")
    ])
    doc_chain = create_stuff_documents_chain(llm, prompt)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    return create_retrieval_chain(retriever, doc_chain)

def llm_response(message,llm):
    result_in = llm.invoke({"input": message})
    return result_in["answer"]

def init_chain():
    chunks = chunking(6)
    vectorstore = rag_setup_vectorize_data(chunks,False)
    return llm_init(vectorstore)
