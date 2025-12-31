
import React, { useState, useEffect, useRef } from 'react';
import { 
  CalculationInputs, 
  CalculationResult, 
  FoundationType, 
  BasementType, 
  RoofType, 
  PackageTier,
  ComponentBreakdown
} from './types';
import { LABELS, DEFAULT_FOUNDATION_COEFFS, DEFAULT_BASEMENT_COEFFS, DEFAULT_ROOF_COEFFS, PACKAGE_PRICES } from './constants';
import { calculateEstimate, formatCurrency, formatArea } from './services/calculationService';

// Component Tooltip thu gọn
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <svg className="w-3.5 h-3.5 text-slate-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2.5 bg-slate-900 text-white text-[10px] leading-snug rounded-xl shadow-2xl z-50 border border-white/10 backdrop-blur-md">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    const duration = 1000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = (t: number) => 1 - (--t) * t * t * t;
      const current = Math.floor(start + (end - start) * easeOutQuart(progress));
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        prevValueRef.current = end;
      }
    };
    requestAnimationFrame(update);
  }, [value]);

  return <span>{formatCurrency(displayValue).replace('₫', '')}</span>;
};

const DonutChart: React.FC<{ breakdown: ComponentBreakdown[], total: number }> = ({ breakdown, total }) => {
  let currentAngle = -90;
  return (
    <div className="relative w-44 h-44 md:w-52 md:h-52 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-sm">
        {breakdown.map((item, i) => {
          const percentage = (item.cost / total) * 100;
          if (percentage <= 0) return null;
          const angle = (percentage / 100) * 360;
          const x1 = 50 + 44 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 44 * Math.sin((currentAngle * Math.PI) / 180);
          currentAngle += angle;
          const x2 = 50 + 44 * Math.cos((currentAngle * Math.PI) / 180);
          const y2 = 50 + 44 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArcFlag = angle > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 44 44 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill={item.color}
              className="transition-all duration-700 hover:opacity-90 stroke-white stroke-[0.8]"
            />
          );
        })}
        <circle cx="50" cy="50" r="32" fill="white" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-[11px] font-black text-[#7b1016] leading-none uppercase tracking-widest border-b border-[#7b1016]/20 pb-1">Dự toán</span>
      </div>
    </div>
  );
};

