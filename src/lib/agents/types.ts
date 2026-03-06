// Core types for the multi-agent system

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  memoryType: 'working' | 'authoritative' | 'observational';
}

export interface DesignBrief {
  stylePreferences: string[];
  roomType: string;
  dimensions: { width: number; height: number; depth: number };
  budget: number;
  location: string;
  inspirationImages?: string[];
  constraints: string[];
}

export interface Moodboard {
  id: string;
  styleParameters: StyleParameters;
  trendAnalysis: TrendAnalysis;
  visualReferences: string[];
  createdAt: string;
}

export interface StyleParameters {
  colorPalette: string[];
  materials: string[];
  furnitureStyles: string[];
  lightingMood: string;
}

export interface TrendAnalysis {
  keywords: string[];
  regionalTrends: Record<string, string[]>;
  emergingPatterns: string[];
}

export interface SpatialDesign {
  id: string;
  floorPlan: FloorPlan;
  cadScript: string;
  dimensions: Dimensions;
  furniturePlacement: FurniturePlacement[];
}

export interface FloorPlan {
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  zones: Zone[];
}

export interface Wall {
  id: string;
  start: Point3D;
  end: Point3D;
  thickness: number;
  material: string;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface FurniturePlacement {
  id: string;
  modelId: string;
  position: Point3D;
  rotation: Point3D;
  scale: Point3D;
}

export interface RenderingOutput {
  id: string;
  photoRealisticImages: string[];
  vrPanorama: string;
  technicalDrawings: string[];
  lightingAnalysis: LightingAnalysis;
}

export interface LightingAnalysis {
  naturalLight: number;
  artificialLight: number;
  shadowAnalysis: string;
}

export interface ProcurementPlan {
  id: string;
  bom: BillOfMaterials;
  supplierMatches: SupplierMatch[];
  costEstimate: CostEstimate;
  contractorRecommendations: Contractor[];
}

export interface BillOfMaterials {
  materials: MaterialItem[];
  furniture: FurnitureItem[];
  fixtures: FixtureItem[];
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specifications: string;
  estimatedCost: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  modelId: string;
  quantity: number;
  estimatedCost: number;
  supplierId: string;
}

export interface SupplierMatch {
  supplierId: string;
  name: string;
  location: string;
  rating: number;
  deliveryTime: string;
  compatibilityScore: number;
}

export interface CostEstimate {
  total: number;
  breakdown: Record<string, number>;
  currency: string;
}

export interface Contractor {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  availability: string;
  estimatedTimeline: string;
}