'use client';

import { useState } from 'react';
import { ConceptualizationStep } from './steps/ConceptualizationStep';
import { SpatialDesignStep } from './steps/SpatialDesignStep';
import { RenderingStep } from './steps/RenderingStep';
import { ProcurementStep } from './steps/ProcurementStep';

interface DesignWorkflowProps {
  initialData?: any;
}

export function DesignWorkflow({ initialData }: DesignWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState(initialData || {});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-6xl mx-auto">
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

      {/* Current Step */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <CurrentStepComponent
          onComplete={(data) => handleStepComplete(data, currentStep)}
          onReset={handleReset}
          isProcessing={isProcessing}
          workflowData={workflowData}
        />
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Reset Workflow
        </button>
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Previous Step
          </button>
        )}
      </div>
    </div>
  );
}