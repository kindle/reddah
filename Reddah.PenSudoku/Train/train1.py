"""
    train the model from the mnist data and save it at models/mnist
"""
import os
import logging

import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras import layers, datasets
import tensorflowjs as tfjs

# https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz
# I suggest you download this data file before train the model if you got a bad network.
data_path = os.path.join(os.path.dirname(__file__), r'./mnist.npz')
model_path = os.path.join(os.path.dirname(__file__), r'./mnist')

def load_data(path):
    try:
        with np.load(path) as f:
            x_train, y_train = f['x_train'], f['y_train']
            x_test, y_test = f['x_test'], f['y_test']
            x_train, x_test = x_train/255.0, x_test/255.0
            return (x_train, y_train), (x_test, y_test)
    except FileNotFoundError:
        msg = 'please download https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz to this path: {git-path}/server/datasets/mnist.npz if it takes to long at this step'
        logging.warning(msg)
        return datasets.mnist.load_data()

def train_modle(data):
    (x_train, y_train), (x_test, y_test) = data
    model = Sequential([
        layers.Reshape((28, 28, 1), input_shape=(28, 28)),
        layers.Conv2D(16, (5, 5), padding='same', input_shape=(28, 28, 1), activation='relu'),
        layers.MaxPooling2D(pool_size=2),
        layers.Dropout(0.2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(10, activation='softmax')
    ])
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    model.fit(x_train, y_train, epochs=5, batch_size=64)
    model.evaluate(x_test, y_test)
    model.save('{}/model.h5'.format(model_path)) # uncomment it if you need the original .h5 file
    tfjs.converters.save_keras_model(model, model_path)

data = load_data(data_path)
if data:
    train_modle(data)
else:
    logging.error('fail to load data')