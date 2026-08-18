import React, { useState } from 'react';
import { 
  Shield, 
  Edit3, 
  Phone, 
  MapPin, 
  FileText, 
  BarChart3, 
  LayoutDashboard, 
  Sparkles,
  Users,
  ChevronDown,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuickEditSiteModal } from './QuickEditSiteModal';

export const AdminToolbar: React.FC = () => {
  const { currentUser, activeView, setActiveView, lawyers } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [initialEditTab, setInitialEditTab] = useState<'contacts' | 'location' | 'texts' | 'stats' | 'lawyers' | 'general' | 'logo'>('contacts');

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const openTab = (tab: 'contacts' | 'location' | 'texts' | 'stats' | 'lawyers' | 'general' | 'logo') => {
    setInitialEditTab(tab);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#07111e] via-[#0b192c] to-[#07111e] text-white border-b-2 border-[#c5a059] px-4 py-2 sticky top-0 z-40 shadow-lg text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left badge */}
          <div className="flex items-center gap-2">
            <span className="bg-[#c5a059] text-[#07111e] font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <Shield className="w-3 h-3" />
              MODO ADMIN
            </span>
            <span className="font-semibold text-slate-200 hidden sm:inline">
              Gerenciamento do Site
            </span>
          </div>

          {/* Center Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => openTab('logo')}
              className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] px-2.5 py-1 rounded border border-[#c5a059] transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
              title="Trocar Logomarca da Empresa (Upload ou Ícone)"
            >
              <Palette className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Logomarca</span>
            </button>

            <button
              onClick={() => openTab('lawyers')}
              className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] px-2.5 py-1 rounded border border-[#c5a059] transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
              title="Gerenciar Advogados e Equipe Jurídica"
            >
              <Users className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Advogados ({lawyers.length})</span>
            </button>

            <button
              onClick={() => openTab('contacts')}
              className="bg-white/10 hover:bg-[#c5a059]/20 hover:border-[#c5a059] text-slate-200 hover:text-white px-2.5 py-1 rounded border border-white/15 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
              title="Alterar Telefones, WhatsApp e E-mails"
            >
              <Phone className="w-3 h-3 text-[#c5a059]" />
              <span>Telefones / WhatsApp</span>
            </button>

            <button
              onClick={() => openTab('location')}
              className="bg-white/10 hover:bg-[#c5a059]/20 hover:border-[#c5a059] text-slate-200 hover:text-white px-2.5 py-1 rounded border border-white/15 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
              title="Alterar Endereço, Bairro, CEP e Google Maps"
            >
              <MapPin className="w-3 h-3 text-[#c5a059]" />
              <span>Endereço / Localização</span>
            </button>

            <button
              onClick={() => openTab('texts')}
              className="bg-white/10 hover:bg-[#c5a059]/20 hover:border-[#c5a059] text-slate-200 hover:text-white px-2.5 py-1 rounded border border-white/15 transition-all flex items-center gap-1.5 font-medium hidden md:flex cursor-pointer"
              title="Alterar Título, Banner e Textos Institucionais"
            >
              <FileText className="w-3 h-3 text-[#c5a059]" />
              <span>Textos / Hero</span>
            </button>

            <button
              onClick={() => openTab('stats')}
              className="bg-white/10 hover:bg-[#c5a059]/20 hover:border-[#c5a059] text-slate-200 hover:text-white px-2.5 py-1 rounded border border-white/15 transition-all flex items-center gap-1.5 font-medium hidden lg:flex cursor-pointer"
              title="Alterar Métricas, Anos de Experiência e Clientes"
            >
              <BarChart3 className="w-3 h-3 text-[#c5a059]" />
              <span>Métricas</span>
            </button>

            <button
              onClick={() => openTab('general')}
              className="bg-[#c5a059] hover:bg-[#b38e42] text-[#07111e] font-bold px-3 py-1 rounded shadow transition-all flex items-center gap-1.5 ml-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar Dados do Site</span>
            </button>
          </div>

          {/* Right View Switcher */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {activeView === 'admin-panel' ? (
              <button
                onClick={() => setActiveView('home')}
                className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white px-2.5 py-1 rounded transition-colors font-medium cursor-pointer"
              >
                Ver Site Público &rarr;
              </button>
            ) : (
              <button
                onClick={() => setActiveView('admin-panel')}
                className="text-[11px] bg-[#162a45] hover:bg-[#203a5f] text-[#f6e088] border border-[#c5a059]/40 px-2.5 py-1 rounded transition-colors font-bold flex items-center gap-1 cursor-pointer"
              >
                <LayoutDashboard className="w-3 h-3 text-[#c5a059]" />
                <span>Painel Completo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <QuickEditSiteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialTab={initialEditTab}
      />
    </>
  );
};
