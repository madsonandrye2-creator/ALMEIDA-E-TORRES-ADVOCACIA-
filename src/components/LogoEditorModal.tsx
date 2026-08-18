import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Palette
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfficeSettings } from '../types';
import { LogoEditorSection } from './LogoEditorSection';

interface LogoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoEditorModal: React.FC<LogoEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { officeSettings, updateOfficeSettings } = useApp();
  const [formData, setFormData] = useState<OfficeSettings>(officeSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(officeSettings);
      setSavedSuccess(false);
    }
  }, [isOpen, officeSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full border-2 border-[#c5a059] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative z-[100000]">
        
        {/* Header */}
        <div className="bg-[#0b192c] text-white px-6 py-4 flex items-center justify-between border-b border-[#c5a059]/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center text-[#f6e088]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-base text-white">
                  Trocar Logomarca da Empresa
                </h3>
                <span className="text-[10px] bg-[#c5a059] text-[#07111e] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Envie a imagem do seu escritório ou monte uma logomarca vetorial exclusiva
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <LogoEditorSection
            formData={formData}
            setFormData={setFormData}
            onSaveDirectly={(updated) => {
              const merged = { ...formData, ...updated };
              setFormData(merged);
              updateOfficeSettings(merged);
            }}
            isStandalone={true}
          />

          {/* Footer controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
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
                  <span>Logomarca Salva com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#c5a059]" />
                  <span>Salvar Nova Logomarca no Site</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
