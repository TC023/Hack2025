from flask import Flask, request, jsonify
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from PIL import Image
import io

app = Flask(__name__)

# Load the trained model
model = load_model('model.h5')

# Define emotion labels (update as per your model)
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

@app.route('/predict', methods=['POST'])
def predict():
    if 'images' not in request.files:
        return jsonify({'error': 'No images uploaded'}), 400
    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No images found'}), 400
    emotions = []
    for file in files:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('L')  # Convert to grayscale
        img = img.resize((48, 48))  # Resize as per model input
        img_array = np.array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        img_array = np.expand_dims(img_array, axis=-1)
        prediction = model.predict(img_array)
        emotion = emotion_labels[np.argmax(prediction)]
        emotions.append(emotion)
    # Calcular la emoción más frecuente
    if emotions:
        most_frequent = max(set(emotions), key=emotions.count)
        return jsonify({"most_frequent": most_frequent})
    else:
        return jsonify({'error': 'No valid images processed'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
