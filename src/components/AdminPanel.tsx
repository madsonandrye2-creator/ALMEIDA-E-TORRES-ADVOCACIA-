import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Save, 
  Phone, 
  Mail, 
  Scale, 
  Sparkles, 
  X,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Globe,
  Share2,
  FileText,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LegalProcess, Lawyer, PracticeArea, ProcessStatus, User, OfficeSettings } from '../types';
import { BrandLogo } from './BrandLogo';
import { LogoEditorSection } from './LogoEditorSection';

export const AdminPanel: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    officeSettings, 
    updateOfficeSettings,
    lawyers,
    addLawyer,
    updateLawyer,
    deleteLawyer,
    clients,
    addClient,
    updateClient,
    deleteClient,
    processes,
    addProcess,
    updateProcess,
    deleteProcess,
    updateProcessStatus,
    contactRequests,
    updateContactRequestStatus,
    deleteContactRequest,
    practiceAreas,
    addPracticeArea,
    updatePracticeArea,
    deletePracticeArea,
    setActiveView,
    resetToDefaultData
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'processes' | 'clients' | 'lawyers' | 'areas' | 'requests' | 'settings'
  >('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Modals state
  const [isNewProcessModalOpen, setIsNewProcessModalOpen] = useState(false);
  const [isEditProcessModalOpen, setIsEditProcessModalOpen] = useState(false);
  const [isAdvanceStatusModalOpen, setIsAdvanceStatusModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<LegalProcess | null>(null);

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<(User & { passwordPlain: string; address?: string }) | null>(null);

  const [isNewLawyerModalOpen, setIsNewLawyerModalOpen] = useState(false);
  const [isEditLawyerModalOpen, setIsEditLawyerModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

  const [isNewAreaModalOpen, setIsNewAreaModalOpen] = useState(false);
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);

  // Safe delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'lawyer' | 'client' | 'process' | 'area' | 'request';
    id: string;
    name: string;
  } | null>(null);

  // Settings form local state (synchronized with officeSettings)
  const [settingsForm, setSettingsForm] = useState<OfficeSettings>(officeSettings);

  useEffect(() => {
    setSettingsForm(officeSettings);
  }, [officeSettings]);

  // Stats calculation
  const totalClients = clients.length;
  const activeProcessesCount = processes.filter(p => p.currentStatus !== 'concluido').length;
  const completedProcessesCount = processes.filter(p => p.currentStatus === 'concluido').length;
  const pendingRequestsCount = contactRequests.filter(r => r.status === 'pendente').length;

  // Process Forms State
  const [newProcForm, setNewProcForm] = useState({
    processNumber: '',
    clientId: '',
    lawyerId: '',
    title: '',
    type: 'Reclamatória Trabalhista',
    court: '1ª Vara do Trabalho de São Paulo - TRT-2',
    opposingParty: '',
    currentStatus: 'iniciado' as ProcessStatus,
    startDate: new Date().toLocaleDateString('pt-BR'),
    valueEstimated: 'R$ 50.000,00',
    notes: '',
  });

  const [advanceStatusForm, setAdvanceStatusForm] = useState({
    newStatus: 'protocolado' as ProcessStatus,
    description: '',
    notes: '',
  });

  // Client Forms State
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    passwordPlain: 'cliente123',
    address: '',
  });

  // Lawyer Forms State
  const [lawyerForm, setLawyerForm] = useState({
    name: '',
    oab: '',
    specialty: '',
    roleTitle: 'Advogado Associado',
    bio: '',
    email: '',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  });

  // Practice Area Forms State
  const [areaForm, setAreaForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    iconName: 'Scale',
    commonTopics: '',
  });

  // Security check: Only Admin can access
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif-title text-2xl font-bold text-[#0b192c] mb-2">
          Acesso Restrito ao Administrador
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Somente o administrador autenticado pode alterar as informações do site, gerenciar processos, advogados e clientes.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="bg-[#0b192c] hover:bg-[#162a45] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  // --- Handlers ---
  const handleCreateProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenClient = clients.find(c => c.id === newProcForm.clientId);
    const chosenLawyer = lawyers.find(l => l.id === newProcForm.lawyerId) || lawyers[0];

    if (!chosenClient) {
      alert('Selecione um cliente para vincular ao processo.');
      return;
    }

    addProcess({
      processNumber: newProcForm.processNumber,
      clientId: chosenClient.id,
      clientName: chosenClient.name,
      clientCpf: chosenClient.cpf || '',
      lawyerId: chosenLawyer ? chosenLawyer.id : 'law-1',
      lawyerName: chosenLawyer ? chosenLawyer.name : 'Advogado Titular',
      lawyerOab: chosenLawyer ? chosenLawyer.oab : 'OAB/SP',
      title: newProcForm.title,
      type: newProcForm.type,
      court: newProcForm.court,
      opposingParty: newProcForm.opposingParty,
      currentStatus: newProcForm.currentStatus,
      startDate: newProcForm.startDate,
      valueEstimated: newProcForm.valueEstimated,
      notes: newProcForm.notes,
    });

    setIsNewProcessModalOpen(false);
    showToast('Processo cadastrado e sincronizado com o Firebase!');
    setNewProcForm({
      processNumber: '',
      clientId: '',
      lawyerId: '',
      title: '',
      type: 'Reclamatória Trabalhista',
      court: '1ª Vara do Trabalho de São Paulo - TRT-2',
      opposingParty: '',
      currentStatus: 'iniciado',
      startDate: new Date().toLocaleDateString('pt-BR'),
      valueEstimated: 'R$ 50.000,00',
      notes: '',
    });
  };

  const handleEditProcessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess) return;

    updateProcess(selectedProcess.id, selectedProcess);
    setIsEditProcessModalOpen(false);
    showToast('Dados do processo atualizados com sucesso!');
  };

  const handleAdvanceStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcess) return;

    updateProcessStatus(
      selectedProcess.id,
      advanceStatusForm.newStatus,
      advanceStatusForm.description,
      advanceStatusForm.notes
    );

    setIsAdvanceStatusModalOpen(false);
    showToast('Status do processo e linha do tempo atualizados na nuvem!');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      name: clientForm.name,
      email: clientForm.email,
      cpf: clientForm.cpf,
      phone: clientForm.phone,
      passwordPlain: clientForm.passwordPlain || 'cliente123',
      address: clientForm.address,
    });

    setIsNewClientModalOpen(false);
    showToast('Cliente cadastrado com sucesso!');
    setClientForm({
      name: '',
      email: '',
      cpf: '',
      phone: '',
      passwordPlain: 'cliente123',
      address: '',
    });
  };

  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    updateClient(selectedClient.id, selectedClient);
    setIsEditClientModalOpen(false);
    showToast('Dados do cliente atualizados com sucesso!');
  };

  const handleCreateLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    addLawyer({
      name: lawyerForm.name,
      oab: lawyerForm.oab,
      specialty: lawyerForm.specialty,
      roleTitle: lawyerForm.roleTitle,
      bio: lawyerForm.bio,
      email: lawyerForm.email,
      phone: lawyerForm.phone,
      avatarUrl: lawyerForm.avatarUrl,
    });

    setIsNewLawyerModalOpen(false);
    showToast('Advogado adicionado à equipe!');
    setLawyerForm({
      name: '',
      oab: '',
      specialty: '',
      roleTitle: 'Advogado Associado',
      bio: '',
      email: '',
      phone: '',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    });
  };

  const handleEditLawyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) return;

    updateLawyer(selectedLawyer.id, selectedLawyer);
    setIsEditLawyerModalOpen(false);
    showToast('Informações do advogado salvas com sucesso!');
  };

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    const topicsArray = areaForm.commonTopics
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addPracticeArea({
      title: areaForm.title,
      shortDescription: areaForm.shortDescription,
      fullDescription: areaForm.fullDescription,
      iconName: areaForm.iconName,
      commonTopics: topicsArray.length > 0 ? topicsArray : ['Atuação técnica especializada', 'Cálculos de verbas devidas'],
    });

    setIsNewAreaModalOpen(false);
    showToast('Área de atuação cadastrada no site!');
    setAreaForm({
      title: '',
      shortDescription: '',
      fullDescription: '',
      iconName: 'Scale',
      commonTopics: '',
    });
  };

  const handleEditAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) return;

    updatePracticeArea(selectedArea.id, selectedArea);
    setIsEditAreaModalOpen(false);
    showToast('Área de atuação atualizada com sucesso!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeSettings(settingsForm);
    showToast('Informações do site salvas e sincronizadas no Firebase!');
  };

  const handleOpenWhatsAppClient = (reqPhone: string, reqName: string) => {
    const rawPhone = reqPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá, ${reqName}! Aqui é da equipe da ${officeSettings.officeName}. Recebemos sua solicitação de atendimento trabalhista.`);
    window.open(`https://wa.me/55${rawPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-24">
      {/* Toast feedback */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b192c] text-white border-2 border-[#c5a059] px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-[#0b192c] text-white border-b border-[#c5a059]/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo 
              settings={officeSettings} 
              variant="admin" 
              onClick={() => setActiveView('home')} 
            />
            <span className="hidden sm:inline-block text-[10px] bg-[#c5a059] text-[#07111e] px-2 py-0.5 rounded font-black tracking-wider uppercase">
              PAINEL ADMIN
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firestore em Tempo Real</span>
            </div>

            <button
              onClick={() => setActiveView('home')}
              className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Ver Site Público</span>
            </button>

            <button
              onClick={logout}
              className="bg-red-600/80 hover:bg-red-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#c5a059]" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'processes'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#c5a059]" />
            <span>Processos ({processes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-[#c5a059]" />
            <span>Clientes ({clients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lawyers')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'lawyers'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4 text-[#c5a059]" />
            <span>Advogados ({lawyers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'areas'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-[#c5a059]" />
            <span>Áreas de Atuação ({practiceAreas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 relative ${
              activeTab === 'requests'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#c5a059]" />
            <span>Solicitações ({contactRequests.length})</span>
            {pendingRequestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-[#c5a059]" />
            <span>Informações do Site</span>
          </button>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Clientes Cadastrados
                  </span>
                  <div className="font-serif-title text-3xl font-extrabold text-[#0b192c]">
                    {totalClients}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Acesso com CPF / E-mail</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Processos Ativos
                  </span>
                  <div className="font-serif-title text-3xl font-extrabold text-[#b38e42]">
                    {activeProcessesCount}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Em andamento na Justiça</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Processos Concluídos
                  </span>
                  <div className="font-serif-title text-3xl font-extrabold text-green-700">
                    {completedProcessesCount}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Finalizados com êxito</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                    Atendimentos Pendentes
                  </span>
                  <div className="font-serif-title text-3xl font-extrabold text-red-600">
                    {pendingRequestsCount}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Recebidos pelo formulário</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                  <h3 className="font-serif-title text-lg font-bold text-[#0b192c] flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#c5a059]" />
                    Últimos Processos Atualizados
                  </h3>
                  <button
                    onClick={() => setIsNewProcessModalOpen(true)}
                    className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Novo Processo</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {processes.slice(0, 4).map((proc) => (
                    <div
                      key={proc.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#c5a059] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#0b192c]">
                            {proc.processNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {proc.currentStatus}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{proc.clientName}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{proc.title}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProcess(proc);
                            setAdvanceStatusForm({
                              newStatus: proc.currentStatus,
                              description: '',
                              notes: proc.notes || '',
                            });
                            setIsAdvanceStatusModalOpen(true);
                          }}
                          className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Atualizar Andamento
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="font-serif-title text-base font-bold text-[#0b192c] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#c5a059]" />
                      Novas Mensagens do Site
                    </h3>
                  </div>

                  <div className="space-y-3 mb-4">
                    {contactRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#0b192c]">{req.name}</span>
                          <span className="text-[10px] text-slate-400">{req.createdAt.split(' ')[0]}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 mb-2">{req.description}</p>
                        <button
                          onClick={() => handleOpenWhatsAppClient(req.phone, req.name)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Chamar no WhatsApp ({req.phone})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('requests')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-lg transition-colors text-center"
                >
                  Ver Todas as Solicitações ({contactRequests.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROCESSES MANAGEMENT TAB */}
        {activeTab === 'processes' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Gestão de Processos Trabalhistas
                </h3>
                <p className="text-xs text-slate-500">
                  Cadastre novos processos, atualize andamentos e alimente a linha do tempo do cliente
                </p>
              </div>

              <button
                onClick={() => setIsNewProcessModalOpen(true)}
                className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                <span>Cadastrar Novo Processo</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar processo por número, nome do cliente ou empresa reclamada..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-4">
              {processes
                .filter(p => 
                  p.processNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.opposingParty.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((proc) => (
                  <div
                    key={proc.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-[#c5a059] transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-[#0b192c]">
                            {proc.processNumber}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {proc.currentStatus.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Última atualização: {proc.lastUpdateDate}
                          </span>
                        </div>

                        <h4 className="font-serif-title font-bold text-base text-[#0b192c]">
                          {proc.title}
                        </h4>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                          <span><strong>Cliente:</strong> {proc.clientName}</span>
                          <span><strong>Reclamada:</strong> {proc.opposingParty}</span>
                          <span><strong>Advogado:</strong> {proc.lawyerName}</span>
                          <span><strong>Vara:</strong> {proc.court}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedProcess(proc);
                            setAdvanceStatusForm({
                              newStatus: proc.currentStatus,
                              description: '',
                              notes: proc.notes || '',
                            });
                            setIsAdvanceStatusModalOpen(true);
                          }}
                          className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Avançar Status</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProcess(proc);
                            setIsEditProcessModalOpen(true);
                          }}
                          className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Dados</span>
                        </button>

                        <button
                          onClick={() => {
                            setItemToDelete({
                              type: 'process',
                              id: proc.id,
                              name: `Processo nº ${proc.processNumber} (${proc.clientName})`,
                            });
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Processo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {proc.notes && (
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-950">
                        <strong>Orientações visíveis ao cliente:</strong> {proc.notes}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. CLIENTS MANAGEMENT TAB */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Gestão de Clientes &amp; Logins
                </h3>
                <p className="text-xs text-slate-500">
                  Cadastre clientes e defina o CPF e a senha para acompanhamento dos processos
                </p>
              </div>

              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                <span>Novo Cliente</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clients.map((client) => (
                <div key={client.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-[#c5a059] transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#b38e42]">
                        {client.cpf || 'Sem CPF'}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold font-mono">
                        Senha: {client.passwordPlain}
                      </span>
                    </div>

                    <h4 className="font-serif-title text-base font-bold text-[#0b192c] mb-2">
                      {client.name}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.phone || 'Não informado'}</span>
                      </div>
                      {client.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="line-clamp-1">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Processos: {processes.filter(p => p.clientId === client.id).length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditClientModalOpen(true);
                        }}
                        className="text-slate-600 hover:text-[#0b192c] p-1 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({
                            type: 'client',
                            id: client.id,
                            name: `Cliente ${client.name}`,
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Excluir Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LAWYERS MANAGEMENT TAB */}
        {activeTab === 'lawyers' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Corpo Jurídico &amp; Advogados ({lawyers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Edite nomes, OABs, especialidades, fotos e biografias dos advogados exibidos no site
                </p>
              </div>

              <button
                onClick={() => setIsNewLawyerModalOpen(true)}
                className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                <span>Adicionar Advogado</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer) => (
                <div key={lawyer.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-[#c5a059] transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={lawyer.avatarUrl}
                        alt={lawyer.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#c5a059]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#0b192c]">{lawyer.name}</h4>
                        <span className="text-xs text-slate-500 font-mono">{lawyer.oab}</span>
                        <p className="text-[11px] font-semibold text-[#b38e42]">{lawyer.roleTitle}</p>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-800 mb-1">{lawyer.specialty}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4">{lawyer.bio}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedLawyer(lawyer);
                        setIsEditLawyerModalOpen(true);
                      }}
                      className="text-slate-700 hover:text-[#0b192c] font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Editar Advogado</span>
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete({
                          type: 'lawyer',
                          id: lawyer.id,
                          name: `Advogado(a) ${lawyer.name}`,
                        });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Excluir Advogado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PRACTICE AREAS TAB */}
        {activeTab === 'areas' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Áreas de Atuação Trabalhista ({practiceAreas.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Gerencie as teses, descrições e temas apresentados aos clientes na página principal
                </p>
              </div>

              <button
                onClick={() => setIsNewAreaModalOpen(true)}
                className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                <span>Nova Área de Atuação</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceAreas.map((area) => (
                <div key={area.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-[#c5a059] transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#b38e42]">
                        <Scale className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif-title font-bold text-sm text-[#0b192c]">
                        {area.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{area.shortDescription}</p>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Tópicos Frequentes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {area.commonTopics.map((top, idx) => (
                          <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedArea(area);
                        setIsEditAreaModalOpen(true);
                      }}
                      className="text-slate-700 hover:text-[#0b192c] font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Editar Área</span>
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete({
                          type: 'area',
                          id: area.id,
                          name: `Área de Atuação "${area.title}"`,
                        });
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Excluir Área"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CONTACT REQUESTS INBOX TAB */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Solicitações de Atendimento do Site ({contactRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Mensagens enviadas por potenciais clientes pelo formulário institucional
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {contactRequests.map((req) => (
                <div 
                  key={req.id}
                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-[#c5a059] transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif-title font-bold text-[#0b192c] text-sm sm:text-base">
                        {req.name}
                      </span>
                      <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                        {req.practiceArea}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{req.createdAt}</span>
                      <select
                        value={req.status}
                        onChange={(e) => updateContactRequestStatus(req.id, e.target.value as any)}
                        className="text-xs font-bold bg-white border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_atendimento">Em Atendimento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200">
                    <p className="font-bold text-[#0b192c] mb-1">{req.subject}</p>
                    <p className="leading-relaxed">{req.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span><strong>Telefone:</strong> {req.phone}</span>
                      <span><strong>E-mail:</strong> {req.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenWhatsAppClient(req.phone, req.name)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Abrir WhatsApp do Cliente</span>
                      </button>

                      <button
                        onClick={() => {
                          setItemToDelete({
                            type: 'request',
                            id: req.id,
                            name: `Solicitação de Contato de ${req.name}`,
                          });
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded cursor-pointer"
                        title="Excluir Solicitação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SETTINGS & STATS CONFIGURATION TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Configurações Institucionais e Dados do Site
                </h3>
                <p className="text-xs text-slate-500">
                  Altere os textos do banner principal, números de destaque, WhatsApp, telefones, endereço e história do escritório
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
              >
                <Save className="w-4 h-4 text-[#c5a059]" />
                <span>Salvar Informações</span>
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* SECTION 0: Logomarca da Empresa / Identidade Visual */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#c5a059]" />
                    Logomarca da Empresa &amp; Identidade Visual
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Altera a logo no cabeçalho, rodapé, painel e área do cliente
                  </span>
                </div>

                <LogoEditorSection
                  formData={settingsForm}
                  setFormData={setSettingsForm}
                  onSaveDirectly={(updated) => {
                    const merged = { ...settingsForm, ...updated };
                    setSettingsForm(merged);
                    updateOfficeSettings(merged);
                  }}
                />
              </div>

              {/* SECTION A: Banner Principal / Hero */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  Banner Principal do Site (Página Inicial / Hero)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selo / Etiqueta Superior de Especialização
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroBadge || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                    placeholder="Ex: Especialistas em Direito Trabalhista & Defesa do Trabalhador"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Título Principal de Destaque
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroTitle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    placeholder="Ex: Experiência, compromisso e segurança na defesa dos seus direitos."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-[#0b192c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subtítulo / Parágrafo Explicativo do Banner
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.heroSubtitle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    placeholder="Atuação combativa e humanizada para trabalhadores..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION B: Números e Estatísticas */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                  Números em Destaque no Site (Estatísticas Institucionais)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advogados</label>
                    <input
                      type="text"
                      value={settingsForm.statsLawyersCount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statsLawyersCount: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Anos de Experiência</label>
                    <input
                      type="text"
                      value={settingsForm.statsYearsExperience}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statsYearsExperience: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clientes Atendidos</label>
                    <input
                      type="text"
                      value={settingsForm.statsClientsServed}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statsClientsServed: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Processos Acompanhados</label>
                    <input
                      type="text"
                      value={settingsForm.statsCasesHandled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statsCasesHandled: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-[#0b192c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Taxa de Avaliação</label>
                    <input
                      type="text"
                      value={settingsForm.statsSatisfactionRate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statsSatisfactionRate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-[#0b192c]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Telefones, WhatsApp e Atendimento */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#c5a059]" />
                    Telefones, WhatsApp &amp; Comunicação
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Estes números alimentam o botão flutuante, cabeçalho, rodapé e formulário
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
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value.replace(/\D/g, '') })}
                        placeholder="Ex: 5511999998888"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-mono"
                      />
                      <a
                        href={`https://wa.me/${settingsForm.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        title="Testar abertura no WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Testar</span>
                      </a>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Usado para abrir diretamente a conversa com o cliente.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      WhatsApp Formatado (Texto Visual no Site)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappFormatted}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappFormatted: e.target.value })}
                      placeholder="Ex: (11) 99999-8888"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-[#0b192c]"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Formato amigável exibido nos botões e no topo.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telefone Fixo Principal (PABX)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        placeholder="Ex: (11) 3456-7890"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                      />
                      <a
                        href={`tel:${(settingsForm.phone || '').replace(/\D/g, '')}`}
                        className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        title="Testar discagem"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Ligar</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Telefone Secundário / Plantão de Urgência
                    </label>
                    <input
                      type="text"
                      value={settingsForm.secondaryPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Exibido como canal complementar nos canais oficiais.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION C: E-mails Oficiais & Horário */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#c5a059]" />
                  E-mails Institucionais &amp; Expediente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      E-mail Institucional Principal
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        placeholder="contato@almeidaetorres.adv.br"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                      />
                      <a
                        href={`mailto:${settingsForm.email}`}
                        className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        title="Testar envio de e-mail"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Enviar</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      E-mail Jurídico / Recepção de Documentos
                    </label>
                    <input
                      type="email"
                      value={settingsForm.documentEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, documentEmail: e.target.value })}
                      placeholder="juridico@almeidaetorres.adv.br"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Horário de Funcionamento / Atendimento
                    </label>
                    <input
                      type="text"
                      value={settingsForm.workingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                      placeholder="Ex: Segunda a Sexta, das 08h30 às 18h00 (Plantão WhatsApp 24h)"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: Localização, Endereço Físico & Google Maps */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#c5a059]" />
                    Localização, Endereço Físico &amp; Rota (Google Maps)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Dados do escritório físico com integração direta ao Google Maps
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Endereço (Logradouro, Número e Sala/Andar)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="Ex: Av. Paulista, 1000, Conjunto 1401"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Bairro / Região
                    </label>
                    <input
                      type="text"
                      value={settingsForm.neighborhood || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, neighborhood: e.target.value })}
                      placeholder="Ex: Bela Vista"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={settingsForm.postalCode || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, postalCode: e.target.value })}
                      placeholder="Ex: 01310-100"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Cidade e Estado (UF)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.cityState}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cityState: e.target.value })}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Link do Google Maps / Traçar Rota
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={settingsForm.mapsUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, mapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                      />
                      <a
                        href={settingsForm.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${settingsForm.address}, ${settingsForm.cityState}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#c5a059] hover:bg-[#b38e42] text-[#07111e] text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 flex-shrink-0 transition-colors"
                        title="Ver rota no Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Ver Mapa</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION E: Identidade e Slogan */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#c5a059]" />
                  Identidade do Escritório &amp; Slogan Institucional
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Escritório</label>
                    <input
                      type="text"
                      value={settingsForm.officeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, officeName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slogan / Tagline Institucional</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: História e Textos Institucionais */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c5a059]" />
                  Textos Institucionais (Página Sobre Nós)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">História / Apresentação do Escritório</label>
                  <textarea
                    rows={3}
                    value={settingsForm.aboutHistory}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutHistory: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nossa Missão</label>
                    <textarea
                      rows={2}
                      value={settingsForm.aboutMission}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aboutMission: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nossos Valores</label>
                    <textarea
                      rows={2}
                      value={settingsForm.aboutValues}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aboutValues: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Metodologia e Abordagem de Atendimento</label>
                  <textarea
                    rows={2}
                    value={settingsForm.aboutApproach}
                    onChange={(e) => setSettingsForm({ ...settingsForm, aboutApproach: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>

              {/* SECTION E: Redes Sociais */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-serif-title text-sm font-bold text-[#0b192c] mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#c5a059]" />
                  Links de Redes Sociais
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instagram</label>
                    <input
                      type="url"
                      value={settingsForm.socialInstagram || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={settingsForm.socialLinkedin || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facebook</label>
                    <input
                      type="url"
                      value={settingsForm.socialFacebook || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, socialFacebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja restaurar todos os dados e números para os padrões originais de demonstração?')) {
                      resetToDefaultData();
                      showToast('Dados restaurados para o padrão.');
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Restaurar dados de fábrica (Reset)
                </button>

                <button
                  type="submit"
                  className="bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4 text-[#c5a059]" />
                  <span>Salvar Todas as Alterações</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* MODAL: Cadastrar Novo Processo */}
      {isNewProcessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewProcessModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Cadastrar Novo Processo Trabalhista
            </h3>

            <form onSubmit={handleCreateProcess} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nº do Processo *</label>
                  <input
                    type="text"
                    required
                    value={newProcForm.processNumber}
                    onChange={(e) => setNewProcForm({ ...newProcForm, processNumber: e.target.value })}
                    placeholder="0010000-00.2024.5.02.0001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vincular Cliente *</label>
                  <select
                    required
                    value={newProcForm.clientId}
                    onChange={(e) => setNewProcForm({ ...newProcForm, clientId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="">Selecione o Cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.cpf || c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título / Objeto da Ação *</label>
                <input
                  type="text"
                  required
                  value={newProcForm.title}
                  onChange={(e) => setNewProcForm({ ...newProcForm, title: e.target.value })}
                  placeholder="Ex: Reclamatória Trabalhista - Horas Extras e Verbas Rescisórias"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advogado Titular</label>
                  <select
                    value={newProcForm.lawyerId}
                    onChange={(e) => setNewProcForm({ ...newProcForm, lawyerId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.oab})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Empresa Reclamada *</label>
                  <input
                    type="text"
                    required
                    value={newProcForm.opposingParty}
                    onChange={(e) => setNewProcForm({ ...newProcForm, opposingParty: e.target.value })}
                    placeholder="Ex: Empresa Exemplo S.A."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vara / Tribunal</label>
                  <input
                    type="text"
                    value={newProcForm.court}
                    onChange={(e) => setNewProcForm({ ...newProcForm, court: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fase Inicial</label>
                  <select
                    value={newProcForm.currentStatus}
                    onChange={(e) => setNewProcForm({ ...newProcForm, currentStatus: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="iniciado">1. Processo Iniciado</option>
                    <option value="documentacao">2. Documentação Recebida</option>
                    <option value="protocolado">3. Processo Protocolado</option>
                    <option value="aguardando_manifestacao">4. Aguardando Manifestação</option>
                    <option value="audiencia">5. Audiência</option>
                    <option value="sentenca">6. Sentença</option>
                    <option value="recurso">7. Recurso</option>
                    <option value="execucao">8. Execução</option>
                    <option value="concluido">9. Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações do Advogado ao Cliente</label>
                <textarea
                  rows={3}
                  value={newProcForm.notes}
                  onChange={(e) => setNewProcForm({ ...newProcForm, notes: e.target.value })}
                  placeholder="Orientações e instruções iniciais para o cliente acompanhar no portal..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProcessModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Salvar Processo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Atualizar Andamento do Processo */}
      {isAdvanceStatusModalOpen && selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative">
            <button
              onClick={() => setIsAdvanceStatusModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-1">
              Atualizar Andamento do Processo
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono font-bold">
              {selectedProcess.processNumber} ({selectedProcess.clientName})
            </p>

            <form onSubmit={handleAdvanceStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Novo Status / Fase *</label>
                <select
                  value={advanceStatusForm.newStatus}
                  onChange={(e) => setAdvanceStatusForm({ ...advanceStatusForm, newStatus: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold"
                >
                  <option value="iniciado">1. Processo Iniciado</option>
                  <option value="documentacao">2. Documentação Recebida</option>
                  <option value="protocolado">3. Processo Protocolado</option>
                  <option value="aguardando_manifestacao">4. Aguardando Manifestação</option>
                  <option value="audiencia">5. Audiência</option>
                  <option value="sentenca">6. Sentença</option>
                  <option value="recurso">7. Recurso / 2ª Instância</option>
                  <option value="execucao">8. Execução e Cálculos</option>
                  <option value="concluido">9. Processo Concluído com Êxito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição do Despacho / Andamento</label>
                <textarea
                  rows={2}
                  value={advanceStatusForm.description}
                  onChange={(e) => setAdvanceStatusForm({ ...advanceStatusForm, description: e.target.value })}
                  placeholder="Ex: Audiência de instrução realizada perante o MM. Juízo. Testemunhas ouvidas com sucesso."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações ao Cliente (Portal)</label>
                <textarea
                  rows={3}
                  value={advanceStatusForm.notes}
                  onChange={(e) => setAdvanceStatusForm({ ...advanceStatusForm, notes: e.target.value })}
                  placeholder="Orientações e próximos passos que o cliente verá em destaque..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdvanceStatusModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Confirmar Atualização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Processo */}
      {isEditProcessModalOpen && selectedProcess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditProcessModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Editar Dados do Processo
            </h3>

            <form onSubmit={handleEditProcessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nº do Processo</label>
                <input
                  type="text"
                  value={selectedProcess.processNumber}
                  onChange={(e) => setSelectedProcess({ ...selectedProcess, processNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Ação</label>
                <input
                  type="text"
                  value={selectedProcess.title}
                  onChange={(e) => setSelectedProcess({ ...selectedProcess, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Empresa Reclamada</label>
                  <input
                    type="text"
                    value={selectedProcess.opposingParty}
                    onChange={(e) => setSelectedProcess({ ...selectedProcess, opposingParty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vara / Tribunal</label>
                  <input
                    type="text"
                    value={selectedProcess.court}
                    onChange={(e) => setSelectedProcess({ ...selectedProcess, court: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Observações do Advogado ao Cliente</label>
                <textarea
                  rows={3}
                  value={selectedProcess.notes || ''}
                  onChange={(e) => setSelectedProcess({ ...selectedProcess, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProcessModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Novo Cliente */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative">
            <button
              onClick={() => setIsNewClientModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Cadastrar Novo Cliente
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CPF (Login do Cliente) *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.cpf}
                    onChange={(e) => setClientForm({ ...clientForm, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.passwordPlain}
                    onChange={(e) => setClientForm({ ...clientForm, passwordPlain: e.target.value })}
                    placeholder="cliente123"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="(11) 99999-8888"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Criar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Cliente */}
      {isEditClientModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative">
            <button
              onClick={() => setIsEditClientModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Editar Cadastro do Cliente
            </h3>

            <form onSubmit={handleEditClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CPF</label>
                  <input
                    type="text"
                    value={selectedClient.cpf || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, cpf: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso</label>
                  <input
                    type="text"
                    value={selectedClient.passwordPlain}
                    onChange={(e) => setSelectedClient({ ...selectedClient, passwordPlain: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={selectedClient.email}
                    onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={selectedClient.phone || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  value={selectedClient.address || ''}
                  onChange={(e) => setSelectedClient({ ...selectedClient, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditClientModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Novo Advogado */}
      {isNewLawyerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewLawyerModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Adicionar Advogado à Equipe
            </h3>

            <form onSubmit={handleCreateLawyer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={lawyerForm.name}
                  onChange={(e) => setLawyerForm({ ...lawyerForm, name: e.target.value })}
                  placeholder="Ex: Dr. Nome Sobrenome"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">OAB *</label>
                  <input
                    type="text"
                    required
                    value={lawyerForm.oab}
                    onChange={(e) => setLawyerForm({ ...lawyerForm, oab: e.target.value })}
                    placeholder="OAB/SP 000.000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    value={lawyerForm.roleTitle}
                    onChange={(e) => setLawyerForm({ ...lawyerForm, roleTitle: e.target.value })}
                    placeholder="Ex: Advogado Associado Sênior"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especialidade Principal *</label>
                <input
                  type="text"
                  required
                  value={lawyerForm.specialty}
                  onChange={(e) => setLawyerForm({ ...lawyerForm, specialty: e.target.value })}
                  placeholder="Ex: Rescisões & Verbas Trabalhistas"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biografia &amp; Trajetória</label>
                <textarea
                  rows={3}
                  value={lawyerForm.bio}
                  onChange={(e) => setLawyerForm({ ...lawyerForm, bio: e.target.value })}
                  placeholder="Resumo da formação, pós-graduação e atuação jurídica..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL da Foto de Perfil</label>
                <input
                  type="url"
                  value={lawyerForm.avatarUrl}
                  onChange={(e) => setLawyerForm({ ...lawyerForm, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLawyerModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Cadastrar Advogado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Advogado */}
      {isEditLawyerModalOpen && selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditLawyerModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Editar Informações do Advogado
            </h3>

            <form onSubmit={handleEditLawyerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={selectedLawyer.name}
                  onChange={(e) => setSelectedLawyer({ ...selectedLawyer, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">OAB</label>
                  <input
                    type="text"
                    required
                    value={selectedLawyer.oab}
                    onChange={(e) => setSelectedLawyer({ ...selectedLawyer, oab: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo / Título</label>
                  <input
                    type="text"
                    value={selectedLawyer.roleTitle}
                    onChange={(e) => setSelectedLawyer({ ...selectedLawyer, roleTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Especialidade Principal</label>
                <input
                  type="text"
                  value={selectedLawyer.specialty}
                  onChange={(e) => setSelectedLawyer({ ...selectedLawyer, specialty: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biografia</label>
                <textarea
                  rows={3}
                  value={selectedLawyer.bio}
                  onChange={(e) => setSelectedLawyer({ ...selectedLawyer, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL da Foto</label>
                <input
                  type="url"
                  value={selectedLawyer.avatarUrl}
                  onChange={(e) => setSelectedLawyer({ ...selectedLawyer, avatarUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const l = selectedLawyer;
                    setIsEditLawyerModalOpen(false);
                    if (l) {
                      setItemToDelete({
                        type: 'lawyer',
                        id: l.id,
                        name: `Advogado(a) ${l.name}`,
                      });
                    }
                  }}
                  className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Advogado</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditLawyerModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs px-6 py-2 rounded-lg shadow cursor-pointer transition-colors"
                  >
                    Salvar Advogado
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nova Área de Atuação */}
      {isNewAreaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewAreaModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Cadastrar Nova Área de Atuação
            </h3>

            <form onSubmit={handleCreateArea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Área *</label>
                <input
                  type="text"
                  required
                  value={areaForm.title}
                  onChange={(e) => setAreaForm({ ...areaForm, title: e.target.value })}
                  placeholder="Ex: Rescisão Indireta por Falta Grave"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resumo Curto (Card) *</label>
                <input
                  type="text"
                  required
                  value={areaForm.shortDescription}
                  onChange={(e) => setAreaForm({ ...areaForm, shortDescription: e.target.value })}
                  placeholder="Ex: Rompimento do contrato por culpa do empregador..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição Completa</label>
                <textarea
                  rows={3}
                  value={areaForm.fullDescription}
                  onChange={(e) => setAreaForm({ ...areaForm, fullDescription: e.target.value })}
                  placeholder="Detalhes sobre a tese jurídica, direitos e jurisprudência..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tópicos Comuns (Um por linha)</label>
                <textarea
                  rows={3}
                  value={areaForm.commonTopics}
                  onChange={(e) => setAreaForm({ ...areaForm, commonTopics: e.target.value })}
                  placeholder="Atraso reiterado de salários&#10;Falta de recolhimento de FGTS&#10;Assédio moral"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewAreaModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Criar Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Área de Atuação */}
      {isEditAreaModalOpen && selectedArea && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditAreaModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-4">
              Editar Área de Atuação
            </h3>

            <form onSubmit={handleEditAreaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Área</label>
                <input
                  type="text"
                  required
                  value={selectedArea.title}
                  onChange={(e) => setSelectedArea({ ...selectedArea, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resumo Curto (Card)</label>
                <input
                  type="text"
                  required
                  value={selectedArea.shortDescription}
                  onChange={(e) => setSelectedArea({ ...selectedArea, shortDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição Completa</label>
                <textarea
                  rows={3}
                  value={selectedArea.fullDescription}
                  onChange={(e) => setSelectedArea({ ...selectedArea, fullDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditAreaModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0b192c] text-white font-bold text-xs px-6 py-2 rounded-lg"
                >
                  Salvar Área
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Safe Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#0b192c]">
                Confirmar Exclusão
              </h3>
              <p className="text-xs text-slate-600 mt-2">
                Tem certeza que deseja excluir <strong>{itemToDelete.name}</strong>? Esta ação removerá o registro do sistema e do site.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (itemToDelete.type === 'lawyer') {
                    deleteLawyer(itemToDelete.id);
                    showToast('Advogado excluído com sucesso.');
                  } else if (itemToDelete.type === 'client') {
                    deleteClient(itemToDelete.id);
                    showToast('Cliente excluído.');
                  } else if (itemToDelete.type === 'process') {
                    deleteProcess(itemToDelete.id);
                    showToast('Processo excluído.');
                  } else if (itemToDelete.type === 'area') {
                    deletePracticeArea(itemToDelete.id);
                    showToast('Área de atuação excluída.');
                  } else if (itemToDelete.type === 'request') {
                    deleteContactRequest(itemToDelete.id);
                    showToast('Solicitação excluída.');
                  }
                  setItemToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg shadow-md transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
