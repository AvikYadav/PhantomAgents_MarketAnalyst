import glob

from google import genai
from google.genai import types
from dotenv import load_dotenv
import os


load_dotenv(override=True)
apiKey = os.getenv('GEMINI_API_KEY')
# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client(api_key=apiKey)




# os.mkdir("data/c001/summery")

def call_gemini(file):
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[file],
        config=types.GenerateContentConfig(
            system_instruction="you are a company information summarizer who takes in facts and convert them into human readable summaries , make sure to include facts and don't skip any important information. break the document provided into sections that are clubbed with similar info and then make summaries in different paragraph for different sections. user this format fro headings of sections - ##heading goes here between these##"
        )
    )
    return response.text
#
lst = ["data/c005","data/c004","data/c003","data/c002"]
for j in lst:
    try:
        os.mkdir(f"{j}/summary")
    except:pass
    files = os.listdir(j)
    print(files)
    for i in files:
        if i == "summary":
            continue
        with open(f"{j}/{i}","r",encoding="utf-8") as f:
            res = call_gemini(f.read())
            print(res)
            with open(f"{j}/summary/{i.split(".")[0]}.txt","w",encoding="utf-8") as k:
                print(res,file=k)



