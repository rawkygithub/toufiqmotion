import React, { useEffect } from 'react';
import { useTheme, AmbientLightingMode } from '../context/ThemeContext';
import { Sun, Sparkles, Check, X } from 'lucide-react';

export interface LightPresetConfig {
  id: AmbientLightingMode;
  name: string;
  tagline: string;
  icon: string;
  previewColor: string;
  accentColor: string;
  accentHover: string;
  accentBg: string;
  canvasBg: string;
  badgeText: string;
}

export const PRESETS: LightPresetConfig[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    tagline: 'Warm sunset honey & sunlit peach illumination',
    icon: '🌅',
    previewColor: 'from-amber-400 via-orange-400 to-rose-400',
    accentColor: '#E8734A',
    accentHover: '#D56237',
    accentBg: '#FFF3EC',
    canvasBg: '#FAF7F2',
    badgeText: '#C85228'
  },
  {
    id: 'morning-dew',
    name: 'Morning Dew',
    tagline: 'Fresh champagne & ethereal botanic morning mist',
    icon: '🌿',
    previewColor: 'from-emerald-400 via-teal-400 to-cyan-400',
    accentColor: '#0D9488',
    accentHover: '#0F766E',
    accentBg: '#ECFDF5',
    canvasBg: '#F1F7F4',
    badgeText: '#065F46'
  },
  {
    id: 'sunset-ember',
    name: 'Sunset Ember',
    tagline: 'Velvet dusk terracotta & romantic rose twilight',
    icon: '🌄',
    previewColor: 'from-rose-400 via-fuchsia-500 to-purple-600',
    accentColor: '#C026D3',
    accentHover: '#A21CAF',
    accentBg: '#FDF2F8',
    canvasBg: '#F7F1F6',
    badgeText: '#9D174D'
  },
  {
    id: 'candlelight',
    name: 'Candlelight',
    tagline: 'Intimate bronze hearth & warm cozy flicker',
    icon: '🕯️',
    previewColor: 'from-amber-500 via-yellow-500 to-amber-600',
    accentColor: '#D97706',
    accentHover: '#B45309',
    accentBg: '#FEF3C7',
    canvasBg: '#F9F4EB',
    badgeText: '#92400E'
  },
  {
    id: 'clean-studio',
    name: 'Studio Minimal',
    tagline: 'Pristine neutral high-fashion architectural gallery',
    icon: '🏛️',
    previewColor: 'from-slate-300 via-gray-400 to-slate-500',
    accentColor: '#475569',
    accentHover: '#1E293B',
    accentBg: '#F1F5F9',
    canvasBg: '#F8FAFC',
    badgeText: '#334155'
  }
];

