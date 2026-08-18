import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  Trash2, 
  Users, 
  Scale, 
  Sparkles, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lawyer } from '../types';

interface EditLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerToEdit?: Lawyer | null;
  isCreatingNew?: boolean;
}

const PRESET_AVATARS = [
  {
    label: 'Advogado 1 (Terno Escuro)',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogada 1 (Blazer Preto)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogado 2 (Executivo Sênior)',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogada 2 (Perfil Corporativo)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogado 3 (Jovem Dinâmico)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogada 3 (Especialista)',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogado 4 (Consultor Sênior)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Advogada 4 (Coordenação)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  }
];

export const EditLawyerModal: React.FC<EditLawyerModalProps> = ({
  isOpen,
  onClose,
  lawyerToEdit,
  isCreatingNew = false,
}) => {
  const { updateLawyer, addLawyer, deleteLawyer, currentUser } = useApp();

  const [formData, setFormData] = useState<Partial<Lawyer>>({
    name: '',
    oab: '',
    specialty: '',
    roleTitle: 'Advogado Associado',
    bio: '',
    email: '',
    phone: '',
    avatarUrl: PRESET_AVATARS[0].url,
    highlighted: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    setIsDeleting(false);
    if (lawyerToEdit && !isCreatingNew) {
      setFormData({
        name: lawyerToEdit.name || '',
        oab: lawyerToEdit.oab || '',
        specialty: lawyerToEdit.specialty || '',
        roleTitle: lawyerToEdit.roleTitle || 'Advogado Associado',
        bio: lawyerToEdit.bio || '',
        email: lawyerToEdit.email || '',
        phone: lawyerToEdit.phone || '',
        avatarUrl: lawyerToEdit.avatarUrl || PRESET_AVATARS[0].url,
        highlighted: lawyerToEdit.highlighted || false,
      });
    } else {
      setFormData({
        name: '',
        oab: 'OAB/SP 000.000',
        specialty: 'Direito do Trabalho & Defesa do Trabalhador',
        roleTitle: 'Advogado(a) Trabalhista',
        bio: 'Especialista em Direito do Trabalho, com foco na defesa dos direitos trabalhistas, rescisões e cálculos.',
        email: 'advogado@almeidaetorres.adv.br',
        phone: '(11) 99999-0000',
        avatarUrl: PRESET_AVATARS[0].url,
        highlighted: false,
      });
    }
  }, [lawyerToEdit, isCreatingNew, isOpen]);

  if (!isOpen) return null;

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Por favor, informe o nome do advogado.');
      return;
    }

    if (isCreatingNew) {
      addLawyer({
        name: formData.name || 'Advogado Trabalhista',
        oab: formData.oab || 'OAB/SP 000.000',
        specialty: formData.specialty || 'Direito do Trabalho',
        roleTitle: formData.roleTitle || 'Advogado Associado',
        bio: formData.bio || '',
        email: formData.email || '',
        phone: formData.phone || '',
        avatarUrl: formData.avatarUrl || PRESET_AVATARS[0].url,
        highlighted: formData.highlighted || false,
      });
    } else if (lawyerToEdit) {
      updateLawyer(lawyerToEdit.id, formData);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1100);
  };

  const handleExecuteDelete = () => {
    if (!lawyerToEdit) return;
    setIsDeleting(true);
    deleteLawyer(lawyerToEdit.id);
    setTimeout(() => {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
      onClose();
    }, 300);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-[#c5a059] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative z-[100001]">
        
        {/* Modal Header */}
        <div className="bg-[#0b192c] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#f6e088]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-base sm:text-lg text-white">
                  {isCreatingNew ? 'Adicionar Novo Advogado à Equipe' : `Editar Informações de ${formData.name || 'Advogado'}`}
                </h3>
                <span className="text-[10px] bg-[#c5a059] text-[#07111e] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Altere nome, OAB, especialidade, biografia, cargo, foto e contatos diretos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="bg-green-600 text-white px-6 py-3 text-xs font-bold flex items-center gap-2 flex-shrink-0 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Advogado salvo com sucesso! Informações atualizadas em todo o site.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Avatar Preview & URL */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group flex-shrink-0">
              <img
                src={formData.avatarUrl}
                alt={formData.name || 'Advogado'}
                className="w-24 h-24 rounded-xl object-cover border-2 border-[#c5a059] shadow-md bg-slate-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', PRESET_AVATARS[0].url);
                }}
              />
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Foto de Perfil do Advogado
                </label>
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className="text-xs text-[#b38e42] hover:text-[#0b192c] font-bold flex items-center gap-1 underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showAvatarPresets ? 'Ocultar fotos sugeridas' : 'Escolher foto sugerida'}</span>
                </button>
              </div>

              <input
                type="url"
                value={formData.avatarUrl || ''}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono"
              />

              {showAvatarPresets && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Clique em uma foto para selecionar:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: avatar.url })}
                        className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${
                          formData.avatarUrl === avatar.url
                            ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40 scale-105'
                            : 'border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                        title={avatar.label}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome Completo do Advogado *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Dr. Roberto de Almeida"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-[#0b192c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registro OAB *
              </label>
              <input
                type="text"
                required
                value={formData.oab || ''}
                onChange={(e) => setFormData({ ...formData, oab: e.target.value })}
                placeholder="Ex: OAB/SP 184.920"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cargo / Título no Escritório
              </label>
              <input
                type="text"
                value={formData.roleTitle || ''}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                placeholder="Ex: Sócio Fundador / Advogado Associado Sênior"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Especialidade Principal *
              </label>
              <input
                type="text"
                required
                value={formData.specialty || ''}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ex: Reclamatórias Complexas & Verbas"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                E-mail do Advogado
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="roberto.almeida@almeidaetorres.adv.br"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Telefone / Ramal / WhatsApp
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-1001"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Biografia, Formação Acadêmica &amp; Atuação Profissional
            </label>
            <textarea
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Descreva a formação (USP, PUC...), pós-graduação, anos de experiência e principais casos conduzidos..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs leading-relaxed"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Este texto é exibido no card da equipe e no modal de perfil detalhado do advogado.
            </span>
          </div>

          {/* Highlights checkbox */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#b38e42]" />
              <div>
                <span className="text-xs font-bold text-[#0b192c] block">
                  Destaque Principal no Site
                </span>
                <span className="text-[11px] text-slate-600">
                  Exibe o advogado com prioridade visual nas seções de destaque.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.highlighted || false}
                onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b192c]"></div>
            </label>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            {!isCreatingNew && lawyerToEdit ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-2 rounded-xl animate-fade-in">
                  <span className="text-xs text-red-900 font-bold">
                    Confirmar exclusão de {lawyerToEdit.name}?
                  </span>
                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="text-slate-600 hover:bg-slate-200 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Advogado</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-[#0b192c] hover:bg-[#162a45] text-white text-xs font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
              >
                <Save className="w-4 h-4 text-[#c5a059]" />
                <span>{isCreatingNew ? 'Cadastrar Advogado' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};
