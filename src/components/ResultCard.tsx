import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ResultCardProps {
  prediction: string | null;
  confidence: number | null;
}

export function ResultCard({ prediction, confidence }: ResultCardProps) {
  if (!prediction || !confidence) return null;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Analysis Result</h3>
      </div>
      <div className="mt-4">
        <p className="text-gray-700">
          <span className="font-medium">Detected Condition:</span>{' '}
          {prediction}
        </p>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">Confidence:</span>{' '}
          {(confidence * 100).toFixed(2)}%
        </p>
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          Note: This is an AI-powered analysis and should not be considered as a
          medical diagnosis. Please consult a healthcare professional for proper
          medical advice.
        </p>
      </div>
    </div>
  );
}