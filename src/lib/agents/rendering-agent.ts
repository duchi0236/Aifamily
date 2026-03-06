import { Agent, AgentResponse } from './types';
import { CoohomAPI, HomestylerAPI } from '../integrations';

export class RenderingAgent implements Agent {
  private coohom: CoohomAPI;
  private homestyler: HomestylerAPI;

  constructor() {
    this.cooohom = new CoohomAPI();
    this.homestyler = new HomestylerAPI();
  }

  async execute(input: any): Promise<AgentResponse> {
    try {
      // Step 1: Validate input has spatial design data
      if (!input.spatialDesignData) {
        throw new Error('Missing spatial design data');
      }

      // Step 2: Prepare data for Coohom API
      const coohomPayload = this.prepareCoohomPayload(input);
      
      // Step 3: Send to Coohom for professional rendering
      const coohomResponse = await this.cooohom.createProject(coohomPayload);
      
      // Step 4: Generate photorealistic renders
      const photoRenders = await this.cooohom.generateRenders({
        projectId: coohomResponse.projectId,
        renderTypes: ['photorealistic', 'technical-drawings'],
        quality: 'ultra'
      });
      
      // Step 5: Create WebGL VR experience with Homestyler
      const vrExperience = await this.homestyler.createWebGLExperience({
        spatialData: input.spatialDesignData,
        materials: input.conceptualizationData?.materials || [],
        lighting: this.calculateLighting(input.spatialDesignData)
      });
      
      // Step 6: Extract BOM (Bill of Materials) for procurement
      const bom = await this.cooohom.extractBOM(coohomResponse.projectId);
      
      return {
        success: true,
        data: {
          photoRenders,
          vrExperience,
          technicalDrawings: photoRenders.technicalDrawings,
          bom,
          projectId: coohomResponse.projectId
        },
        metadata: {
          agent: 'rendering',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Rendering failed: ${error.message}`,
        metadata: {
          agent: 'rendering',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private prepareCoohomPayload(input: any) {
    // Convert spatial design data to Coohom-compatible format
    const spatialData = input.spatialDesignData;
    const conceptualData = input.conceptualizationData;
    
    return {
      projectName: `${conceptualData?.style || 'Modern'} ${spatialData?.roomType || 'Living Room'}`,
      roomDimensions: {
        width: spatialData.dimensions?.width || 4,
        depth: spatialData.dimensions?.depth || 5,
        height: spatialData.dimensions?.height || 2.8
      },
      walls: spatialData.spatialStructure?.walls || [],
      styleParameters: {
        colorPalette: conceptualData?.colorPalette || ['white', 'gray', 'wood'],
        materials: conceptualData?.materials || ['wood', 'metal'],
        style: conceptualData?.style || 'modern'
      },
      furnitureLayout: this.generateFurnitureLayout(spatialData, conceptualData),
      lightingPlan: this.calculateLighting(spatialData)
    };
  }

  private generateFurnitureLayout(spatialData: any, conceptualData: any) {
    // Generate basic furniture layout based on room type and style
    const roomType = spatialData?.spatialStructure?.roomType || 'living room';
    const style = conceptualData?.style || 'modern';
    
    // Basic furniture placement logic
    const layouts = {
      'living room': [
        { type: 'sofa', position: [1, 2], dimensions: [2, 0.8] },
        { type: 'coffee-table', position: [2, 1.5], dimensions: [1, 0.6] },
        { type: 'tv-stand', position: [3, 0.5], dimensions: [1.5, 0.5] }
      ],
      'kitchen': [
        { type: 'cabinets', position: [0, 0], dimensions: [2, 0.6] },
        { type: 'island', position: [2, 2], dimensions: [1.5, 0.8] },
        { type: 'dining-table', position: [3, 3], dimensions: [1.2, 0.8] }
      ],
      'bedroom': [
        { type: 'bed', position: [1, 2], dimensions: [2, 1.5] },
        { type: 'nightstands', position: [0.5, 1.5], dimensions: [0.5, 0.5] },
        { type: 'wardrobe', position: [3, 1], dimensions: [1, 2] }
      ]
    };
    
    return layouts[roomType] || layouts['living room'];
  }

  private calculateLighting(spatialData: any) {
    // Calculate lighting plan based on room dimensions and windows
    const area = spatialData.dimensions?.area || 20;
    const naturalLight = spatialData.windows?.length > 0 ? 'high' : 'low';
    
    return {
      ambientLight: Math.min(300 + (area * 10), 1000), // Lux calculation
      taskLighting: 'distributed',
      accentLighting: 'strategic',
      naturalLightUtilization: naturalLight
    };
  }
}