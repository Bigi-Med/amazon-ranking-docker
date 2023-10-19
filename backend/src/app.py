from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS from flask_cors
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

scrapy_project_path = os.path.join(os.path.dirname(__file__), 'spider', 'amazon_crawler')
output_file_path = os.path.join(scrapy_project_path, 'amazon_results.json')

@app.route("/")
def hello():
    return jsonify(message="Hello, Flask!")

@app.route("/amazon-product")
def amazon_product():
    asin = request.args.get("ASIN")
    keywords = request.args.get("keywords")

    subprocess.run(['scrapy','crawl','amazon','-o',output_file_path,'-a','keywords='+keywords,'-a','asin='+asin ],cwd=scrapy_project_path)

    def read_first_line():
        try:
            with open(output_file_path, 'r') as json_file:
                first_line = json_file.readline().strip()
                return first_line
        except FileNotFoundError:
            return json.dumps([])  # Return an empty array if the file is not found
        except Exception as e:
            return json.dumps({'error': str(e)})  # Handle other exceptions

    first_line_data = read_first_line() 

    return jsonify(firstLineData=first_line_data)

if __name__ == "__main__":
    app.run(debug=False)