export const InsideLightEffect: React.FC = () => {
  const {
    ambientLight,
    setAmbientLight,
    lightIntensity,
    setLightIntensity,
    isLightControlOpen,
    setIsLightControlOpen
  } = useTheme();

  const currentPreset = PRESETS.find((p) => p.id === ambientLight) || PRESETS[0];

  // Dynamic alpha based on user warmth slider (15% to 100%)
  const alpha = Math.max(0.15, lightIntensity / 100);

  // Sync background canvas color and CSS variables onto document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = currentPreset.canvasBg;
      document.body.style.transition = 'background-color 800ms cubic-bezier(0.4, 0, 0.2, 1)';

      const root = document.documentElement;
      root.style.setProperty('--theme-accent', currentPreset.accentColor);
      root.style.setProperty('--theme-accent-hover', currentPreset.accentHover);
      root.style.setProperty('--theme-accent-light', currentPreset.accentBg);
      root.style.setProperty('--theme-canvas', currentPreset.canvasBg);
    }
  }, [currentPreset]);

  // Compute atmospheric gradients based on active preset and intensity
  const getGradients = () => {
    switch (ambientLight) {
      case 'morning-dew':
        return {
          overheadWash: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(52, 211, 153, ${0.45 * alpha}) 0%, rgba(20, 184, 166, ${0.25 * alpha}) 50%, transparent 80%)`,
          softLightBlend: `radial-gradient(circle at 75% 20%, rgba(110, 231, 183, ${0.35 * alpha}) 0%, rgba(13, 148, 136, ${0.15 * alpha}) 50%, transparent 75%)`,
          orb1: `radial-gradient(circle, rgba(110, 231, 183, ${0.5 * alpha}) 0%, rgba(13, 148, 136, ${0.25 * alpha}) 50%, transparent 75%)`,
          orb2: `radial-gradient(circle, rgba(167, 243, 208, ${0.55 * alpha}) 0%, rgba(6, 182, 212, ${0.2 * alpha}) 50%, transparent 75%)`,
          orb3: `radial-gradient(circle, rgba(45, 212, 191, ${0.4 * alpha}) 0%, transparent 70%)`,
          vignette: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(13, 148, 136, ${0.08 * alpha}) 100%)`
        };
      case 'sunset-ember':
        return {
          overheadWash: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(244, 63, 94, ${0.45 * alpha}) 0%, rgba(192, 38, 211, ${0.25 * alpha}) 50%, transparent 80%)`,
          softLightBlend: `radial-gradient(circle at 75% 20%, rgba(251, 113, 133, ${0.35 * alpha}) 0%, rgba(192, 38, 211, ${0.18 * alpha}) 50%, transparent 75%)`,
          orb1: `radial-gradient(circle, rgba(251, 113, 133, ${0.5 * alpha}) 0%, rgba(192, 38, 211, ${0.25 * alpha}) 50%, transparent 75%)`,
          orb2: `radial-gradient(circle, rgba(216, 180, 254, ${0.55 * alpha}) 0%, rgba(244, 63, 94, ${0.2 * alpha}) 50%, transparent 75%)`,
          orb3: `radial-gradient(circle, rgba(168, 85, 247, ${0.4 * alpha}) 0%, transparent 70%)`,
          vignette: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(192, 38, 211, ${0.08 * alpha}) 100%)`
        };
      case 'candlelight':
        return {
          overheadWash: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(245, 158, 11, ${0.48 * alpha}) 0%, rgba(217, 119, 6, ${0.28 * alpha}) 50%, transparent 80%)`,
          softLightBlend: `radial-gradient(circle at 75% 20%, rgba(251, 191, 36, ${0.38 * alpha}) 0%, rgba(180, 83, 9, ${0.18 * alpha}) 50%, transparent 75%)`,
          orb1: `radial-gradient(circle, rgba(251, 191, 36, ${0.55 * alpha}) 0%, rgba(217, 119, 6, ${0.28 * alpha}) 50%, transparent 75%)`,
          orb2: `radial-gradient(circle, rgba(253, 230, 138, ${0.6 * alpha}) 0%, rgba(180, 83, 9, ${0.2 * alpha}) 50%, transparent 75%)`,
          orb3: `radial-gradient(circle, rgba(245, 158, 11, ${0.42 * alpha}) 0%, transparent 70%)`,
          vignette: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(217, 119, 6, ${0.09 * alpha}) 100%)`
        };
      case 'clean-studio':
        return {
          overheadWash: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 255, 255, ${0.7 * alpha}) 0%, rgba(226, 232, 240, ${0.35 * alpha}) 50%, transparent 80%)`,
          softLightBlend: `radial-gradient(circle at 75% 20%, rgba(255, 255, 255, ${0.5 * alpha}) 0%, transparent 75%)`,
          orb1: `radial-gradient(circle, rgba(255, 255, 255, ${0.75 * alpha}) 0%, rgba(203, 213, 225, ${0.25 * alpha}) 50%, transparent 75%)`,
          orb2: `radial-gradient(circle, rgba(241, 245, 249, ${0.65 * alpha}) 0%, transparent 70%)`,
          orb3: `radial-gradient(circle, rgba(226, 232, 240, ${0.5 * alpha}) 0%, transparent 70%)`,
          vignette: `radial-gradient(circle at 50% 50%, transparent 70%, rgba(148, 163, 184, ${0.05 * alpha}) 100%)`
        };
      case 'golden-hour':
      default:
        return {
          overheadWash: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(246, 173, 85, ${0.45 * alpha}) 0%, rgba(232, 115, 74, ${0.22 * alpha}) 50%, transparent 80%)`,
          softLightBlend: `radial-gradient(circle at 75% 20%, rgba(254, 215, 170, ${0.35 * alpha}) 0%, rgba(249, 115, 22, ${0.15 * alpha}) 50%, transparent 75%)`,
          orb1: `radial-gradient(circle, rgba(246, 173, 85, ${0.5 * alpha}) 0%, rgba(232, 115, 74, ${0.25 * alpha}) 50%, transparent 75%)`,
          orb2: `radial-gradient(circle, rgba(254, 215, 170, ${0.55 * alpha}) 0%, rgba(249, 115, 22, ${0.2 * alpha}) 50%, transparent 75%)`,
          orb3: `radial-gradient(circle, rgba(251, 146, 60, ${0.4 * alpha}) 0%, transparent 70%)`,
          vignette: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(232, 115, 74, ${0.08 * alpha}) 100%)`
        };
    }
  };

  const gradients = getGradients();

  return (
    <>
      {/* 1. VISIBLE OVERHEAD ATMOSPHERIC LIGHT WASH (Cast over top hero, navigation, and cards) */}
      <div
        className="fixed top-0 left-0 right-0 h-[650px] pointer-events-none z-10 transition-all duration-800 ease-out"
        style={{
          background: gradients.overheadWash
        }}
      />

      {/* 2. SOFT-LIGHT BLEND LAYER (Smoothly tints image lighting & ambient tone) */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-all duration-800 ease-out"
        style={{
          background: gradients.softLightBlend,
          mixBlendMode: 'soft-light'
        }}
      />

      {/* 3. PERIMETER EYE-SMOOTH VIGNETTE */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-all duration-800 ease-out"
        style={{
          background: gradients.vignette
        }}
      />

      {/* 4. DYNAMIC BACKGROUND GLOW ORBS (Z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-800 ease-out">
        {/* Top/Left Orb */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full blur-[90px] transition-all duration-800 animate-pulse"
          style={{ background: gradients.orb1, animationDuration: '9s' }}
        />
        {/* Right Mid Orb */}
        <div
          className="absolute top-[25%] -right-[15%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full blur-[100px] transition-all duration-800 animate-pulse"
          style={{ background: gradients.orb2, animationDuration: '12s' }}
        />
        {/* Bottom Ambient Glow */}
        <div
          className="absolute -bottom-[20%] left-[15%] w-[80vw] h-[60vw] max-w-[1000px] max-h-[700px] rounded-full blur-[110px] transition-all duration-800"
          style={{ background: gradients.orb3 }}
        />
      </div>

      {/* 5. FLOATING CONTROLLER PILL & POPOVER */}
      <div className="fixed bottom-6 right-6 z-40">
        
        {/* Floating Pill Button */}
        <button
          onClick={() => setIsLightControlOpen(!isLightControlOpen)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-300 scale-100 hover:scale-105 active:scale-95"
          style={{
            border: `1.5px solid ${currentPreset.accentColor}55`,
            boxShadow: `0 8px 24px -4px ${currentPreset.accentColor}30`
          }}
          title="Adjust the 'Inside Light' ambient lighting"
        >
          {/* Animated Pulsing Colored Dot */}
          <span className="relative flex h-3 w-3">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: currentPreset.accentColor }}
            />
            <span
              className="relative inline-flex rounded-full h-3 w-3"
              style={{ backgroundColor: currentPreset.accentColor }}
            />
          </span>

          <span className="text-xs font-bold tracking-wider flex items-center gap-1.5 uppercase font-sans">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentPreset.accentColor }} />
            <span className="text-[#3D3830]">Inside Light:</span>{' '}
            <span style={{ color: currentPreset.accentColor }}>{currentPreset.name}</span>
          </span>
        </button>

        {/* Ambient Light Control Popover */}
        {isLightControlOpen && (
          <div className="absolute bottom-14 right-0 w-80 bg-white/98 backdrop-blur-2xl border border-[#EAE5DF] rounded-3xl shadow-2xl p-5 text-[#2D2A26] animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: currentPreset.accentBg, color: currentPreset.accentColor }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif text-[#1E1B18]">Ambient Inside Light</h4>
                  <p className="text-[11px] text-[#7A756D]">{currentPreset.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setIsLightControlOpen(false)}
                className="text-[#9E978C] hover:text-[#2D2A26] p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Atmospheric Presets List */}
            <div className="mt-3.5 space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[#8C8477]">
                Atmospheric Presets
              </label>

              <div className="grid grid-cols-1 gap-1.5">
                {PRESETS.map((preset) => {
                  const isActive = ambientLight === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setAmbientLight(preset.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition-all ${
                        isActive
                          ? 'font-bold shadow-xs scale-[1.01]'
                          : 'hover:bg-[#FAF8F5] text-[#4A453E] border border-transparent'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: preset.accentBg,
                              border: `1.5px solid ${preset.accentColor}60`,
                              color: preset.accentColor
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{preset.icon}</span>
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full bg-gradient-to-tr ${preset.previewColor} shadow-inner inline-block ring-1 ring-black/10`}
                        />
                        {isActive && <Check className="w-4 h-4" style={{ color: preset.accentColor }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warmth & Glow Intensity Slider */}
            <div className="mt-4 pt-3.5 border-t border-[#F0ECE6]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[10px] font-bold text-[#8C8477] uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" style={{ color: currentPreset.accentColor }} /> Light Warmth &amp; Glow
                </span>
                <span
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: currentPreset.accentBg, color: currentPreset.accentColor }}
                >
                  {lightIntensity}%
                </span>
              </div>

              <input
                type="range"
                min="15"
                max="100"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full cursor-pointer h-2 bg-[#EAE5DF] rounded-lg transition-all"
                style={{ accentColor: currentPreset.accentColor }}
              />

              <div className="flex justify-between text-[10px] text-[#9E978C] mt-1 font-medium">
                <span>Subtle (15%)</span>
                <span>Warm Radiance</span>
                <span>Max Glow (100%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
