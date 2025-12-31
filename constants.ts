
import { FoundationType, BasementType, RoofType, PackageTier } from './types';

export const DEFAULT_FOUNDATION_COEFFS: Record<FoundationType, number> = {
  [FoundationType.NONE]: 0,
  [FoundationType.SINGLE]: 30,
  [FoundationType.STRIP]: 50,
  [FoundationType.PILE]: 40
};

export const DEFAULT_BASEMENT_COEFFS: Record<BasementType, number> = {
  [BasementType.NONE]: 0,
  [BasementType.LEVEL_1]: 150,
  [BasementType.LEVEL_2]: 170,
  [BasementType.LEVEL_3]: 200
};

export const DEFAULT_ROOF_COEFFS: Record<RoofType, number> = {
  [RoofType.NONE]: 0,
  [RoofType.SHEET_METAL]: 30,
  [RoofType.CONCRETE]: 50,
  [RoofType.TILE_STEEL]: 70,
  [RoofType.THAI_ROOF]: 100,
  [RoofType.JAPAN_ROOF]: 80
};

export const PACKAGE_PRICES: Record<PackageTier, number> = {
  [PackageTier.ROUGH]: 3500000,
  [PackageTier.STANDARD]: 4750000,
  [PackageTier.GOOD]: 5500000,
  [PackageTier.PREMIUM]: 6500000,
  [PackageTier.CUSTOM]: 0
};

export const BREAKDOWN_COLORS = [
  '#7b1016', // Primary Brand Red
  '#a52a2a', // Brownish Red
  '#d48806', // High-contrast Gold
  '#334155', // Slate Grey 700
  '#0f172a', // Slate Grey 900
  '#52525b', // Zinc Grey
];

export const LABELS = {
  foundation: {
    [FoundationType.NONE]: 'Không làm móng',
    [FoundationType.SINGLE]: 'Móng đơn',
    [FoundationType.STRIP]: 'Móng băng',
    [FoundationType.PILE]: 'Móng cọc'
  },
  basement: {
    [BasementType.NONE]: 'Không tầng hầm',
    [BasementType.LEVEL_1]: 'Hầm nông (< 1.5m)',
    [BasementType.LEVEL_2]: 'Hầm trung (1.5m-1.7m)',
    [BasementType.LEVEL_3]: 'Hầm sâu (> 1.7m)'
  },
  roof: {
    [RoofType.NONE]: 'Không mái',
    [RoofType.SHEET_METAL]: 'Mái tôn',
    [RoofType.CONCRETE]: 'Mái bê tông cốt thép',
    [RoofType.TILE_STEEL]: 'Mái ngói hệ khung sắt',
    [RoofType.THAI_ROOF]: 'Mái kiểu Thái',
    [RoofType.JAPAN_ROOF]: 'Mái kiểu Nhật'
  },
  package: {
    [PackageTier.ROUGH]: 'Xây dựng phần Thô',
    [PackageTier.STANDARD]: 'Gói Tiêu chuẩn',
    [PackageTier.GOOD]: 'Gói Khá',
    [PackageTier.PREMIUM]: 'Gói Cao cấp',
    [PackageTier.CUSTOM]: 'Tự nhập đơn giá'
  }
};
