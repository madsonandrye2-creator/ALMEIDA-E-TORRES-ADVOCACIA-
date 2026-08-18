import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  BarChart3, 
  ExternalLink,
  ShieldAlert,
  Users,
  Edit3,
  Plus,
  Trash2,
  Search,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfficeSettings, Lawyer } from '../types';
import { EditLawyerModal } from './EditLawyerModal';
import { LogoEditorSection } from './LogoEditorSection';

interface QuickEditSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'contacts' | 'location' | 'texts' | 'stats' | 'lawyers' | 'general' | 'logo';
}

export const QuickEditSiteModal: React.FC<QuickEditSiteModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'contacts'
}) => {
  const { 
    currentUser, 
    officeSettings, 
    updateOfficeSettings, 
    setActiveView,
    lawyers,
    deleteLawyer
  } = useApp();

  const [activeTab, setActiveTab] = useState<'contacts' | 'location' | 'texts' | 'stats' | 'lawyers' | 'general' | 'logo'>(initialTab);
  const [formData, setFormData] = useState<OfficeSettings>(officeSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Lawyer sub-modal
  const [lawyerToEdit, setLawyerToEdit] = useState<Lawyer | null>(null);
  const [isEditLawyerOpen, setIsEditLawyerOpen] = useState(false);
  const [isCreatingLawyer, setIsCreatingLawyer] = useState(false);
  const [lawyerSearchQuery, setLawyerSearchQuery] = useState('');
  const [lawyerToDeleteId, setLawyerToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setFormData(officeSettings);
  }, [officeSettings, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  if (!currentUser || currentUser.role !== 'admin') {
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative z-[100000]">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title font-bold text-lg text-[#0b192c]">Acesso Restrito ao Administrador</h3>
          <p className="text-xs text-slate-600">
            Você precisa estar logado com a conta de administrador para alterar as informações do site.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold py-2.5 rounded-lg"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const filteredLawyers = lawyers.filter(l => 
    l.name.toLowerCase().includes(lawyerSearchQuery.toLowerCase()) ||
    l.oab.toLowerCase().includes(lawyerSearchQuery.toLowerCase()) ||
    l.specialty.toLowerCase().includes(lawyerSearchQuery.toLowerCase())
  );

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
        <div className="bg-white rounded-2xl max-w-3xl w-full border-2 border-[#c5a059] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative z-[100000]">
          
          {/* Modal Header */}
          <div className="bg-[#0b192c] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]/40 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#f6e088]">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-title font-bold text-base text-white">
                    Alterar Informações do Site
                  </h3>
                  <span className="text-[10px] bg-[#c5a059] text-[#07111e] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Edição em tempo real de advogados, telefones, e-mails, endereço, mapas e textos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap gap-1.5 text-xs font-bold flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-[#0b192c] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Telefones &amp; WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lawyers')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lawyers'
                  ? 'bg-[#0b192c] text-[#f6e088] shadow border border-[#c5a059]'
                  : 'text-slate-700 bg-amber-50 hover:bg-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Advogados ({lawyers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'location'
                  ? 'bg-[#0b192c] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Endereço &amp; Localização</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('texts')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'texts'
                  ? 'bg-[#0b192c] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Textos &amp; Hero</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-[#0b192c] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Métricas &amp; Números</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logo'
                  ? 'bg-[#0b192c] text-[#f6e088] shadow border border-[#c5a059]'
                  : 'text-slate-700 bg-amber-50 hover:bg-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Logomarca da Empresa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#0b192c] text-white shadow'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Identidade</span>
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB: ADVOGADOS / CORPO JURÍDICO */}
            {activeTab === 'lawyers' && (
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                    <span>
                      Gerencie as fotos, nomes, OAB, especialidades e contatos de todos os advogados do escritório.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLawyerToEdit(null);
                      setIsCreatingLawyer(true);
                      setIsEditLawyerOpen(true);
                    }}
                    className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0 shadow cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Advogado</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={lawyerSearchQuery}
                    onChange={(e) => setLawyerSearchQuery(e.target.value)}
                    placeholder="Buscar advogado por nome, OAB ou especialidade..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Lawyers List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredLawyers.map((lawyer) => (
                    <div
                      key={lawyer.id}
                      className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={lawyer.avatarUrl}
                          alt={lawyer.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#c5a059] flex-shrink-0 bg-slate-200"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400');
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-[#0b192c] truncate">
                              {lawyer.name}
                            </h4>
                            <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 flex-shrink-0">
                              {lawyer.oab}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#b38e42] font-semibold truncate">
                            {lawyer.roleTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {lawyer.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {lawyerToDeleteId === lawyer.id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-lg animate-fade-in">
                            <span className="text-[11px] font-bold text-red-800 px-1">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteLawyer(lawyer.id);
                                setLawyerToDeleteId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-1 rounded transition-colors cursor-pointer shadow-sm"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setLawyerToDeleteId(null)}
                              className="text-slate-600 hover:bg-slate-200 text-[11px] px-1.5 py-1 rounded transition-colors cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setLawyerToEdit(lawyer);
                                setIsCreatingLawyer(false);
                                setIsEditLawyerOpen(true);
                              }}
                              className="bg-white hover:bg-amber-50 text-[#0b192c] border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setLawyerToDeleteId(lawyer.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir advogado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredLawyers.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      Nenhum advogado encontrado para "{lawyerSearchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: TELEFONES, WHATSAPP & EMAILS */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                  <span>
                    As alterações feitas aqui atualizam imediatamente os botões do WhatsApp, cabeçalho, rodapé e página de contato em todo o site.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      WhatsApp (Apenas Dígitos - DDI + DDD)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                        placeholder="5511999998888"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold"
                        required
                      />
                      <a
                        href={`https://wa.me/${formData.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        title="Testar conversa"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Testar</span>
                      </a>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Link direto para abrir o app do WhatsApp</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      WhatsApp Formatado (Exibição Visual)
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappFormatted}
                      onChange={(e) => setFormData({ ...formData, whatsappFormatted: e.target.value })}
                      placeholder="(11) 99999-8888"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold"
                      required
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Como o número aparece nos textos e cabeçalhos</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telefone Fixo Principal
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 3333-4444"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telefone Secundário / Plantão (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryPhone || ''}
                      onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                      placeholder="(11) 98888-7777"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      E-mail Principal de Contato
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@almeidaetorres.adv.br"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      E-mail para Envio de Documentos
                    </label>
                    <input
                      type="email"
                      value={formData.documentEmail || ''}
                      onChange={(e) => setFormData({ ...formData, documentEmail: e.target.value })}
                      placeholder="documentos@almeidaetorres.adv.br"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                      placeholder="Segunda a Sexta: 08:30 às 18:30"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ENDEREÇO & LOCALIZAÇÃO */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                  <span>
                    O endereço é exibido no topo, no rodapé, na página de contato e nas instruções enviadas aos clientes.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Endereço Completo (Logradouro, Número, Andar/Conjunto)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Av. Paulista, 1578 - 14º Andar, Conj. 1402"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-[#0b192c]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.neighborhood || ''}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Bela Vista / Cerqueira César"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="01310-200"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="São Paulo"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Estado (UF)
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="SP"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Link do Google Maps / Como Chegar (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.googleMapsUrl || ''}
                        onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                      />
                      {formData.googleMapsUrl && (
                        <a
                          href={formData.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver no Mapa</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEXTOS INSTITUCIONAIS & HERO */}
            {activeTab === 'texts' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Título Principal do Banner (Hero Title)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.heroTitle}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-[#0b192c]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subtítulo do Banner (Hero Subtitle)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.heroSubtitle}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Texto Institucional "Sobre o Escritório"
                  </label>
                  <textarea
                    rows={4}
                    value={formData.aboutText}
                    onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs leading-relaxed"
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB 4: MÉTRICAS & NÚMEROS */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Métrica: Anos de Atuação
                    </label>
                    <input
                      type="text"
                      value={formData.statsYearsExperience}
                      onChange={(e) => setFormData({ ...formData, statsYearsExperience: e.target.value })}
                      placeholder="+22 Anos"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Métrica: Clientes e Casos Atendidos
                    </label>
                    <input
                      type="text"
                      value={formData.statsCasesHandled}
                      onChange={(e) => setFormData({ ...formData, statsCasesHandled: e.target.value })}
                      placeholder="+15.000 Casos"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Métrica: Valores Recuperados / Acordos
                    </label>
                    <input
                      type="text"
                      value={formData.statsValuesRecovered}
                      onChange={(e) => setFormData({ ...formData, statsValuesRecovered: e.target.value })}
                      placeholder="+R$ 180 Milhões"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Métrica: Taxa de Satisfação
                    </label>
                    <input
                      type="text"
                      value={formData.statsSatisfactionRate}
                      onChange={(e) => setFormData({ ...formData, statsSatisfactionRate: e.target.value })}
                      placeholder="4.9/5 (Mais de 500 avaliações 5 estrelas)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-amber-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LOGOMARCA DA EMPRESA */}
            {activeTab === 'logo' && (
              <div className="space-y-4">
                <LogoEditorSection
                  formData={formData}
                  setFormData={setFormData}
                  onSaveDirectly={(updated) => {
                    const merged = { ...formData, ...updated };
                    setFormData(merged);
                    updateOfficeSettings(merged);
                  }}
                />
              </div>
            )}

            {/* TAB 5: IDENTIDADE GERAL */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Razão / Nome do Escritório
                  </label>
                  <input
                    type="text"
                    value={formData.officeName}
                    onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-[#0b192c]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Slogan Institucional
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('admin-panel');
                }}
                className="text-xs text-[#0b192c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir Painel Completo de Gestão</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-[#0b192c] hover:bg-[#162a45] text-white border-2 border-[#c5a059] px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#c5a059] animate-bounce" />
                      <span>Salvo com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#c5a059]" />
                      <span>Salvar Alterações no Site</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Lawyer Modal Sub-Component */}
      <EditLawyerModal
        isOpen={isEditLawyerOpen}
        onClose={() => setIsEditLawyerOpen(false)}
        lawyerToEdit={lawyerToEdit}
        isCreatingNew={isCreatingLawyer}
      />
    </>,
    document.body
  );
};
