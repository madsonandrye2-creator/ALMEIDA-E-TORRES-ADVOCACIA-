import React, { useState } from 'react';
import { 
  Scale, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Lock,
  ArrowUp,
  Instagram,
  Linkedin,
  Facebook
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrivacyModal } from './PrivacyModal';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const { 
    officeSettings, 
    practiceAreas, 
    openAuthModal, 
    setActiveView 
  } = useApp();

  const [privacyModalState, setPrivacyModalState] = useState<{
    isOpen: boolean;
    type: 'privacy' | 'terms';
  }>({
    isOpen: false,
    type: 'privacy',
  });

  const scrollToSection = (id: string) => {
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07111e] text-white border-t border-[#c5a059]/30 relative overflow-hidden">
      {/* Upper Footer Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo 
              settings={officeSettings} 
              variant="footer" 
              onClick={() => scrollToSection('hero')} 
            />

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {officeSettings.tagline}
            </p>

            <div className="pt-2 flex items-center space-x-3">
              <a
                href={officeSettings.socialInstagram || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a059] hover:text-[#07111e] border border-white/10 flex items-center justify-center text-slate-300 transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={officeSettings.socialLinkedin || 'https://linkedin.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a059] hover:text-[#07111e] border border-white/10 flex items-center justify-center text-slate-300 transition-all"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={officeSettings.socialFacebook || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#c5a059] hover:text-[#07111e] border border-white/10 flex items-center justify-center text-slate-300 transition-all"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#f6e088] bg-[#0b192c] px-3 py-1 rounded border border-[#c5a059]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                Conforme Provimento OAB nº 205/2021
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif-title text-sm font-bold text-[#f6e088] uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => scrollToSection('hero')} className="hover:text-[#c5a059] transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('sobre')} className="hover:text-[#c5a059] transition-colors">
                  O Escritório
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('areas')} className="hover:text-[#c5a059] transition-colors">
                  Áreas de Atuação
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('equipe')} className="hover:text-[#c5a059] transition-colors">
                  Nossa Equipe (10 Advogados)
                </button>
              </li>
              <li>
                <button onClick={() => openAuthModal('client')} className="text-[#e5c158] font-bold hover:underline">
                  Acompanhe seu Processo
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contato')} className="hover:text-[#c5a059] transition-colors">
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Practice Areas */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-title text-sm font-bold text-[#f6e088] uppercase tracking-wider">
              Especialidades
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {practiceAreas.slice(0, 5).map((area) => (
                <li key={area.id}>
                  <button 
                    onClick={() => scrollToSection('areas')}
                    className="hover:text-[#c5a059] text-left transition-colors truncate max-w-full block"
                  >
                    {area.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Full Contacts */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-title text-sm font-bold text-[#f6e088] uppercase tracking-wider">
              Canais Oficiais
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <a 
                  href={`https://wa.me/${officeSettings.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#f6e088] transition-colors"
                >
                  WhatsApp: {officeSettings.whatsappFormatted}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a href={`tel:${officeSettings.phone.replace(/\D/g, '')}`} className="hover:text-[#f6e088] transition-colors">
                    Tel: {officeSettings.phone}
                  </a>
                  {officeSettings.secondaryPhone && (
                    <a href={`tel:${officeSettings.secondaryPhone.replace(/\D/g, '')}`} className="text-[11px] text-slate-400 hover:text-[#f6e088] transition-colors">
                      Plantão: {officeSettings.secondaryPhone}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <a href={`mailto:${officeSettings.email}`} className="truncate hover:text-[#f6e088] transition-colors">
                    {officeSettings.email}
                  </a>
                  {officeSettings.documentEmail && (
                    <a href={`mailto:${officeSettings.documentEmail}`} className="text-[11px] text-slate-400 truncate hover:text-[#f6e088] transition-colors">
                      {officeSettings.documentEmail}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <div>
                  <p>{officeSettings.address}</p>
                  <p className="text-[11px] text-slate-400">
                    {[officeSettings.neighborhood, officeSettings.cityState, officeSettings.postalCode ? `CEP ${officeSettings.postalCode}` : ''].filter(Boolean).join(' - ')}
                  </p>
                  <a
                    href={officeSettings.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${officeSettings.address}, ${officeSettings.cityState}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#f6e088] hover:underline block mt-0.5"
                  >
                    Ver no Google Maps &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <span>{officeSettings.workingHours}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lower Bottom Sub-footer */}
      <div className="bg-[#0b192c] border-t border-white/10 py-5 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} {officeSettings.officeName}. Todos os direitos reservados.
          </p>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPrivacyModalState({ isOpen: true, type: 'privacy' })}
              className="hover:text-[#f6e088] transition-colors"
            >
              Política de Privacidade (LGPD)
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => setPrivacyModalState({ isOpen: true, type: 'terms' })}
              className="hover:text-[#f6e088] transition-colors"
            >
              Termos de Uso
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={() => openAuthModal('admin')}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Painel Interno</span>
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#c5a059] hover:text-[#07111e] flex items-center justify-center transition-colors"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy Policy / Terms Modal */}
      <PrivacyModal
        isOpen={privacyModalState.isOpen}
        type={privacyModalState.type}
        onClose={() => setPrivacyModalState({ isOpen: false, type: 'privacy' })}
      />
    </footer>
  );
};
