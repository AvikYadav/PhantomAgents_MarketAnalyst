from flask import Flask,jsonify,request,render_template
import llm_module

llm = llm_module.init_chain()
app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")
@app.route("/api",methods=['POST'])
def api():
    response = llm_module.llm_response(request.json['message'],llm)
    graph_plot = llm_module.graph_plot_llm(response)
    return jsonify({"query":response,"graph_plot":graph_plot})

if __name__ == "__main__":
    app.run(debug=True)