import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, ExternalLink } from 'lucide-react';

interface AffiliateDisclosureProps {
  customText?: string;
  compact?: boolean;
}

export const AffiliateDisclosure: React.FC<AffiliateDisclosureProps> = ({
  customText,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultText = customText || 'Toufiq Motion is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at zero extra cost to you. We only recommend gear, retreats, and experiences we independently test and trust.';

  if (compact) {
    return (
      <div className="py-2 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DF] text-[11px] text-[#8C8477] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Reader-supported: Contains affiliate links.</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#E8734A] hover:underline font-bold shrink-0 cursor-pointer text-[10px] uppercase tracking-wider"
        >
          {isOpen ? 'Close' : 'Details'}
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-2xl bg-gradient-to-r from-[#FFFBF8] to-[#FAF8F5] border border-[#FFCEBA]/60 p-4 shadow-2xs transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
            ⚖️
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xs text-[#1E1B18] tracking-tight">
                Affiliate Disclosure &amp; Editorial Transparency
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                FTC Compliant
              </span>
            </div>
            <p className="text-xs text-[#5A5348] leading-relaxed">
              {defaultText}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1 rounded-lg border border-[#E0DCD4] hover:border-[#E8734A] bg-white text-[10px] font-bold uppercase tracking-wider text-[#5A5348] hover:text-[#E8734A] flex items-center gap-1 shrink-0 transition-colors cursor-pointer mt-0.5"
        >
          <span>{isOpen ? 'Hide' : 'Why trust us'}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Transparency Commitment */}
      {isOpen && (
        <div className="mt-3.5 pt-3 border-t border-[#F0ECE6] text-xs text-[#5A5348] space-y-2 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-[#EDE7DF] space-y-1">
              <div className="font-serif font-bold text-xs text-[#1E1B18]">1. Zero Surcharges</div>
              <p className="text-[11px] text-[#8C8477] leading-relaxed">
                Clicking our links never increases your purchase price. Often, our partner codes secure exclusive discounts.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#EDE7DF] space-y-1">
              <div className="font-serif font-bold text-xs text-[#1E1B18]">2. Rigorous Field Testing</div>
              <p className="text-[11px] text-[#8C8477] leading-relaxed">
                Cameras, bags, and coffee gear are tested on real mountain trails and long-haul flights before recommendation.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#EDE7DF] space-y-1">
              <div className="font-serif font-bold text-xs text-[#1E1B18]">3. Independent Voice</div>
              <p className="text-[11px] text-[#8C8477] leading-relaxed">
                Our editorial team does not accept payment to rank one hotel or camera above another. Integrity remains paramount.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

