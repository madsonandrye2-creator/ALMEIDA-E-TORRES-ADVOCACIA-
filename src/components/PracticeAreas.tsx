import React, { useState } from 'react';
import { 
  Scale, 
  DollarSign, 
  ShieldAlert, 
  Briefcase, 
  HeartHandshake, 
  FileCheck2, 
  Award,
  ArrowRight, 
  Check, 
  MessageCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PracticeArea } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Scale,
  DollarSign,
  ShieldAlert,
  Briefcase,
  HeartHandshake,
  FileCheck2,
  Award,
};

export const PracticeAreas: React.FC = () => {
  const { 
    practiceAreas, 
    selectedAreaForDetail, 
    setSelectedAreaForDetail, 
    officeSettings 
  } = useApp();

  const handleConsult = (areaTitle: string) => {
    const msg = encodeURIComponent(`Olá! Gostaria de tirar dúvidas sobre a área de *${areaTitle}* com a equipe da ${officeSettings.officeName}.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  const mainArea = practiceAreas.find(a => a.isMainHighlight) || practiceAreas[0];
  const otherAreas = practiceAreas.filter(a => a.id !== mainArea?.id);

  return (
    <section id="areas" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b38e42] bg-amber-50 px-3 py-1 rounded-md border border-amber-200/60 mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Especialidades Jurídicas</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#0b192c] mb-4">
            Áreas de Atuação
          </h2>
          <div className="w-16 h-1 bg-[#c5a059] mx-auto mb-5 rounded-full" />
          <p className="text-slate-600 text-base leading-relaxed">
            Com foco primordial em <strong className="text-[#0b192c]">Direito Trabalhista</strong>, defendemos trabalhadores em todas as fases contratuais e rescisórias com soluções jurídicas precisas e eficazes.
          </p>
        </div>

        {/* Featured Main Focus Card - DIREITO TRABALHISTA */}
        {mainArea && (
          <div className="mb-12 bg-gradient-to-br from-[#07111e] via-[#0b192c] to-[#162a45] rounded-2xl p-8 sm:p-10 text-white shadow-2xl border-2 border-[#c5a059] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 bg-[#c5a059] text-[#07111e] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-sm">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Foco Principal do Escritório</span>
                </div>
                
                <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#f6e088] mb-3">
                  {mainArea.title}
                </h3>
                
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  {mainArea.shortDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {mainArea.commonTopics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      <Check className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
                <button
                  onClick={() => setSelectedAreaForDetail(mainArea)}
                  className="w-full bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-110 text-[#07111e] font-extrabold text-xs uppercase tracking-wider py-3.5 px-5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ver Detalhes dos Seus Direitos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid of Other Practice Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherAreas.map((area) => {
            const Icon = ICON_MAP[area.iconName] || Scale;
            return (
              <div
                key={area.id}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#c5a059] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#0b192c] text-[#c5a059] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h4 className="font-serif-title text-lg font-bold text-[#0b192c] mb-2 group-hover:text-[#b38e42] transition-colors">
                    {area.title}
                  </h4>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {area.shortDescription}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    {area.commonTopics.slice(0, 2).map((t, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                        <span className="truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAreaForDetail(area)}
                    className="text-xs font-bold text-[#0b192c] hover:text-[#c5a059] flex items-center gap-1.5 transition-colors group-hover:translate-x-1"
                  >
                    <span>Saiba mais</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Area Detail Modal */}
      {selectedAreaForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedAreaForDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0b192c] text-[#c5a059] flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider">Área Jurídica</span>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  {selectedAreaForDetail.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed mb-6">
              {selectedAreaForDetail.fullDescription}
            </p>

            <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold uppercase text-slate-600 mb-3 tracking-wider">
                Principais Situações Atendidas:
              </h4>
              <div className="space-y-2">
                {selectedAreaForDetail.commonTopics.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-800">
                    <Check className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setSelectedAreaForDetail(null)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const areaTitle = selectedAreaForDetail.title;
                  setSelectedAreaForDetail(null);
                  handleConsult(areaTitle);
                }}
                className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar sobre este Caso</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
