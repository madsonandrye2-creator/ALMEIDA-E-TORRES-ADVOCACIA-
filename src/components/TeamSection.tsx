import React, { useState } from 'react';
import { Users, Award, Mail, Phone, ExternalLink, X, Shield, Scale, MessageCircle, Edit3, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lawyer } from '../types';
import { EditLawyerModal } from './EditLawyerModal';
import { AdminSectionEditButton } from './AdminSectionEditButton';

export const TeamSection: React.FC = () => {
  const { 
    lawyers, 
    selectedLawyerForDetail, 
    setSelectedLawyerForDetail, 
    officeSettings,
    currentUser,
  } = useApp();

  const [lawyerToEdit, setLawyerToEdit] = useState<Lawyer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingNewLawyer, setIsCreatingNewLawyer] = useState(false);

  const handleOpenEditModal = (lawyer: Lawyer) => {
    setLawyerToEdit(lawyer);
    setIsCreatingNewLawyer(false);
    setIsEditModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setLawyerToEdit(null);
    setIsCreatingNewLawyer(true);
    setIsEditModalOpen(true);
  };

  const handleContactLawyer = (lawyerName: string) => {
    const msg = encodeURIComponent(`Olá! Gostaria de uma orientação jurídica com ${lawyerName} da ${officeSettings.officeName}.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <section id="equipe" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 relative">
          {currentUser?.role === 'admin' && (
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#162a45] text-white border border-[#c5a059] text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#f6e088]" />
                <span>Adicionar Novo Advogado</span>
              </button>
              <AdminSectionEditButton tab="texts" label="Alterar Textos da Equipe" />
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b38e42] bg-amber-50 px-3 py-1 rounded-md border border-amber-200/60 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Corpo Jurídico Especializado</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#0b192c] mb-4">
            Nossa Equipe de Advogados
          </h2>
          <div className="w-16 h-1 bg-[#c5a059] mx-auto mb-5 rounded-full" />
          <p className="text-slate-600 text-base leading-relaxed">
            Contamos com <strong className="text-[#0b192c]">{lawyers.length} advogados</strong> altamente qualificados, 
            combinando sólida experiência processual, estudo contínuo e dedicação exclusiva à defesa do trabalhador.
          </p>
        </div>

        {/* Admin Quick Action Banner */}
        {currentUser?.role === 'admin' && (
          <div className="mb-8 max-w-3xl mx-auto bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
              <span>
                <strong>Modo Administrador:</strong> Você pode clicar no botão <strong>"Editar Informações"</strong> em qualquer card abaixo para alterar nome, OAB, foto, cargo, telefone, e-mail e bio.
              </span>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Advogado</span>
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mb-10 max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-lg p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>* Todas as informações, fotos e contatos dos advogados são editáveis em tempo real pelo administrador.</span>
        </div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-slate-50 hover:bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-[#c5a059] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative"
            >
              {/* Admin quick edit corner badge */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => handleOpenEditModal(lawyer)}
                  className="absolute top-3 right-3 z-20 bg-[#0b192c]/90 hover:bg-[#0b192c] text-[#f6e088] hover:text-white border border-[#c5a059] px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm transition-all cursor-pointer"
                  title="Editar este advogado"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}

              <div>
                {/* Photo & Role Badge */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                  <img
                    src={lawyer.avatarUrl}
                    alt={lawyer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111e]/90 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[11px] font-semibold text-[#f6e088] bg-[#07111e]/80 px-2 py-0.5 rounded backdrop-blur-sm border border-[#c5a059]/40">
                      {lawyer.roleTitle}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5">
                  <h3 className="font-serif-title text-base font-bold text-[#0b192c] mb-1 group-hover:text-[#b38e42] transition-colors">
                    {lawyer.name}
                  </h3>

                  <div className="inline-block text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded mb-2.5">
                    {lawyer.oab}
                  </div>

                  <p className="text-xs font-semibold text-[#0b192c] mb-2 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-[#c5a059]" />
                    <span>{lawyer.specialty}</span>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lawyer.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  onClick={() => setSelectedLawyerForDetail(lawyer)}
                  className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Ver Perfil Completo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleOpenEditModal(lawyer)}
                    className="w-full bg-white hover:bg-amber-50 text-[#0b192c] border border-amber-300 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#c5a059]" />
                    <span>Editar Informações</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Admin "Add New Lawyer" Card in Grid */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenCreateModal}
              className="border-2 border-dashed border-[#c5a059]/60 hover:border-[#c5a059] bg-amber-50/40 hover:bg-amber-50/80 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-all min-h-[360px] group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#0b192c] text-[#f6e088] flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-base text-[#0b192c]">
                  Adicionar Novo Advogado
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Cadastre novos membros da equipe com foto, especialidade, OAB, contatos e biografia.
                </p>
              </div>
              <span className="text-xs font-bold text-[#b38e42] bg-white px-3 py-1 rounded-full border border-amber-200">
                + Novo Cadastro
              </span>
            </button>
          )}
        </div>

      </div>

      {/* Lawyer Detail Modal */}
      {selectedLawyerForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedLawyerForDetail(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start mb-6">
              <img
                src={selectedLawyerForDetail.avatarUrl}
                alt={selectedLawyerForDetail.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#c5a059] shadow-md flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider">
                  {selectedLawyerForDetail.roleTitle}
                </span>
                <h3 className="font-serif-title text-xl font-bold text-[#0b192c] mb-1">
                  {selectedLawyerForDetail.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {selectedLawyerForDetail.oab}
                </p>
                <p className="text-xs font-semibold text-[#0b192c] flex items-center justify-center sm:justify-start gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>{selectedLawyerForDetail.specialty}</span>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">
                Biografia &amp; Atuação:
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedLawyerForDetail.bio}
              </p>
            </div>

            <div className="space-y-2 mb-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c5a059]" />
                <span>{selectedLawyerForDetail.email}</span>
              </div>
              {selectedLawyerForDetail.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#c5a059]" />
                  <span>{selectedLawyerForDetail.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    const target = selectedLawyerForDetail;
                    setSelectedLawyerForDetail(null);
                    handleOpenEditModal(target);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-[#0b192c] text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Editar este Advogado</span>
                </button>
              )}

              <button
                onClick={() => setSelectedLawyerForDetail(null)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const name = selectedLawyerForDetail.name;
                  setSelectedLawyerForDetail(null);
                  handleContactLawyer(name);
                }}
                className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Lawyer Modal */}
      <EditLawyerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        lawyerToEdit={lawyerToEdit}
        isCreatingNew={isCreatingNewLawyer}
      />
    </section>
  );
};
