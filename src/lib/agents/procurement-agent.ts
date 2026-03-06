import { Agent, AgentResponse } from './types';
import { OpenBOMAPI, RegionalSupplierAPI } from '../integrations';

export class ProcurementAgent implements Agent {
  private openBom: OpenBOMAPI;
  private regionalSuppliers: RegionalSupplierAPI;

  constructor() {
    this.openBom = new OpenBOMAPI();
    this.regionalSuppliers = new RegionalSupplierAPI();
  }

  async execute(input: any): Promise<AgentResponse> {
    try {
      // Step 1: Validate input has rendering data with BOM
      if (!input.renderingData?.bom) {
        throw new Error('Missing BOM data from rendering stage');
      }

      // Step 2: Process and enrich BOM data
      const enrichedBom = await this.enrichBOM(input.renderingData.bom);
      
      // Step 3: Create OpenBOM document
      const bomDocument = await this.openBom.createDocument({
        name: `Interior Design Project - ${new Date().toISOString().split('T')[0]}`,
        items: enrichedBom.items,
        metadata: {
          projectType: 'interior-design',
          roomType: input.spatialDesignData?.roomType || 'living room',
          style: input.conceptualizationData?.style || 'modern'
        }
      });
      
      // Step 4: Find regional suppliers based on location
      const suppliers = await this.regionalSuppliers.findSuppliers({
        region: input.userLocation || 'US',
        materials: enrichedBom.materials,
        furniture: enrichedBom.furniture
      });
      
      // Step 5: Generate cost estimates and alternatives
      const costAnalysis = await this.analyzeCosts(enrichedBom, suppliers);
      
      // Step 6: Match with contractors/platforms
      const contractorMatches = await this.matchContractors({
        bom: enrichedBom,
        location: input.userLocation,
        budget: input.conceptualizationData?.budgetConstraints || 'medium'
      });
      
      return {
        success: true,
        data: {
          bomDocument,
          suppliers,
          costAnalysis,
          contractorMatches,
          procurementPlan: this.generateProcurementPlan(enrichedBom, suppliers, costAnalysis)
        },
        metadata: {
          agent: 'procurement',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Procurement failed: ${error.message}`,
        metadata: {
          agent: 'procurement',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
    }
  }

  private async enrichBOM(bom: any) {
    // Enrich BOM with additional metadata, specifications, and alternatives
    const enrichedItems = bom.items.map(item => ({
      ...item,
      specifications: this.getSpecifications(item),
      alternatives: this.getAlternatives(item),
      leadTime: this.estimateLeadTime(item),
      sustainabilityScore: this.calculateSustainability(item)
    }));
    
    return {
      ...bom,
      items: enrichedItems,
      materials: this.extractMaterials(enrichedItems),
      furniture: this.extractFurniture(enrichedItems),
      totalEstimatedCost: this.calculateTotalCost(enrichedItems)
    };
  }

  private getSpecifications(item: any) {
    // Get detailed specifications for each item
    return {
      dimensions: item.dimensions || {},
      material: item.material || 'unknown',
      finish: item.finish || 'standard',
      certifications: item.certifications || [],
      warranty: item.warranty || '1 year'
    };
  }

  private getAlternatives(item: any) {
    // Find cost-effective or sustainable alternatives
    const alternatives = [];
    
    // Budget alternative (20% cheaper)
    if (item.cost) {
      alternatives.push({
        ...item,
        name: `${item.name} (Budget Alternative)`,
        cost: item.cost * 0.8,
        quality: 'good'
      });
    }
    
    // Premium alternative (30% more expensive, better quality)
    if (item.cost) {
      alternatives.push({
        ...item,
        name: `${item.name} (Premium Alternative)`,
        cost: item.cost * 1.3,
        quality: 'premium',
        sustainabilityScore: (item.sustainabilityScore || 0) + 10
      });
    }
    
    return alternatives;
  }

  private estimateLeadTime(item: any): number {
    // Estimate lead time in days
    const categories = {
      'furniture': 14,
      'lighting': 7,
      'flooring': 21,
      'wall-treatment': 10,
      'fixtures': 5,
      'decorative': 3
    };
    
    return categories[item.category] || 14;
  }

  private calculateSustainability(item: any): number {
    // Calculate sustainability score (0-100)
    let score = 50; // Base score
    
    if (item.material?.includes('recycled')) score += 20;
    if (item.material?.includes('bamboo') || item.material?.includes('cork')) score += 15;
    if (item.localSourcing) score += 10;
    if (item.energyEfficient) score += 15;
    
    return Math.min(score, 100);
  }

  private extractMaterials(items: any[]): any[] {
    return items.filter(item => 
      ['flooring', 'wall-treatment', 'fixtures'].includes(item.category)
    );
  }

  private extractFurniture(items: any[]): any[] {
    return items.filter(item => 
      ['furniture', 'decorative'].includes(item.category)
    );
  }

  private calculateTotalCost(items: any[]): number {
    return items.reduce((total, item) => total + (item.cost || 0), 0);
  }

  private async analyzeCosts(bom: any, suppliers: any[]) {
    // Analyze costs across different suppliers and scenarios
    const baseCost = bom.totalEstimatedCost;
    const supplierQuotes = await Promise.all(
      suppliers.map(supplier => this.getSupplierQuote(supplier, bom.items))
    );
    
    const bestQuotes = this.findBestQuotes(supplierQuotes);
    
    return {
      baseCost,
      bestQuotes,
      savingsOpportunities: this.identifySavings(bestQuotes, baseCost),
      budgetCompliance: this.checkBudgetCompliance(baseCost, bom.budget)
    };
  }

  private async getSupplierQuote(supplier: any, items: any[]) {
    // Get quote from supplier for all items
    // This would integrate with actual supplier APIs
    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      totalCost: items.reduce((total, item) => {
        const itemCost = this.getItemCostFromSupplier(item, supplier);
        return total + (itemCost || item.cost || 0);
      }, 0),
      deliveryTime: Math.max(...items.map(item => supplier.leadTimes[item.category] || 14)),
      terms: supplier.paymentTerms
    };
  }

  private getItemCostFromSupplier(item: any, supplier: any): number | null {
    // Get specific item cost from supplier catalog
    // This would query supplier's product database
    const catalogItem = supplier.catalog.find(catalogItem => 
      catalogItem.sku === item.sku || catalogItem.name === item.name
    );
    
    return catalogItem?.price || null;
  }

  private findBestQuotes(quotes: any[]): any[] {
    // Find best quotes by category and overall
    const bestByCategory = {};
    const allQuotes = quotes.flat();
    
    // Group by category and find best price
    // Simplified logic - in reality would be more complex
    return allQuotes.sort((a, b) => a.totalCost - b.totalCost).slice(0, 3);
  }

  private identifySavings(quotes: any[], baseCost: number) {
    const bestQuote = quotes[0];
    if (!bestQuote) return { potentialSavings: 0, percentage: 0 };
    
    const savings = baseCost - bestQuote.totalCost;
    return {
      potentialSavings: savings,
      percentage: (savings / baseCost) * 100
    };
  }

  private checkBudgetCompliance(cost: number, budget: string): boolean {
    // Check if cost fits within budget constraints
    // This is simplified - would need actual budget amounts
    if (budget === 'low' && cost > 10000) return false;
    if (budget === 'high' && cost < 5000) return false;
    return true;
  }

  private async matchContractors(input: any) {
    // Match with local contractors based on project requirements
    const platforms = ['Renoveru', 'Akiya2.0', 'Toku-Akiya']; // Example platforms
    
    const matches = await Promise.all(
      platforms.map(platform => 
        this.getContractorMatchesFromPlatform(platform, input)
      )
    );
    
    return matches.flat().sort((a, b) => a.rating - b.rating).reverse().slice(0, 5);
  }

  private async getContractorMatchesFromPlatform(platform: string, input: any) {
    // Get contractor matches from specific platform
    // This would integrate with actual platform APIs
    return [
      {
        platform,
        name: `Contractor from ${platform}`,
        rating: 4.5,
        specialties: ['interior design', 'renovation'],
        estimatedTimeline: '4-6 weeks',
        estimatedCost: input.bom.totalEstimatedCost * 1.2, // 20% markup for labor
        availability: 'Available next month'
      }
    ];
  }

  private generateProcurementPlan(bom: any, suppliers: any[], costAnalysis: any) {
    // Generate detailed procurement plan with timeline
    const plan = {
      phases: [
        {
          name: 'Material Procurement',
          timeline: 'Week 1-2',
          items: bom.materials,
          suppliers: suppliers.filter(s => s.type === 'material'),
          budget: costAnalysis.bestQuotes[0]?.totalCost || bom.totalEstimatedCost * 0.6
        },
        {
          name: 'Furniture Procurement',
          timeline: 'Week 2-4',
          items: bom.furniture,
          suppliers: suppliers.filter(s => s.type === 'furniture'),
          budget: costAnalysis.bestQuotes[0]?.totalCost || bom.totalEstimatedCost * 0.4
        },
        {
          name: 'Installation & Assembly',
          timeline: 'Week 4-6',
          contractors: this.matchContractors({ bom, location: 'default' }),
          budget: bom.totalEstimatedCost * 0.2 // Labor costs
        }
      ],
      totalTimeline: '6 weeks',
      totalBudget: bom.totalEstimatedCost * 1.2,
      riskFactors: this.identifyRiskFactors(bom, suppliers)
    };
    
    return plan;
  }

  private identifyRiskFactors(bom: any, suppliers: any[]) {
    // Identify potential risks in procurement
    const risks = [];
    
    // Long lead times
    const longLeadItems = bom.items.filter(item => item.leadTime > 21);
    if (longLeadItems.length > 0) {
      risks.push({
        type: 'lead-time',
        description: `${longLeadItems.length} items have lead times over 3 weeks`,
        mitigation: 'Order these items first'
      });
    }
    
    // Single source dependencies
    const singleSourceItems = bom.items.filter(item => 
      suppliers.filter(s => s.catalog.some(c => c.sku === item.sku)).length === 1
    );
    if (singleSourceItems.length > 0) {
      risks.push({
        type: 'supply-chain',
        description: `${singleSourceItems.length} items are single-sourced`,
        mitigation: 'Identify backup suppliers or alternatives'
      });
    }
    
    return risks;
  }
}