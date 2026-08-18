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
  FolderOpen
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
    lawyers
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
                Seja bem-vindo(a) à sua área exclusiva de acompanhamento processual.
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
              <h3 className="font-serif-title text-base font-bold text-[#0b192c] mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#c5a059]" />
                Seus Dados Cadastrais
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Nome Completo</span>
                  <span className="font-semibold text-slate-800 text-sm">{currentUser.name}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">CPF</span>
                  <span className="font-semibold text-slate-800">{currentUser.cpf || 'Não informado'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">E-mail</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">Telefone / WhatsApp</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone || '(11) 98765-4321'}</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block">
                    * Para atualizar seus dados pessoais ou endereço, solicite à nossa recepção via WhatsApp.
                  </span>
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
                      <span className="text-sm sm:text-base font-mono font-bold text-[#0b192c] bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
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
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-md">
                <p className="text-slate-500 text-sm">Selecione um processo ao lado para visualizar a linha do tempo.</p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
