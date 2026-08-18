import React, { useState } from 'react';
import { 
  Scale, 
  Phone, 
  MessageCircle, 
  User as UserIcon, 
  Menu, 
  X, 
  Shield, 
  Clock, 
  Briefcase, 
  LogIn, 
  LogOut,
  LayoutDashboard,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LogoEditorModal } from './LogoEditorModal';

export const Header: React.FC = () => {
  const { 
    officeSettings, 
    currentUser, 
    logout, 
    openAuthModal, 
    activeView, 
    setActiveView 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Olá! Gostaria de uma consulta jurídica com a equipe da ${officeSettings.officeName}.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07111e]/95 backdrop-blur-md border-b border-[#c5a059]/40 text-white transition-all shadow-xl">
      {/* Radiant Gold Shimmer Top Bar Line */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-[#b38e42] via-[#f6e088] to-[#b38e42] shadow-[0_0_15px_rgba(246,224,136,0.7)]" />

      {/* Top micro-bar */}
      <div className="bg-[#091524] border-b border-white/5 py-1.5 px-4 sm:px-8 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            {/* Live Online Badge */}
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[11px] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Plantão Ativo Agora
            </span>

            <span className="hidden sm:flex items-center text-slate-300">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-[#c5a059]" />
              {officeSettings.workingHours}
            </span>
            <span className="hidden lg:inline-flex items-center text-slate-300">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-[#c5a059]" />
              Especialistas em Direito Trabalhista
            </span>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <a 
              href={`tel:${officeSettings.phone.replace(/\D/g, '')}`} 
              className="hidden sm:inline-flex items-center font-semibold text-slate-200 hover:text-[#f6e088] transition-colors"
            >
              <Phone className="w-3 h-3 mr-1 text-[#c5a059]" />
              {officeSettings.phone}
            </a>
            
            {currentUser ? (
              <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                <span className="text-amber-300 font-bold truncate max-w-[140px]">
                  {currentUser.role === 'admin' ? 'Painel Admin' : currentUser.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => setActiveView(currentUser.role === 'admin' ? 'admin-panel' : 'client-area')}
                  className="text-xs bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] px-2.5 py-1 rounded font-black border border-[#f6e088] transition-all shadow"
                >
                  {currentUser.role === 'admin' ? 'Painel Admin' : 'Meu Painel'}
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-red-400 ml-1 p-0.5"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openAuthModal('client')}
                  className="text-xs text-slate-200 hover:text-[#f6e088] font-bold flex items-center transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10 shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#c5a059]" />
                  Portal do Cliente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand Logo - Highlighted & Prominent */}
        <div className="flex items-center gap-3 relative py-0.5">
          <BrandLogo 
            settings={officeSettings} 
            variant="header" 
            onClick={() => setActiveView('home')} 
          />

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] hover:text-white border border-[#c5a059] px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer ml-1"
              title="Trocar Logomarca da Empresa (Admin)"
            >
              <Edit3 className="w-3 h-3 text-[#c5a059]" />
              <span className="hidden sm:inline">Trocar Logo</span>
            </button>
          )}
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold">
          <button
            onClick={() => scrollToSection('hero')}
            className={`transition-colors hover:text-[#f6e088] ${activeView === 'home' ? 'text-[#f6e088]' : 'text-slate-200'}`}
          >
            Início
          </button>
          <button
            onClick={() => scrollToSection('sobre')}
            className="text-slate-200 hover:text-[#f6e088] transition-colors"
          >
            O Escritório
          </button>
          <button
            onClick={() => scrollToSection('areas')}
            className="text-slate-200 hover:text-[#f6e088] transition-colors"
          >
            Áreas de Atuação
          </button>
          <button
            onClick={() => scrollToSection('equipe')}
            className="text-slate-200 hover:text-[#f6e088] transition-colors"
          >
            Nossa Equipe
          </button>
          <button
            onClick={() => {
              if (currentUser && currentUser.role === 'client') {
                setActiveView('client-area');
              } else {
                openAuthModal('client');
              }
            }}
            className="text-[#f6e088] hover:text-white transition-colors flex items-center gap-1.5 font-bold bg-[#0b192c] border border-[#c5a059]/40 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#c5a059]" />
            Acompanhe seu Processo
          </button>
          <button
            onClick={() => scrollToSection('contato')}
            className="text-slate-200 hover:text-[#f6e088] transition-colors"
          >
            Contato
          </button>
        </nav>

        {/* Action Button - Vibrant Glowing Gold */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={handleWhatsAppClick}
            className="bg-gradient-to-r from-[#c5a059] via-[#f6e088] to-[#c5a059] hover:brightness-110 text-[#07111e] font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:shadow-[0_0_30px_rgba(246,224,136,0.6)] transition-all flex items-center space-x-1.5 cursor-pointer transform hover:scale-105 active:scale-95"
            id="btn-header-fale-conosco"
          >
            <MessageCircle className="w-4 h-4 fill-[#07111e]/30" />
            <span>Fale Conosco</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 border border-white/10"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07111e] border-b border-[#c5a059]/30 px-6 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 text-base">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2 text-white hover:text-[#c5a059] border-b border-white/5"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('sobre')}
              className="text-left py-2 text-slate-300 hover:text-[#c5a059] border-b border-white/5"
            >
              O Escritório
            </button>
            <button
              onClick={() => scrollToSection('areas')}
              className="text-left py-2 text-slate-300 hover:text-[#c5a059] border-b border-white/5"
            >
              Áreas de Atuação
            </button>
            <button
              onClick={() => scrollToSection('equipe')}
              className="text-left py-2 text-slate-300 hover:text-[#c5a059] border-b border-white/5"
            >
              Nossa Equipe (10 Advogados)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser && currentUser.role === 'client') {
                  setActiveView('client-area');
                } else {
                  openAuthModal('client');
                }
              }}
              className="text-left py-2 text-[#e5c158] font-semibold flex items-center gap-2 border-b border-white/5"
            >
              <Briefcase className="w-4 h-4" />
              Acompanhe seu Processo
            </button>
            <button
              onClick={() => scrollToSection('contato')}
              className="text-left py-2 text-slate-300 hover:text-[#c5a059] border-b border-white/5"
            >
              Contato
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleWhatsAppClick();
              }}
              className="w-full bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold py-3 rounded-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <MessageCircle className="w-5 h-5" />
              Fale Conosco no WhatsApp
            </button>

            {currentUser ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveView(currentUser.role === 'admin' ? 'admin-panel' : 'client-area');
                  }}
                  className="flex-1 bg-white/10 text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Abrir Meu Painel
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-4 bg-red-900/40 text-red-300 py-2.5 rounded-md text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('client');
                }}
                className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white border border-[#c5a059]/40 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4 text-[#c5a059]" />
                <span>Portal do Cliente (Entrar / Criar Conta)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Direct Logo Editor Modal for Admin */}
      <LogoEditorModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </header>
  );
};
