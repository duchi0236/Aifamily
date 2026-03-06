import { Agent, AgentResponse, WorkflowState } from './types';
import { ConceptualizationAgent } from './conceptualization-agent';
import { SpatialDesignAgent } from './spatial-design-agent';
import { RenderingAgent } from './rendering-agent';
import { ProcurementAgent } from './procurement-agent';
import { MemoryManager } from '../memory/memory-manager';

export class CoordinatorAgent implements Agent {
  private conceptualizationAgent: ConceptualizationAgent;
  private spatialDesignAgent: SpatialDesignAgent;
  private renderingAgent: RenderingAgent;
  private procurementAgent: ProcurementAgent;
  private memoryManager: MemoryManager;

  constructor() {
    this.conceptualizationAgent = new ConceptualizationAgent();
    this.spatialDesignAgent = new SpatialDesignAgent();
    this.renderingAgent = new RenderingAgent();
    this.procurementAgent = new ProcurementAgent();
    this.memoryManager = new MemoryManager();
  }

  async execute(input: any): Promise<AgentResponse> {
    try {
      // Initialize workflow state
      const workflowState: WorkflowState = {
        currentStage: 'conceptualization',
        projectId: this.generateProjectId(),
        userInput: input,
        results: {},
        errors: [],
        completedStages: [],
        timestamp: new Date().toISOString()
      };

      console.log(`Starting multi-agent workflow for project: ${workflowState.projectId}`);

      // Stage 1: Conceptualization
      console.log('Executing Conceptualization Agent...');
      const conceptualizationResult = await this.conceptualizationAgent.execute(input);
      if (!conceptualizationResult.success) {
        throw new Error(`Conceptualization failed: ${conceptualizationResult.error}`);
      }
      
      workflowState.results.conceptualization = conceptualizationResult.data;
      workflowState.completedStages.push('conceptualization');
      workflowState.currentStage = 'spatial-design';
      
      // Save to memory
      await this.memoryManager.saveState(workflowState.projectId, workflowState);

      // Stage 2: Spatial Design
      console.log('Executing Spatial Design Agent...');
      const spatialDesignResult = await this.spatialDesignAgent.execute({
        ...input,
        conceptualizationData: conceptualizationResult.data
      });
      
      if (!spatialDesignResult.success) {
        throw new Error(`Spatial design failed: ${spatialDesignResult.error}`);
      }
      
      workflowState.results.spatialDesign = spatialDesignResult.data;
      workflowState.completedStages.push('spatial-design');
      workflowState.currentStage = 'rendering';
      
      // Save to memory
      await this.memoryManager.saveState(workflowState.projectId, workflowState);

      // Stage 3: Rendering
      console.log('Executing Rendering Agent...');
      const renderingResult = await this.renderingAgent.execute({
        ...input,
        conceptualizationData: conceptualizationResult.data,
        spatialDesignData: spatialDesignResult.data
      });
      
      if (!renderingResult.success) {
        throw new Error(`Rendering failed: ${renderingResult.error}`);
      }
      
      workflowState.results.rendering = renderingResult.data;
      workflowState.completedStages.push('rendering');
      workflowState.currentStage = 'procurement';
      
      // Save to memory
      await this.memoryManager.saveState(workflowState.projectId, workflowState);

      // Stage 4: Procurement
      console.log('Executing Procurement Agent...');
      const procurementResult = await this.procurementAgent.execute({
        ...input,
        conceptualizationData: conceptualizationResult.data,
        spatialDesignData: spatialDesignResult.data,
        renderingData: renderingResult.data
      });
      
      if (!procurementResult.success) {
        throw new Error(`Procurement failed: ${procurementResult.error}`);
      }
      
      workflowState.results.procurement = procurementResult.data;
      workflowState.completedStages.push('procurement');
      workflowState.currentStage = 'completed';
      
      // Save final state
      await this.memoryManager.saveState(workflowState.projectId, workflowState);

      console.log(`Workflow completed successfully for project: ${workflowState.projectId}`);

      return {
        success: true,
        data: {
          projectId: workflowState.projectId,
          workflowResults: workflowState.results,
          summary: this.generateSummary(workflowState.results)
        },
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0',
          stagesCompleted: workflowState.completedStages.length,
          totalStages: 4
        }
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      
      return {
        success: false,
        error: `Workflow failed: ${error.message}`,
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private generateProjectId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSummary(results: any): any {
    // Generate a comprehensive summary of the entire workflow
    const conceptualization = results.conceptualization;
    const spatialDesign = results.spatialDesign;
    const rendering = results.rendering;
    const procurement = results.procurement;

    return {
      projectName: conceptualization?.moodboard?.title || 'AI Interior Design Project',
      style: conceptualization?.styleParameters?.style || 'Modern',
      roomType: spatialDesign?.spatialStructure?.roomType || 'Living Room',
      dimensions: spatialDesign?.dimensions || { width: 4, depth: 5, height: 2.8 },
      totalArea: spatialDesign?.dimensions?.area || 20,
      estimatedCost: procurement?.procurementPlan?.totalBudget || 0,
      timeline: procurement?.procurementPlan?.totalTimeline || '6 weeks',
      keyFeatures: [
        ...conceptualization?.trendAnalysis?.map(t => t.keyword) || [],
        ...conceptualization?.visualEmbeddings?.map(v => v.category) || []
      ].slice(0, 5),
      deliverables: [
        'Professional moodboard',
        '3D spatial reconstruction',
        'Photorealistic renders',
        'Technical construction drawings',
        'VR/AR experience',
        'Complete BOM (Bill of Materials)',
        'Supplier procurement plan',
        'Contractor matches'
      ]
    };
  }

  // Method to resume a workflow from a specific stage
  async resumeWorkflow(projectId: string, fromStage: string): Promise<AgentResponse> {
    const savedState = await this.memoryManager.loadState(projectId);
    if (!savedState) {
      return {
        success: false,
        error: `No saved state found for project: ${projectId}`,
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }

    // Resume from the specified stage
    switch (fromStage) {
      case 'spatial-design':
        return await this.resumeFromSpatialDesign(savedState);
      case 'rendering':
        return await this.resumeFromRendering(savedState);
      case 'procurement':
        return await this.resumeFromProcurement(savedState);
      default:
        return await this.execute(savedState.userInput);
    }
  }

  private async resumeFromSpatialDesign(state: WorkflowState): Promise<AgentResponse> {
    try {
      const input = state.userInput;
      const conceptualizationData = state.results.conceptualization;

      // Continue with spatial design
      const spatialDesignResult = await this.spatialDesignAgent.execute({
        ...input,
        conceptualizationData
      });

      if (!spatialDesignResult.success) {
        throw new Error(`Spatial design failed: ${spatialDesignResult.error}`);
      }

      state.results.spatialDesign = spatialDesignResult.data;
      state.completedStages.push('spatial-design');
      state.currentStage = 'rendering';

      await this.memoryManager.saveState(state.projectId, state);

      // Continue with rendering and procurement
      return await this.continueWorkflow(state);
    } catch (error) {
      return {
        success: false,
        error: `Resume from spatial design failed: ${error.message}`,
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private async resumeFromRendering(state: WorkflowState): Promise<AgentResponse> {
    try {
      const input = state.userInput;
      const conceptualizationData = state.results.conceptualization;
      const spatialDesignData = state.results.spatialDesign;

      // Continue with rendering
      const renderingResult = await this.renderingAgent.execute({
        ...input,
        conceptualizationData,
        spatialDesignData
      });

      if (!renderingResult.success) {
        throw new Error(`Rendering failed: ${renderingResult.error}`);
      }

      state.results.rendering = renderingResult.data;
      state.completedStages.push('rendering');
      state.currentStage = 'procurement';

      await this.memoryManager.saveState(state.projectId, state);

      // Continue with procurement
      return await this.continueWorkflow(state);
    } catch (error) {
      return {
        success: false,
        error: `Resume from rendering failed: ${error.message}`,
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private async resumeFromProcurement(state: WorkflowState): Promise<AgentResponse> {
    try {
      const input = state.userInput;
      const conceptualizationData = state.results.conceptualization;
      const spatialDesignData = state.results.spatialDesign;
      const renderingData = state.results.rendering;

      // Continue with procurement
      const procurementResult = await this.procurementAgent.execute({
        ...input,
        conceptualizationData,
        spatialDesignData,
        renderingData
      });

      if (!procurementResult.success) {
        throw new Error(`Procurement failed: ${procurementResult.error}`);
      }

      state.results.procurement = procurementResult.data;
      state.completedStages.push('procurement');
      state.currentStage = 'completed';

      await this.memoryManager.saveState(state.projectId, state);

      return {
        success: true,
        data: {
          projectId: state.projectId,
          workflowResults: state.results,
          summary: this.generateSummary(state.results)
        },
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0',
          stagesCompleted: state.completedStages.length,
          totalStages: 4
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Resume from procurement failed: ${error.message}`,
        metadata: {
          agent: 'coordinator',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private async continueWorkflow(state: WorkflowState): Promise<AgentResponse> {
    // Continue from current stage
    switch (state.currentStage) {
      case 'rendering':
        return await this.resumeFromRendering(state);
      case 'procurement':
        return await this.resumeFromProcurement(state);
      case 'completed':
        return {
          success: true,
          data: {
            projectId: state.projectId,
            workflowResults: state.results,
            summary: this.generateSummary(state.results)
          },
          metadata: {
            agent: 'coordinator',
            timestamp: new Date().toISOString(),
            version: '1.0',
            stagesCompleted: state.completedStages.length,
            totalStages: 4
          }
        };
      default:
        return {
          success: false,
          error: `Unknown current stage: ${state.currentStage}`,
          metadata: {
            agent: 'coordinator',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        };
    }
  }
}