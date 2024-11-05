import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Stethoscope } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { ResultCard } from './components/ResultCard';

// Common skin conditions for demo purposes
const SKIN_CONDITIONS = [
  'Eczema',
  'Psoriasis',
  'Melanoma',
  'Rosacea',
  'Contact Dermatitis',
  'Normal Skin',
];

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        // Load MobileNet model
        const loadedModel = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json'
        );
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading model:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadModel();
  }, []);

  const processImage = useCallback(
    async (file: File) => {
      if (!model) return;

      setIsProcessing(true);
      try {
        // Create image element
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => (img.onload = resolve));

        // Prepare image for model
        const tensor = tf.browser
          .fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .expandDims();

        // Get prediction
        const predictions = (await model.predict(tensor)) as tf.Tensor;
        const data = await predictions.data();
        const maxIndex = data.indexOf(Math.max(...Array.from(data)));

        // Map to skin condition (for demo purposes)
        const predictedCondition =
          SKIN_CONDITIONS[maxIndex % SKIN_CONDITIONS.length];
        const predictedConfidence = data[maxIndex];

        setPrediction(predictedCondition);
        setConfidence(predictedConfidence);
        setSelectedImage(URL.createObjectURL(file));

        // Cleanup
        tensor.dispose();
        predictions.dispose();
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [model]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI Model...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skin Condition Analyzer
          </h1>
          <p className="text-gray-600">
            Upload a photo of your skin concern for AI-powered analysis
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <ImageUpload
            onImageSelect={processImage}
            isProcessing={isProcessing}
          />

          {isProcessing && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Analyzing image...</span>
            </div>
          )}

          {selectedImage && (
            <div className="mt-6">
              <img
                src={selectedImage}
                alt="Selected skin"
                className="max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}

          <ResultCard prediction={prediction} confidence={confidence} />
        </div>
      </div>
    </div>
  );
}

export default App;
