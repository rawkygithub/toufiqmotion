import React from 'react';
import { useTheme, AmbientLightingMode } from '../context/ThemeContext';
import { Sun, Sparkles, Sliders, Check, Moon, Flame } from 'lucide-react';

export const InsideLightEffect: React.FC = () => {
  const {
    ambientLight,
    setAmbientLight,
    lightIntensity,
    setLightIntensity,
    isLightControlOpen,
    setIsLightControlOpen
  } = useTheme();

  // Color profiles for the ambient "inside light"
  const getLightingStyle = (mode: AmbientLightingMode) => {
    const alpha = (lightIntensity / 100);
    switch (mode) {
      case 'golden-hour':
        return {
          orb1: `radial-gradient(circle at 30% 20%, rgba(246, 173, 85, ${0.35 * alpha}) 0%, rgba(232, 115, 74, ${0.18 * alpha}) 35%, transparent 70%)`,
          orb2: `radial-gradient(circle at 80% 40%, rgba(254, 215, 170, ${0.4 * alpha}) 0%, rgba(249, 115, 22, ${0.12 * alpha}) 40%, transparent 75%)`,
          orb3: `radial-gradient(circle at 50% 85%, rgba(251, 146, 60, ${0.25 * alpha}) 0%, transparent 60%)`,
          subtleGlow: `rgba(232, 115, 74, ${0.04 * alpha})`,
          name: 'Golden Hour',
          desc: 'Warm sunset honey & sunlit peach illumination'
        };
      case 'morning-dew':
        return {
          orb1: `radial-gradient(circle at 25% 25%, rgba(167, 243, 208, ${0.3 * alpha}) 0%, rgba(199, 210, 254, ${0.2 * alpha}) 40%, transparent 70%)`,
          orb2: `radial-gradient(circle at 75% 35%, rgba(254, 240, 138, ${0.3 * alpha}) 0%, rgba(147, 197, 253, ${0.15 * alpha}) 50%, transparent 75%)`,
          orb3: `radial-gradient(circle at 50% 80%, rgba(216, 180, 254, ${0.18 * alpha}) 0%, transparent 60%)`,
          subtleGlow: `rgba(167, 243, 208, ${0.04 * alpha})`,
          name: 'Morning Dew',
          desc: 'Fresh champagne & ethereal botanic morning mist'
        };
      case 'sunset-ember':
        return {
          orb1: `radial-gradient(circle at 35% 15%, rgba(244, 63, 94, ${0.25 * alpha}) 0%, rgba(249, 115, 22, ${0.2 * alpha}) 40%, transparent 70%)`,
          orb2: `radial-gradient(circle at 70% 50%, rgba(168, 85, 247, ${0.22 * alpha}) 0%, rgba(236, 72, 153, ${0.15 * alpha}) 45%, transparent 75%)`,
          orb3: `radial-gradient(circle at 45% 90%, rgba(251, 146, 60, ${0.28 * alpha}) 0%, transparent 65%)`,
          subtleGlow: `rgba(244, 63, 94, ${0.04 * alpha})`,
          name: 'Sunset Ember',
          desc: 'Velvet dusk terracotta & romantic rose twilight'
        };
      case 'candlelight':
        return {
          orb1: `radial-gradient(circle at 50% 20%, rgba(217, 119, 6, ${0.38 * alpha}) 0%, rgba(180, 83, 9, ${0.2 * alpha}) 35%, transparent 70%)`,
          orb2: `radial-gradient(circle at 85% 60%, rgba(245, 158, 11, ${0.28 * alpha}) 0%, transparent 60%)`,
          orb3: `radial-gradient(circle at 15% 75%, rgba(251, 191, 36, ${0.25 * alpha}) 0%, transparent 55%)`,
          subtleGlow: `rgba(217, 119, 6, ${0.05 * alpha})`,
          name: 'Candlelight',
          desc: 'Intimate bronze hearth & warm cozy flicker'
        };
      case 'clean-studio':
      default:
        return {
          orb1: `radial-gradient(circle at 40% 30%, rgba(255, 255, 255, ${0.6 * alpha}) 0%, rgba(229, 231, 235, ${0.2 * alpha}) 40%, transparent 70%)`,
          orb2: `radial-gradient(circle at 70% 60%, rgba(243, 244, 246, ${0.5 * alpha}) 0%, transparent 60%)`,
          orb3: `radial-gradient(circle at 30% 80%, rgba(249, 250, 251, ${0.4 * alpha}) 0%, transparent 60%)`,
          subtleGlow: `rgba(255, 255, 255, 0)`,
          name: 'Clean Gallery',
          desc: 'Pristine neutral high-fashion editorial lighting'
        };
    }
  };

  const style = getLightingStyle(ambientLight);

  const presets: { id: AmbientLightingMode; label: string; icon: string; previewColor: string }[] = [
    { id: 'golden-hour', label: 'Golden Hour', icon: '🌅', previewColor: 'from-amber-400 to-orange-500' },
    { id: 'morning-dew', label: 'Morning Dew', icon: '🌿', previewColor: 'from-emerald-300 to-teal-400' },
    { id: 'sunset-ember', label: 'Sunset Ember', icon: '🌄', previewColor: 'from-rose-400 to-purple-500' },
    { id: 'candlelight', label: 'Candlelight', icon: '🕯️', previewColor: 'from-amber-500 to-yellow-600' },
    { id: 'clean-studio', label: 'Studio Minimal', icon: '🏛️', previewColor: 'from-stone-200 to-stone-400' },
  ];

  return (
    <>
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-out">
        {/* Top/Left Orb */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full blur-[90px] transition-all duration-1000 animate-pulse"
          style={{ background: style.orb1, animationDuration: '8s' }}
        />
        {/* Right Mid Orb */}
        <div
          className="absolute top-[25%] -right-[15%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full blur-[100px] transition-all duration-1000 animate-pulse"
          style={{ background: style.orb2, animationDuration: '11s' }}
        />
        {/* Bottom Ambient Glow */}
        <div
          className="absolute -bottom-[20%] left-[15%] w-[80vw] h-[60vw] max-w-[1000px] max-h-[700px] rounded-full blur-[110px] transition-all duration-1000"
          style={{ background: style.orb3 }}
        />
        {/* Micro subtle canvas tint */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{ backgroundColor: style.subtleGlow }}
        />
      </div>

      {/* Floating Eye-Smooth "Inside Light" Controller Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsLightControlOpen(!isLightControlOpen)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-md border border-[#E8734A]/30 text-[#2D2A26] rounded-full shadow-lg hover:shadow-xl hover:border-[#E8734A] transition-all duration-300 scale-100 hover:scale-105 active:scale-95"
          title="Adjust the 'Inside Light' ambient lighting"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8734A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E8734A]"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5 uppercase font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" />
            Inside Light: <span className="text-[#E8734A]">{style.name}</span>
          </span>
        </button>

        {/* Ambient Light Control Popover */}
        {isLightControlOpen && (
          <div className="absolute bottom-14 right-0 w-80 bg-white/95 backdrop-blur-xl border border-[#EAE5DF] rounded-2xl shadow-2xl p-5 text-[#2D2A26] animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-serif">Ambient Inside Light</h4>
                  <p className="text-[11px] text-[#7A756D]">Fine-tune the mood & eye-smooth glow</p>
                </div>
              </div>
              <button
                onClick={() => setIsLightControlOpen(false)}
                className="text-[#9E978C] hover:text-[#2D2A26] text-xs px-2 py-1 rounded hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            {/* Presets List */}
            <div className="mt-3.5 space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#8C8477]">
                Atmospheric Presets
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {presets.map((preset) => {
                  const isActive = ambientLight === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setAmbientLight(preset.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                        isActive
                          ? 'bg-[#FFF3EC] border border-[#E8734A]/40 text-[#C85228] font-semibold shadow-xs'
                          : 'hover:bg-[#FAF8F5] text-[#4A453E] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{preset.icon}</span>
                        <div>
                          <div className="font-medium">{preset.label}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${preset.previewColor} shadow-inner inline-block`} />
                        {isActive && <Check className="w-3.5 h-3.5 text-[#E8734A]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="mt-4 pt-3 border-t border-[#F0ECE6]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[11px] font-semibold text-[#8C8477] uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-3 h-3 text-[#E8734A]" /> Light Warmth & Glow
                </span>
                <span className="font-mono text-xs text-[#E8734A] font-bold">{lightIntensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full accent-[#E8734A] cursor-pointer h-1.5 bg-[#EAE5DF] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#9E978C] mt-1">
                <span>Subtle</span>
                <span>Warm Radiance</span>
                <span>Max Glow</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
