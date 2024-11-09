from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/models/<path:path>')
def send_model(path):
    return app.send_static_file(os.path.join('models', path))

@app.route('/<path:path>')
def send_static(path):
    return app.send_static_file(path)

if __name__ == '__main__':
    app.run(debug=True)
