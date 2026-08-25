import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Briefcase, 
  Scale, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut, 
  MessageCircle, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FolderOpen,
  Edit3,
  CheckCircle2,
  X,
  Building,
  Save,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProcessTimeline } from './ProcessTimeline';
import { LegalProcess } from '../types';

export const ClientArea: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    processes, 
    officeSettings, 
    setActiveView,
    lawyers,
    updateClient
  } = useApp();

  // If somehow not logged in as client
  if (!currentUser || currentUser.role !== 'client') {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <p className="text-slate-600 mb-4">Você precisa estar logado como cliente para visualizar esta área.</p>
        <button
          onClick={() => setActiveView('home')}
          className="bg-[#0b192c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
        >
          Voltar para a Página Inicial
        </button>
      </div>
    );
  }

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    cpf: currentUser.cpf || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    address: currentUser.address || '',
    city: currentUser.city || '',
    state: currentUser.state || '',
    profession: currentUser.profession || '',
    companyName: currentUser.companyName || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  // Helper formatters
  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: currentUser.name || '',
      cpf: currentUser.cpf || '',
      phone: currentUser.phone || '',
      email: currentUser.email || '',
      address: currentUser.address || '',
      city: currentUser.city || '',
      state: currentUser.state || '',
      profession: currentUser.profession || '',
      companyName: currentUser.companyName || '',
    });
    setProfileSaveSuccess(false);
    setProfileSaveError('');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileSaveError('Por favor, informe seu nome completo.');
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError('');

    try {
      updateClient(currentUser.id, {
        name: profileForm.name.trim(),
        cpf: profileForm.cpf.trim(),
        phone: profileForm.phone.trim(),
        email: profileForm.email.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        profession: profileForm.profession.trim(),
        companyName: profileForm.companyName.trim(),
      });

      setProfileSaveSuccess(true);
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileSaveSuccess(false);
      }, 1200);
    } catch (err: any) {
      setProfileSaveError('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filter processes belonging strictly to this client (by ID or CPF)
  const clientProcesses = processes.filter(
    p => p.clientId === currentUser.id || (currentUser.cpf && p.clientCpf === currentUser.cpf)
  );

  const [selectedProcessId, setSelectedProcessId] = useState<string>(
    clientProcesses[0]?.id || ''
  );

  const activeProcess = clientProcesses.find(p => p.id === selectedProcessId) || clientProcesses[0];

  const handleContactLawyer = (proc: LegalProcess) => {
    const text = encodeURIComponent(
      `Olá, ${proc.lawyerName}! Sou o(a) cliente ${currentUser.name} e tenho uma dúvida sobre o processo nº ${proc.processNumber}.`
    );
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${text}`, '_blank');
  };

  const isProfileIncomplete = !currentUser.cpf || !currentUser.phone;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      
      {/* Top Header Banner */}
      <div className="bg-[#07111e] text-white border-b border-[#c5a059]/30 pt-10 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0b192c] border-2 border-[#c5a059] flex items-center justify-center text-[#f6e088] shadow-lg flex-shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#f6e088] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal do Cliente | Ambiente Seguro</span>
              </div>
              <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-white">
                Olá, {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Seja bem-vindo(a) à sua área exclusiva de acompanhamento processual e cadastro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Ir ao Site Principal
            </button>

            <button
              onClick={logout}
              className="bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Client Data & Process Selector */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Personal Data Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="font-serif-title text-base font-bold text-[#0b192c] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#c5a059]" />
                  Seus Dados Cadastrais
                </h3>

                <button
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0b192c] hover:text-[#b38e42] bg-amber-50 hover:bg-amber-100/80 border border-[#c5a059]/40 px-2.5 py-1 rounded-lg transition-colors"
                  title="Editar ou atualizar seus dados cadastrais"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Editar Dados</span>
                </button>
              </div>

              {/* Incomplete profile callout */}
              {isProfileIncomplete && (
                <div className="mb-4 bg-amber-50/90 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#b38e42] flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-950">Cadastro Incompleto</p>
                    <p className="text-amber-900/80 text-[11px] mb-2">
                      Cadastre seu CPF e WhatsApp para vincularmos seus processos automaticamente.
                    </p>
                    <button
                      onClick={handleOpenEditProfile}
                      className="bg-[#c5a059] hover:bg-[#b38e42] text-[#07111e] font-extrabold text-[11px] px-3 py-1 rounded-md transition-colors"
                    >
                      Cadastrar Dados Agora
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Nome Completo</span>
                  <span className="font-semibold text-slate-800 text-sm">{currentUser.name}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">CPF</span>
                  <span className={`font-semibold ${currentUser.cpf ? 'text-slate-800 font-mono' : 'text-amber-700 italic'}`}>
                    {currentUser.cpf || 'Não informado (clique em Editar)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">E-mail</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Telefone / WhatsApp</span>
                  <span className={`font-semibold ${currentUser.phone ? 'text-slate-800' : 'text-amber-700 italic'}`}>
                    {currentUser.phone || 'Não informado (clique em Editar)'}
                  </span>
                </div>

                {currentUser.profession && (
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px] font-bold">Profissão / Cargo</span>
                    <span className="font-semibold text-slate-800">{currentUser.profession}</span>
                  </div>
                )}

                {(currentUser.address || currentUser.city) && (
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px] font-bold">Endereço</span>
                    <span className="font-semibold text-slate-800">
                      {[currentUser.address, currentUser.city, currentUser.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Mantenha seus dados atualizados
                  </span>
                  <button
                    onClick={handleOpenEditProfile}
                    className="text-[#b38e42] hover:underline font-bold text-xs"
                  >
                    Alterar Cadastro →
                  </button>
                </div>
              </div>
            </div>

            {/* List of Client Processes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-serif-title text-base font-bold text-[#0b192c] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#c5a059]" />
                  Seus Processos ({clientProcesses.length})
                </h3>
              </div>

              {clientProcesses.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>Nenhum processo vinculado ao seu cadastro no momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProcesses.map((proc) => {
                    const isSelected = proc.id === activeProcess?.id;
                    return (
                      <div
                        key={proc.id}
                        onClick={() => setSelectedProcessId(proc.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50/50 border-[#c5a059] shadow-sm ring-1 ring-[#c5a059]/40'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono font-bold text-[#0b192c]">
                            {proc.processNumber}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            proc.currentStatus === 'concluido'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {proc.currentStatus}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 line-clamp-1 mb-1">
                          {proc.title}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{proc.court}</span>
                          <span className="font-medium text-[#b38e42]">Ver detalhes →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Contact with Office Card */}
            <div className="bg-gradient-to-br from-[#0b192c] to-[#162a45] rounded-2xl p-6 text-white shadow-md border border-[#c5a059]/30">
              <h4 className="font-serif-title text-base font-bold text-[#f6e088] mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#c5a059]" />
                Dúvidas sobre o andamento?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Você pode enviar uma mensagem direta para o advogado responsável pelo seu processo.
              </p>
              {activeProcess && (
                <button
                  onClick={() => handleContactLawyer(activeProcess)}
                  className="w-full bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-[#07111e]/20" />
                  <span>Falar com {activeProcess.lawyerName.split(' ')[0]}</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Active Process Details & Full Timeline */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeProcess ? (
              <>
                {/* Active Process Overview Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Processo Selecionado
                      </span>
                      <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#0b192c]">
                        {activeProcess.title}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Nº do Processo</span>
                      <span className="text-sm sm:base font-mono font-bold text-[#0b192c] bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                        {activeProcess.processNumber}
                      </span>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Advogado Responsável
                      </span>
                      <p className="text-sm font-bold text-[#0b192c]">
                        {activeProcess.lawyerName}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold">
                        {activeProcess.lawyerOab}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Tribunal / Órgão
                      </span>
                      <p className="text-sm font-bold text-[#0b192c]">
                        {activeProcess.court}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activeProcess.type}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Parte Reclamada (Empresa)
                      </span>
                      <p className="text-sm font-bold text-[#0b192c]">
                        {activeProcess.opposingParty}
                      </p>
                      <p className="text-xs text-slate-500">
                        Valor Estimado: {activeProcess.valueEstimated || 'A liquidar'}
                      </p>
                    </div>
                  </div>

                  {/* Latest Lawyer General Note */}
                  {activeProcess.notes && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <Scale className="w-5 h-5 text-[#b38e42] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase text-amber-900 block mb-0.5">
                          Instruções &amp; Último Parecer do Escritório:
                        </span>
                        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                          {activeProcess.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual Timeline Component */}
                <ProcessTimeline process={activeProcess} />
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 shadow-md">
                <div className="w-16 h-16 bg-amber-50 text-[#b38e42] border border-[#c5a059]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#0b192c] mb-2">
                  Cadastro Concluído com Sucesso!
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  Sua conta de cliente está ativa. Assim que seu processo trabalhista for distribuído ou vinculado pela nossa equipe jurídica, todas as etapas e intimações aparecerão nesta linha do tempo.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Olá! Acabei de criar minha conta no Portal do Cliente (${currentUser.name}) e gostaria de verificar o cadastro do meu processo.`);
                      window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
                    }}
                    className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#07111e]/20" />
                    <span>Vincular Meu Processo no WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setActiveView('home')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-3 rounded-xl transition-colors"
                  >
                    Voltar ao Site Inicial
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL: Editar / Cadastrar Dados do Usuário */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
                  Atualizar Dados Cadastrais
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha seus dados para mantermos seu prontuário e processo atualizados
                </p>
              </div>
            </div>

            {profileSaveSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Dados cadastrais atualizados com sucesso!</span>
              </div>
            )}

            {profileSaveError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{profileSaveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    CPF (Cadastro de Pessoa Física)
                  </label>
                  <input
                    type="text"
                    value={profileForm.cpf}
                    onChange={(e) => setProfileForm({ ...profileForm, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Usado para vincular seus processos trabalhistas
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: formatPhone(e.target.value) })}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Para avisos de audiências e intimações
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="seuemail@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Profissão / Cargo Atual
                  </label>
                  <input
                    type="text"
                    value={profileForm.profession}
                    onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                    placeholder="Ex: Motorista, Operador, Analista..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Empresa Reclamada / Ex-Empregador
                  </label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    placeholder="Nome da empresa do processo"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Endereço Residencial Completo
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Rua, número, complemento, bairro"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value.toUpperCase() })}
                    placeholder="Ex: SP"
                    maxLength={2}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-[#c5a059] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Salvar Dados Cadastrais</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

