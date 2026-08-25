import React, { useState } from 'react';
import { 
  MessageCircle, 
  Search, 
  ShieldCheck, 
  Users, 
  Award, 
  FileText, 
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSectionEditButton } from './AdminSectionEditButton';
import { PrivacyModal } from './PrivacyModal';

export const Hero: React.FC = () => {
  const { officeSettings, openAuthModal, currentUser, setActiveView, lawyers } = useApp();
  const [quickQuery, setQuickQuery] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveView('home');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Gostaria de conversar com um advogado trabalhista da ${officeSettings.officeName}.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  const handleProcessTracking = () => {
    if (currentUser && currentUser.role === 'client') {
      setActiveView('client-area');
    } else {
      openAuthModal('client');
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && currentUser.role === 'client') {
      setActiveView('client-area');
    } else {
      openAuthModal('client');
    }
  };

  const visibleLawyers = lawyers.slice(0, 4);

  return (
    <section id="hero" className="relative bg-gradient-to-b from-[#07111e] via-[#0b192c] to-[#0f223a] text-white pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-[#c5a059]/30">
      
      {/* Radiant Luxury Ambient Lighting & Sunburst Halos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22)_0%,rgba(15,34,58,0.4)_50%,transparent_75%)] pointer-events-none blur-2xl" />
      <div className="absolute top-20 right-[-100px] w-[450px] h-[450px] bg-[#c5a059]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-100px] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Refined Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#f6e088_1px,transparent_1px)] [background-size:28px_28px]" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {currentUser?.role === 'admin' && (
          <div className="flex justify-end mb-3">
            <AdminSectionEditButton tab="texts" label="✏️ Alterar Textos do Banner & Hero" />
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center">
          
          {/* Top Real-time Trust Bar & Live Lawyers Pill */}
          <button
            type="button"
            onClick={() => scrollToSection('equipe')}
            className="inline-flex flex-wrap items-center justify-center gap-3 bg-[#07111e]/90 hover:bg-[#0f223a] border border-[#c5a059]/50 hover:border-[#f6e088] px-4 py-2 rounded-full mb-6 shadow-[0_0_25px_rgba(197,160,89,0.25)] hover:shadow-[0_0_35px_rgba(246,224,136,0.4)] backdrop-blur-md transition-all cursor-pointer group"
            title="Conheça nosso corpo jurídico completo"
          >
            
            {/* Lawyer Avatar Stack */}
            <div className="flex items-center -space-x-2">
              {visibleLawyers.map((law, i) => (
                <img
                  key={law.id}
                  src={law.avatarUrl}
                  alt={law.name}
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#c5a059] shadow-sm group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="w-7 h-7 rounded-full bg-[#c5a059] text-[#07111e] font-black text-[10px] flex items-center justify-center border-2 border-[#07111e] shadow-sm">
                +6
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 pl-1 border-l border-white/15">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-[#f6e088] uppercase tracking-wider group-hover:underline decoration-[#f6e088]">
                {officeSettings.heroBadge || 'Corpo Jurídico com 10 Advogados Online'}
              </span>
            </div>
          </button>

          {/* Main Title with Luminous Golden Shimmer Highlight */}
          <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
            {officeSettings.heroTitle ? (
              officeSettings.heroTitle
            ) : (
              <>
                EXPERIÊNCIA, COMPROMISSO E{' '}
                <span className="bg-gradient-to-r from-[#f6e088] via-[#e6ca65] to-[#f6e088] bg-clip-text text-transparent underline decoration-[#c5a059]/60 underline-offset-8 drop-shadow-[0_0_25px_rgba(197,160,89,0.4)]">
                  SEGURANÇA NA DEFESA
                </span>{' '}
                DOS SEUS DIREITOS.
              </>
            )}
          </h1>

          {/* Explanatory text */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-9 max-w-3xl mx-auto drop-shadow font-normal">
            {officeSettings.heroSubtitle || 'Atuação combativa e humanizada para trabalhadores em busca de justiça. Rescisões, horas extras, acidentes de trabalho, pejotização e verbas rescisórias conduzidas com total transparência por uma equipe dedicada de 10 advogados.'}
          </p>

          {/* Two Main Call-To-Action Buttons - Vibrant & Alive */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={handleWhatsApp}
              id="btn-hero-fale-conosco"
              className="w-full sm:w-auto bg-gradient-to-r from-[#c5a059] via-[#f6e088] to-[#b38e42] hover:brightness-110 text-[#07111e] font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-[0_0_35px_rgba(197,160,89,0.45)] hover:shadow-[0_0_50px_rgba(246,224,136,0.75)] transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5 fill-[#07111e]/30" />
              <span>Fale Conosco no WhatsApp</span>
            </button>

            <button
              onClick={handleProcessTracking}
              id="btn-hero-acompanhe-processo"
              className="w-full sm:w-auto bg-[#0b192c]/90 hover:bg-[#162a45] text-white border-2 border-[#c5a059] hover:border-[#f6e088] font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.2)] hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <FileText className="w-5 h-5 text-[#f6e088]" />
              <span>Acompanhe seu Processo</span>
              <ArrowRight className="w-4 h-4 text-[#f6e088]" />
            </button>
          </div>

          {/* Quick Process Search Card - Glowing Golden Frame */}
          <div className="bg-gradient-to-b from-[#0b192c]/95 via-[#07111e]/95 to-[#0b192c]/95 border-2 border-[#c5a059]/60 hover:border-[#c5a059] rounded-2xl p-5 sm:p-6 max-w-xl mx-auto shadow-[0_15px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(197,160,89,0.2)] backdrop-blur-md transition-all">
            <div className="flex items-center justify-between text-xs text-slate-200 mb-3 px-1">
              <span className="font-bold text-[#f6e088] flex items-center gap-1.5 text-sm">
                <Search className="w-4 h-4 text-[#c5a059]" />
                Consulta Rápida do Processo
              </span>
              <span className="text-slate-300 font-semibold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <Lock className="w-3 h-3 text-[#c5a059]" />
                Área Segura do Cliente
              </span>
            </div>
            
            <form onSubmit={handleQuickSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Digite seu CPF ou Nº do Processo..."
                className="flex-1 bg-[#07111e] border-2 border-white/15 focus:border-[#f6e088] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-110 text-[#07111e] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Consultar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[11px] text-slate-400 mt-2.5 text-left px-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Acesso protegido. Se já é cliente do escritório, consulte movimentações e relatórios em tempo real.</span>
            </p>
          </div>
        </div>

        {/* Trust Badges Strip - Interactive Hyperlinks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-[#c5a059]/20">
          
          {/* Unit 1: Sigilo & Privacidade (Conforme LGPD) -> Abre Política de Privacidade & LGPD */}
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            id="badge-link-lgpd"
            className="w-full text-left bg-[#0b192c]/90 hover:bg-[#12243d] border border-[#c5a059]/35 hover:border-[#f6e088] rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
            title="Clique para ler a Política de Sigilo, Proteção de Dados e LGPD"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#07111e] text-[#f6e088] transition-all">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Sigilo &amp; Privacidade</p>
                <p className="text-sm font-bold text-white group-hover:text-[#f6e088] transition-colors truncate">Conforme LGPD</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#c5a059]/60 group-hover:text-[#f6e088] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Unit 2: Corpo Jurídico (10 Advogados) -> Vai para a seção da Equipe */}
          <button
            type="button"
            onClick={() => scrollToSection('equipe')}
            id="badge-link-equipe"
            className="w-full text-left bg-[#0b192c]/90 hover:bg-[#12243d] border border-[#c5a059]/35 hover:border-[#f6e088] rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
            title="Clique para conhecer os 10 advogados do Corpo Jurídico"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#07111e] text-[#f6e088] transition-all">
                <Users className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Corpo Jurídico</p>
                <p className="text-sm font-bold text-white group-hover:text-[#f6e088] transition-colors truncate">10 Advogados</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#c5a059]/60 group-hover:text-[#f6e088] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Unit 3: Foco Exclusivo (Direito Trabalhista) -> Vai para Áreas de Atuação */}
          <button
            type="button"
            onClick={() => scrollToSection('areas')}
            id="badge-link-areas"
            className="w-full text-left bg-[#0b192c]/90 hover:bg-[#12243d] border border-[#c5a059]/35 hover:border-[#f6e088] rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
            title="Clique para ver as Especialidades em Direito Trabalhista"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#07111e] text-[#f6e088] transition-all">
                <Award className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Foco Exclusivo</p>
                <p className="text-sm font-bold text-white group-hover:text-[#f6e088] transition-colors truncate">Direito Trabalhista</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#c5a059]/60 group-hover:text-[#f6e088] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Unit 4: Portal Online (Linha do Tempo 24h) -> Abre Portal do Cliente / Linha do Tempo */}
          <button
            type="button"
            onClick={handleProcessTracking}
            id="badge-link-portal"
            className="w-full text-left bg-[#0b192c]/90 hover:bg-[#12243d] border border-[#c5a059]/35 hover:border-[#f6e088] rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
            title="Clique para acessar a Linha do Tempo do seu Processo 24h"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#07111e] text-[#f6e088] transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Portal Online</p>
                <p className="text-sm font-bold text-white group-hover:text-[#f6e088] transition-colors truncate">Linha do Tempo 24h</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#c5a059]/60 group-hover:text-[#f6e088] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

        </div>

      </div>

      {/* LGPD & Privacy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        type="privacy"
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </section>
  );
};