const PackageCard: React.FC<{ 
  tier: PackageTier, 
  label: string, 
  price: number, 
  selected: boolean, 
  onSelect: () => void 
}> = ({ tier, label, price, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`group relative flex flex-col p-5 md:p-6 rounded-2xl border-2 transition-all duration-500 text-left h-full ${
      selected 
        ? 'border-[#7b1016] bg-white ring-8 ring-[#7b1016]/5 shadow-xl scale-[1.02] z-10' 
        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
    }`}
  >
    <div className={`text-[10px] font-bold uppercase mb-2 tracking-[0.2em] ${selected ? 'text-[#7b1016]' : 'text-slate-400'}`}>
       Gói thầu
    </div>
    <div className={`text-[15px] md:text-[16px] font-black mb-2.5 leading-tight ${selected ? 'text-slate-900' : 'text-slate-700'}`}>
      {label}
    </div>
    
    {tier !== PackageTier.CUSTOM ? (
      <div className="mt-auto">
        <div className={`text-[18px] md:text-[20px] font-black ${selected ? 'text-[#7b1016]' : 'text-slate-900'}`}>
          {formatCurrency(price).replace('₫', '')}
          <span className="text-[11px] font-bold text-slate-400 ml-1.5 opacity-50">/m²</span>
        </div>
      </div>
    ) : (
      <div className="mt-auto flex items-center space-x-2 text-[11px] font-bold italic text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        <span>Tùy chỉnh đơn giá</span>
      </div>
    )}
  </button>
);

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    width: 0,
    length: 0,
    foundation: FoundationType.PILE,
    foundationCoeff: DEFAULT_FOUNDATION_COEFFS[FoundationType.PILE],
    basement: BasementType.NONE,
    basementCoeff: 0,
    numFloors: 0,
    floorCoeff: 100,
    hasTerrace: false,
    terraceCoeff: 50,
    roof: RoofType.CONCRETE,
    roofCoeff: DEFAULT_ROOF_COEFFS[RoofType.CONCRETE],
    packageTier: PackageTier.STANDARD,
    customUnitPrice: 5000000,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (['width', 'length', 'numFloors', 'foundationCoeff', 'basementCoeff', 'floorCoeff', 'terraceCoeff', 'roofCoeff', 'customUnitPrice'].includes(name)) {
      val = value === '' ? 0 : Number(value);
    }

    setInputs(prev => {
      const next = { ...prev, [name]: val };
      if (e.target.tagName === 'SELECT') {
        if (name === 'foundation') next.foundationCoeff = DEFAULT_FOUNDATION_COEFFS[val as FoundationType];
        if (name === 'basement') next.basementCoeff = DEFAULT_BASEMENT_COEFFS[val as BasementType];
        if (name === 'roof') next.roofCoeff = DEFAULT_ROOF_COEFFS[val as RoofType];
      }
      return next;
    });
  };

  useEffect(() => {
    if (inputs.width > 0 && inputs.length > 0 && inputs.numFloors > 0) {
      setResult(calculateEstimate(inputs));
    } else {
      setResult(null);
    }
  }, [inputs]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] font-sans text-slate-900 selection:bg-[#7b1016]/10 selection:text-[#7b1016]">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 shrink-0 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#7b1016] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#7b1016]/20">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase leading-none">Dự toán Premium</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">Kiến tạo công trình bền vững</p>
            </div>
          </div>
          <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest hidden md:block border-l border-slate-100 pl-6 h-10 flex items-center">
            Construction AI Experience 2026
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* CỘT TRÁI: DỮ LIỆU ĐẦU VÀO (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {/* 01: KÍCH THƯỚC */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60 relative group">
                  <div className="flex items-center mb-8">
                    <span className="w-8 h-8 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center text-[12px] font-black mr-4 border border-slate-100 group-hover:bg-[#7b1016] group-hover:text-white group-hover:border-[#7b1016] transition-all duration-300">01</span>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Kích thước & Quy mô</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Rộng (m)</label>
                      <input name="width" type="number" step="0.1" value={inputs.width || ''} onChange={handleInputChange} placeholder="---" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-[#7b1016] focus:bg-white focus:ring-4 focus:ring-[#7b1016]/5 rounded-2xl outline-none font-black text-base transition-all placeholder:text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Dài (m)</label>
                      <input name="length" type="number" step="0.1" value={inputs.length || ''} onChange={handleInputChange} placeholder="---" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-[#7b1016] focus:bg-white focus:ring-4 focus:ring-[#7b1016]/5 rounded-2xl outline-none font-black text-base transition-all placeholder:text-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Số tầng nổi</label>
                      <input name="numFloors" type="number" value={inputs.numFloors || ''} onChange={handleInputChange} placeholder="---" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-[#7b1016] focus:bg-white focus:ring-4 focus:ring-[#7b1016]/5 rounded-2xl outline-none font-black text-base text-center transition-all placeholder:text-slate-200" />
                    </div>
                  </div>
                </section>

                {/* 02: KỸ THUẬT */}
                <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60 group">
                  <div className="flex items-center mb-8">
                    <span className="w-8 h-8 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center text-[12px] font-black mr-4 border border-slate-100 group-hover:bg-[#7b1016] group-hover:text-white transition-all duration-300">02</span>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Kỹ thuật xây dựng</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                    {/* Hạng mục Móng */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">Hệ móng <InfoTooltip text="Hệ số % tính trên tổng diện tích sàn một tầng. Tự động cập nhật khi thay đổi loại móng." /></label>
                      <select name="foundation" value={inputs.foundation} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[13px] outline-none hover:bg-slate-100 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22m1%201%206%206%206-6%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1.25rem_center] bg-no-repeat">
                        {Object.entries(LABELS.foundation).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <div className="flex items-center justify-between px-2 bg-slate-50/50 py-2 rounded-xl border border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hệ số %</span>
                        <div className="flex items-center space-x-1">
                          <input name="foundationCoeff" type="number" value={inputs.foundationCoeff || ''} onChange={handleInputChange} className="w-10 text-right bg-transparent outline-none font-black text-[#7b1016]" />
                          <span className="text-slate-300 font-bold text-[10px]">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Hạng mục Hầm */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center ml-1">Tầng hầm <InfoTooltip text="Độ sâu của hầm càng lớn thì chi phí gia cố và đào đắp càng cao." /></label>
                      <select name="basement" value={inputs.basement} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[13px] outline-none hover:bg-slate-100 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22m1%201%206%206%206-6%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1.25rem_center] bg-no-repeat">
                        {Object.entries(LABELS.basement).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <div className="flex items-center justify-between px-2 bg-slate-50/50 py-2 rounded-xl border border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hệ số %</span>
                        <div className="flex items-center space-x-1">
                          <input name="basementCoeff" type="number" value={inputs.basementCoeff || ''} onChange={handleInputChange} className="w-10 text-right bg-transparent outline-none font-black text-[#7b1016]" />
                          <span className="text-slate-300 font-bold text-[10px]">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Hạng mục Mái */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Kiến trúc mái</label>
                      <select name="roof" value={inputs.roof} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[13px] outline-none hover:bg-slate-100 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22m1%201%206%206%206-6%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1.25rem_center] bg-no-repeat">
                        {Object.entries(LABELS.roof).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <div className="flex items-center justify-between px-2 bg-slate-50/50 py-2 rounded-xl border border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hệ số %</span>
                        <div className="flex items-center space-x-1">
                          <input name="roofCoeff" type="number" value={inputs.roofCoeff || ''} onChange={handleInputChange} className="w-10 text-right bg-transparent outline-none font-black text-[#7b1016]" />
                          <span className="text-slate-300 font-bold text-[10px]">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Hạng mục Sân thượng */}
                    <div className="space-y-3 flex flex-col justify-end">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center ml-1 mb-1">
                        Sân thượng
                        <input name="hasTerrace" type="checkbox" checked={inputs.hasTerrace} onChange={handleInputChange} className="w-5 h-5 accent-[#7b1016] rounded-md cursor-pointer" />
                      </label>
                      <div className={`flex items-center justify-between px-2 bg-slate-50/50 py-2 rounded-xl border border-slate-50 transition-all duration-300 ${inputs.hasTerrace ? 'opacity-100' : 'opacity-20 select-none'}`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Hệ số %</span>
                        <div className="flex items-center space-x-1">
                          <input name="terraceCoeff" type="number" value={inputs.terraceCoeff || ''} onChange={handleInputChange} className="w-10 text-right bg-transparent outline-none font-black text-[#7b1016]" disabled={!inputs.hasTerrace} />
                          <span className="text-slate-300 font-bold text-[10px]">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* 03: GÓI THẦU */}
              <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/60 group">
                <div className="flex items-center mb-8">
                  <span className="w-8 h-8 bg-[#7b1016]/5 text-[#7b1016] rounded-lg flex items-center justify-center text-[12px] font-black mr-4 border border-[#7b1016]/10">03</span>
                  <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Gói thầu thi công</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {Object.entries(LABELS.package).map(([tier, label]) => (
                    <PackageCard 
                      key={tier}
                      tier={tier as PackageTier}
                      label={label}
                      price={PACKAGE_PRICES[tier as PackageTier]}
                      selected={inputs.packageTier === tier}
                      onSelect={() => setInputs(p => ({...p, packageTier: tier as PackageTier}))}
                    />
                  ))}
                </div>
                {inputs.packageTier === PackageTier.CUSTOM && (
                  <div className="mt-8 p-7 bg-slate-50/50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3 ml-1">Nhập đơn giá thi công riêng (VNĐ/m²)</label>
                    <div className="relative">
                      <input ref={customInputRef} name="customUnitPrice" type="number" value={inputs.customUnitPrice || ''} onChange={handleInputChange} placeholder="---" className="w-full bg-white px-8 py-5 rounded-[1.5rem] border border-slate-200 text-[#7b1016] font-black text-3xl outline-none shadow-sm focus:ring-8 focus:ring-[#7b1016]/5 focus:border-[#7b1016] transition-all" />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm uppercase">VNĐ/m²</span>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* CỘT PHẢI: KẾT QUẢ & PHÂN TÍCH (lg:col-span-4) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
              
              {/* CARD TỔNG CỘNG */}
              <div className="bg-[#121214] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#7b1016] opacity-10 rounded-full blur-[60px] -mr-24 -mt-24 transition-all duration-1000 group-hover:opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-500 opacity-5 rounded-full blur-[40px] -ml-16 -mb-16"></div>
                  
                  <div className="relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Dự toán tổng thể</p>
                    <div className="flex items-baseline space-x-2">
                      <h2 className="text-3xl md:text-4xl xl:text-5xl font-black tracking-tighter text-white">
                        {result ? <AnimatedNumber value={result.totalCost} /> : '0'}
                      </h2>
                      <span className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">VNĐ</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-white/10">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Diện tích sàn</p>
                        <p className="text-[15px] font-black text-white">{result ? formatArea(result.baseArea) : '--'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tổng DT XD</p>
                        <p className="text-[15px] font-black text-white/90">{result ? formatArea(result.totalWeightedArea) : '--'}</p>
                      </div>
                    </div>
                  </div>
              </div>

              {/* PHÂN TÍCH CHI TIẾT */}
              {result ? (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Cấu trúc chi phí</h3>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Đơn giá TB</p>
                      <p className="text-[16px] font-black text-[#7b1016] leading-none">{formatCurrency(result.unitPrice)}<span className="text-[10px] ml-0.5">/m²</span></p>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="flex justify-center">
                      <DonutChart breakdown={result.breakdown} total={result.totalCost} />
                    </div>
                    
                    <div className="space-y-5">
                      {result.breakdown.map((item, idx) => (
                        <div key={idx} className="space-y-2 group">
                          <div className="flex justify-between items-center text-[11px] font-black">
                            <span className="text-slate-500 truncate mr-4 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.label}</span>
                            <span className="text-slate-900 shrink-0 font-black">{((item.cost / result.totalCost) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                             <div className="h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" style={{ width: `${(item.cost / result.totalCost) * 100}%`, backgroundColor: item.color }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border-2 border-slate-100 border-dashed flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Đang chờ dữ liệu</h4>
                  <p className="text-[11px] font-bold text-slate-300 leading-relaxed uppercase tracking-tight">Vui lòng hoàn tất mục 01 để kích hoạt<br/>phân tích dự toán chi tiết</p>
                </div>
              )}

              {/* DISCLAIMER */}
              <div className="p-5 bg-slate-50/80 backdrop-blur-sm rounded-2xl flex items-start space-x-4 border border-slate-100">
                 <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
                   Kết quả mang tính chất tham khảo. Dự toán chính xác cần dựa trên hồ sơ thiết kế kỹ thuật thi công và bảng dự toán vật tư chi tiết.
                 </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 px-8 py-6 shrink-0 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center opacity-40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] leading-none mb-4 md:mb-0">Dự toán Xây dựng Premium • Professional Edition</p>
          <div className="flex space-x-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vietnam 2026</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Arch Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
