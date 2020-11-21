from flask import Flask
from flask_cors import CORS

app = Flask(__name__,
            static_url_path='/mnist', 
            static_folder='mnist')

cors = CORS(app) 

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == '__main__':
    app.run(debug=True)