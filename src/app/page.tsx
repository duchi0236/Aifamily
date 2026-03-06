import { DesignWorkflow } from '@/components/DesignWorkflow';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Family Interior Design Studio
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of interior design with our multi-agent AI system.
            From concept to construction, we automate your entire design journey.
          </p>
        </div>
        <DesignWorkflow />
      </main>
    </div>
  );
}