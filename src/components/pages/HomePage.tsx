import React from 'react';
import { useTheme, HomeDesignVariant } from '../../context/ThemeContext';
import { HomeDesign1 } from './HomeDesign1';
import { HomeDesign2 } from './HomeDesign2';
import { HomeDesign3 } from './HomeDesign3';
import { Layout, Check, Sparkles, Layers } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { homeVariant, setHomeVariant } = useTheme();

  const variants: { id: HomeDesignVariant; title: string; desc: string; pageLabel: string }[] = [
    {
      id: 'design1',
      title: 'Design 1 — Minimal Magazine',
      desc: 'Split hero with arched photography, 4 category icons, & Swiss Alps editorial card',
      pageLabel: 'PDF Page 1 - Style 1'
    },
    {
      id: 'design2',
      title: 'Clean Editorial',
      desc: 'Immersive full-bleed alpine hero & 3 large rounded category cards',
      pageLabel: 'PDF Page 1 - Style 2'
    },
    {
      id: 'design3',
      title: 'Modern Card Style',
      desc: 'Asymmetric layout, dark Amalfi Coast card, stacked secondary features & script stamp',
      pageLabel: 'PDF Page 1 - Style 3'
    },
  ];

  return (
    <div className="relative">
      
      {/* Floating / Sticky Layout Switcher Bar (Directly honoring Page 1's 3 designs) */}
      <div className="mb-8 p-2 sm:p-2.5 bg-white/80 backdrop-blur-md border border-[#EAE5DF] rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-[#6B6355]">
          <Layers className="w-4 h-4 text-[#E8734A]" />
          <span className="font-bold text-[#1E1B18] font-serif">Designer Layout:</span>
          <span className="text-[11px] text-[#8C8477] hidden md:inline">Switch between the 3 homepage designs in Page 1</span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {variants.map((v) => {
            const active = homeVariant === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setHomeVariant(v.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#E8734A] text-white font-bold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#554E42] hover:bg-[#F2ECE4] border border-[#E5E0D8]'
                }`}
                title={v.desc}
              >
                <span>{v.title}</span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Variant */}
      <div className="transition-all duration-300">
        {homeVariant === 'design1' && <HomeDesign1 />}
        {homeVariant === 'design2' && <HomeDesign2 />}
        {homeVariant === 'design3' && <HomeDesign3 />}
      </div>
    </div>
  );
};
