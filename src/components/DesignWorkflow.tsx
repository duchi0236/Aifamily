'use client';

import { useState, useRef } from 'react';
import { ConceptualizationStep } from './steps/ConceptualizationStep';
import { SpatialDesignStep } from './steps/SpatialDesignStep';
import { RenderingStep } from './steps/RenderingStep';
import { ProcurementStep } from './steps/ProcurementStep';

interface DesignWorkflowProps {
  initialData?: any;
  onBackToHome?: () => void;
}

export function DesignWorkflow({ initialData, onBackToHome }: DesignWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState(initialData || {});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { name: 'Concept', component: ConceptualizationStep },
    { name: 'Spatial Design', component: SpatialDesignStep },
    { name: 'Rendering', component: RenderingStep },
    { name: 'Procurement', component: ProcurementStep }
  ];

  const handleStepComplete = async (stepData: any, stepIndex: number) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Update workflow data with completed step
      const updatedData = { ...workflowData, ...stepData };
      setWorkflowData(updatedData);
      
      // Move to next step if not the last one
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      }
      
    } catch (err) {
      setError(`Step ${stepIndex + 1} failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setWorkflowData({});
    setError(null);
    if (onBackToHome) {
      onBackToHome();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle floor plan upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const floorPlanData = {
          floorPlanFile: file,
          floorPlanUrl: e.target?.result as string,
          fileName: file.name
        };
        handleStepComplete(floorPlanData, 0);
      };
      reader.readAsDataURL(file);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back to Home Button */}
      {onBackToHome && currentStep === 0 && (
        <div className="mb-6 text-center">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Initial Step - Floor Plan Upload */}
      {currentStep === 0 && !workflowData.floorPlanFile && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Floor Plan</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please upload your apartment/house floor plan to get started with your AI-powered interior design journey.
          </p>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">Click to upload floor plan (PDF, JPG, PNG)</p>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Select Floor Plan
          </button>
        </div>
      )}

      {/* Current Step */}
      {(currentStep > 0 || workflowData.floorPlanFile) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <CurrentStepComponent
            onComplete={(data) => handleStepComplete(data, currentStep)}
            onReset={handleReset}
            isProcessing={isProcessing}
            workflowData={workflowData}
          />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="mt-6 flex justify-between">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Previous Step
          </button>
        )}
        {currentStep === 0 && onBackToHome && (
          <button
            onClick={onBackToHome}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}