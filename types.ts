
export enum FoundationType {
  NONE = 'none',
  SINGLE = 'single',
  STRIP = 'strip',
  PILE = 'pile'
}

export enum BasementType {
  NONE = 'none',
  LEVEL_1 = 'level1', // < 1.5m
  LEVEL_2 = 'level2', // 1.5m - 1.7m
  LEVEL_3 = 'level3'  // > 1.7m
}

export enum RoofType {
  NONE = 'none',
  SHEET_METAL = 'sheet_metal',
  CONCRETE = 'concrete',
  TILE_STEEL = 'tile_steel',
  THAI_ROOF = 'thai_roof',
  JAPAN_ROOF = 'japan_roof'
}

export enum PackageTier {
  ROUGH = 'rough',
  STANDARD = 'standard',
  GOOD = 'good',
  PREMIUM = 'premium',
  CUSTOM = 'custom'
}

export interface CalculationInputs {
  width: number;
  length: number;
  foundation: FoundationType;
  foundationCoeff: number;
  basement: BasementType;
  basementCoeff: number;
  numFloors: number;
  floorCoeff: number;
  hasTerrace: boolean;
  terraceCoeff: number;
  roof: RoofType;
  roofCoeff: number;
  packageTier: PackageTier;
  customUnitPrice: number;
}

export interface ComponentBreakdown {
  label: string;
  coeff: number;
  area: number;
  cost: number;
  color: string;
}

export interface CalculationResult {
  baseArea: number;
  totalWeightedArea: number;
  unitPrice: number;
  totalCost: number;
  breakdown: ComponentBreakdown[];
}
