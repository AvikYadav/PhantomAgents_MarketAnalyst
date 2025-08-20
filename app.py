from flask import Flask,jsonify,request
import llm_module

llm = llm_module.init_chain()
app = Flask(__name__)

@app.route("/api",methods=['POST'])
def index():
    return jsonify({"response": llm_module.llm_response(request.json['message'],llm)})

if __name__ == "__main__":
    app.run()