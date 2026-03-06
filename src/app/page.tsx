'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { DesignWorkflow } from '@/components/DesignWorkflow';

export default function Home() {
  const [isWorkflowStarted, setIsWorkflowStarted] = useState(false);
  const [floorPlanData, setFloorPlanData] = useState<File | null>(null);

  const handleStartExperience = (floorPlan: File) => {
    setFloorPlanData(floorPlan);
    setIsWorkflowStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!isWorkflowStarted ? (
        <HeroSection onStartExperience={handleStartExperience} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <button 
              onClick={() => setIsWorkflowStarted(false)}
              className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              ← 返回首页
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI 家庭室内设计工作室
            </h1>
            <p className="text-gray-600">
              您的户型图已上传，开始您的智能设计之旅
            </p>
          </div>
          <DesignWorkflow initialFloorPlan={floorPlanData} />
        </div>
      )}
    </div>
  );
}