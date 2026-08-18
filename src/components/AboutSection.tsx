import React from 'react';
import { 
  Shield, 
  HeartHandshake, 
  Scale, 
  Eye, 
  CheckCircle2, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSectionEditButton } from './AdminSectionEditButton';

export const AboutSection: React.FC = () => {
  const { officeSettings, currentUser } = useApp();

  const pillars = [
    {
      icon: Scale,
      title: 'Excelência & Rigor Técnico',
      description: 'Análise aprofundada de holerites, contratos e convenções sindicais para embasar cada pedido com provas contundentes.',
    },
    {
      icon: HeartHandshake,
      title: 'Atendimento Humanizado',
      description: 'Ouvimos cada detalhe da sua história profissional com respeito, empatia e sem termos jurídicos indecifráveis.',
    },
    {
      icon: Eye,
      title: 'Transparência Total',
      description: 'Clareza sobre os riscos, prazos e chances reais. Acompanhe cada movimentação diretamente pelo nosso portal online.',
    },
    {
      icon: Shield,
      title: 'Ética & Sigilo Absoluto',
      description: 'Atuação estritamente pautada pelo Código de Ética da OAB e pelas diretrizes de proteção de dados (LGPD).',
    },
  ];

  return (
    <section id="sobre" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          {currentUser?.role === 'admin' && (
            <div className="flex justify-center mb-4">
              <AdminSectionEditButton tab="texts" label="✏️ Alterar História & Missão Institucional" />
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b38e42] bg-amber-50 px-3 py-1 rounded-md border border-amber-200/60 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Nossa Trajetória</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#0b192c] mb-4">
            Sobre a Almeida e Torres Advocacia
          </h2>
          <div className="w-16 h-1 bg-[#c5a059] mx-auto mb-6 rounded-full" />
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {officeSettings.aboutHistory}
          </p>
        </div>

        {/* Two-column Feature Block: Mission/Values & Visual Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Visual Highlight Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#07111e] via-[#0b192c] to-[#162a45] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-[#c5a059]/40">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a059]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center mb-6">
              <Scale className="w-6 h-6 text-[#f6e088]" />
            </div>

            <h3 className="font-serif-title text-2xl font-bold mb-4 text-[#f6e088]">
              Compromisso Inegociável com a Defesa do Trabalhador
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {officeSettings.aboutApproach}
            </p>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Nossa Missão</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{officeSettings.aboutMission}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <CheckCircle2 className="w-5 h-5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Nossos Valores</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{officeSettings.aboutValues}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pillars Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx}
                  className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#c5a059]/50 rounded-xl p-6 transition-all shadow-sm hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#0b192c] text-[#c5a059] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0b192c] mb-2 group-hover:text-[#b38e42] transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* OAB Notice Box */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 text-center text-xs text-amber-900 max-w-3xl mx-auto flex items-center justify-center gap-3">
          <Scale className="w-4 h-4 text-[#b38e42] flex-shrink-0" />
          <span>
            Atuação em estrita conformidade com o Provimento nº 205/2021 da Ordem dos Advogados do Brasil (OAB). Informações de caráter informativo e educativo.
          </span>
        </div>

      </div>
    </section>
  );
};
