from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)

# Endpoint to execute model.py
@app.route('/rundynamicmodel', methods=['POST'])
def run_dynamic_model():
    try:
        # Execute model.py using subprocess (change command as per your setup)
        result = subprocess.run(['python', 'model/baseModel.py'], text=True)
        # Assuming model.py outputs some result, you can return it as JSON
        return jsonify({'result': 'Executed'})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=4000)
