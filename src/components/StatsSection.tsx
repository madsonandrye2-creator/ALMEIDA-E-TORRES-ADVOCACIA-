import React from 'react';
import { Users, Calendar, UserCheck, FileCheck, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSectionEditButton } from './AdminSectionEditButton';

export const StatsSection: React.FC = () => {
  const { officeSettings, currentUser } = useApp();

  const stats = [
    {
      icon: Users,
      value: officeSettings.statsLawyersCount,
      label: 'Advogados Especialistas',
      sublabel: 'Equipe multidisciplinar dedicada',
    },
    {
      icon: Calendar,
      value: officeSettings.statsYearsExperience,
      label: 'Anos de Atuação',
      sublabel: 'Tradição e excelência jurídica',
    },
    {
      icon: UserCheck,
      value: officeSettings.statsClientsServed,
      label: 'Clientes Atendidos',
      sublabel: 'Com atendimento humanizado',
    },
    {
      icon: FileCheck,
      value: officeSettings.statsCasesHandled,
      label: 'Processos Acompanhados',
      sublabel: 'Em todas as instâncias judiciais',
    },
    {
      icon: ThumbsUp,
      value: officeSettings.statsSatisfactionRate,
      label: 'Índice de Avaliação',
      sublabel: 'Compromisso com o resultado',
    },
  ];

  return (
    <section className="py-16 bg-[#0b192c] text-white relative overflow-hidden border-y border-[#c5a059]/30">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {currentUser?.role === 'admin' && (
          <div className="flex justify-end mb-4">
            <AdminSectionEditButton tab="stats" label="✏️ Alterar Métricas & Números" />
          </div>
        )}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#f6e088] mb-2">
            Resultados &amp; Credibilidade
          </h2>
          <p className="font-serif-title text-2xl sm:text-3xl font-bold text-white">
            Nossos Números em Defesa dos Seus Direitos
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-[#07111e]/70 border border-[#c5a059]/30 rounded-xl p-5 text-center hover:border-[#c5a059] transition-all hover:-translate-y-1 shadow-lg group"
              >
                <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 text-[#f6e088] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#c5a059] group-hover:text-[#07111e] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#f6e088] tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  {stat.sublabel}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          * Dados demonstrativos institucionais. Valores auditáveis e configuráveis através do painel de administração.
        </p>
      </div>
    </section>
  );
};
