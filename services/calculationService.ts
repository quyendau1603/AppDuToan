
import { 
  CalculationInputs, 
  CalculationResult, 
  ComponentBreakdown, 
  FoundationType, 
  BasementType, 
  RoofType, 
  PackageTier 
} from '../types';
import { 
  PACKAGE_PRICES,
  LABELS,
  BREAKDOWN_COLORS
} from '../constants';

export const calculateEstimate = (inputs: CalculationInputs): CalculationResult => {
  const baseArea = inputs.width * inputs.length;
  const unitPrice = inputs.packageTier === PackageTier.CUSTOM 
    ? inputs.customUnitPrice 
    : PACKAGE_PRICES[inputs.packageTier];
    
  const breakdown: ComponentBreakdown[] = [];
  let colorIdx = 0;

  // 1. Foundation - Tính cho tất cả các trường hợp
  if (inputs.foundation !== FoundationType.NONE) {
    const coeff = inputs.foundationCoeff / 100;
    const area = baseArea * coeff;
    breakdown.push({
      label: `Móng (${LABELS.foundation[inputs.foundation]})`,
      coeff,
      area,
      cost: area * unitPrice,
      color: BREAKDOWN_COLORS[colorIdx++ % BREAKDOWN_COLORS.length]
    });
  }

  // 2. Basement
  if (inputs.basement !== BasementType.NONE) {
    const coeff = inputs.basementCoeff / 100;
    const area = baseArea * coeff;
    breakdown.push({
      label: `Hầm (${LABELS.basement[inputs.basement]})`,
      coeff,
      area,
      cost: area * unitPrice,
      color: BREAKDOWN_COLORS[colorIdx++ % BREAKDOWN_COLORS.length]
    });
  }

  // 3. Floors
  const fCoeff = inputs.floorCoeff / 100;
  const floorsCoeffTotal = inputs.numFloors * fCoeff;
  const floorsArea = baseArea * floorsCoeffTotal;
  breakdown.push({
    label: `Diện tích các tầng (${inputs.numFloors} sàn)`,
    coeff: floorsCoeffTotal,
    area: floorsArea,
    cost: floorsArea * unitPrice,
    color: BREAKDOWN_COLORS[colorIdx++ % BREAKDOWN_COLORS.length]
  });

  // 4. Terrace
  if (inputs.hasTerrace) {
    const coeff = inputs.terraceCoeff / 100;
    const area = baseArea * coeff;
    breakdown.push({
      label: `Sân thượng`,
      coeff,
      area,
      cost: area * unitPrice,
      color: BREAKDOWN_COLORS[colorIdx++ % BREAKDOWN_COLORS.length]
    });
  }

  // 5. Roof
  if (inputs.roof !== RoofType.NONE) {
    const coeff = inputs.roofCoeff / 100;
    const area = baseArea * coeff;
    breakdown.push({
      label: `Mái (${LABELS.roof[inputs.roof]})`,
      coeff,
      area,
      cost: area * unitPrice,
      color: BREAKDOWN_COLORS[colorIdx++ % BREAKDOWN_COLORS.length]
    });
  }

  const totalWeightedArea = breakdown.reduce((acc, item) => acc + item.area, 0);
  const totalCost = totalWeightedArea * unitPrice;

  return {
    baseArea,
    totalWeightedArea,
    unitPrice,
    totalCost,
    breakdown
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatArea = (area: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2
  }).format(area) + ' m²';
};
