import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Trash2, 
  Link as LinkIcon, 
  Eye, 
  Palette, 
  Layers,
  Scale,
  Shield,
  Landmark,
  Gavel,
  Building2,
  Award,
  Briefcase,
  FileText,
  Crown,
  BookOpen,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { OfficeSettings } from '../types';
import { BrandLogo, LOGO_ICONS, LOGO_PRESETS } from './BrandLogo';

interface LogoEditorSectionProps {
  formData: OfficeSettings;
  setFormData: React.Dispatch<React.SetStateAction<OfficeSettings>> | ((newSettings: OfficeSettings) => void);
  onSaveDirectly?: (updated: Partial<OfficeSettings>) => void;
  isStandalone?: boolean;
}

export const LogoEditorSection: React.FC<LogoEditorSectionProps> = ({
  formData,
  setFormData,
  onSaveDirectly,
  isStandalone = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'vector' | 'presets'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (fields: Partial<OfficeSettings>) => {
    const updated = {
      ...formData,
      ...fields,
    };
    if (typeof setFormData === 'function') {
      setFormData(updated);
    }
    if (onSaveDirectly) {
      onSaveDirectly(fields);
    }
  };

  // File Upload Handler (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 3MB for base64 storage)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 3MB. Tente uma imagem mais leve ou otimizada.');
      return;
    }

    // Validate format
    if (!file.type.startsWith('image/')) {
      setUploadError('Formato de arquivo inválido. Selecione PNG, JPG, SVG ou WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleUpdate({
          logoType: 'image',
          logoUrl: result,
        });
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    };
    reader.onerror = () => {
      setUploadError('Erro ao ler a imagem. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadError('');
    handleUpdate({
      logoType: 'image',
      logoUrl: imageUrlInput.trim(),
    });
    setUploadSuccess(true);
    setImageUrlInput('');
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleRemoveCustomImage = () => {
    handleUpdate({
      logoType: 'icon',
      logoUrl: '',
    });
    setUploadSuccess(false);
  };

  const handleResetToDefault = () => {
    handleUpdate({
      logoType: 'icon',
      logoIcon: 'Scale',
      logoText: 'ALMEIDA & TORRES',
      logoSubtext: 'Advocacia Trabalhista',
      logoShape: 'rounded',
      logoColorTheme: 'gold',
      logoUrl: '',
    });
  };

  const currentIcon = formData.logoIcon || 'Scale';
  const currentShape = formData.logoShape || 'rounded';
  const currentTheme = formData.logoColorTheme || 'gold';
  const hasCustomImage = formData.logoType === 'image' && Boolean(formData.logoUrl);

  return (
    <div className="space-y-6">
      
      {/* 1. Live Visual Preview Card */}
      <div className="bg-slate-900 rounded-2xl p-5 border-2 border-[#c5a059] shadow-xl text-white">
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Eye className="w-4 h-4 text-[#c5a059]" />
            <span>PRÉ-VISUALIZAÇÃO EM TEMPO REAL NO SITE</span>
          </div>
          <span className="text-[10px] bg-[#c5a059] text-[#07111e] px-2 py-0.5 rounded font-black tracking-wider uppercase">
            {hasCustomImage ? 'IMAGEM PERSONALIZADA' : 'EMBLEMA VETORIAL'}
          </span>
        </div>

        {/* Dual Previews (Dark Background / Header vs Light Background) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Preview A: Header Style (Dark) */}
          <div className="bg-[#07111e] p-4 rounded-xl border border-[#c5a059]/30 flex flex-col justify-center min-h-[90px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
              No Cabeçalho &amp; Rodapé (Fundo Escuro)
            </span>
            <div className="p-2 bg-white/5 rounded-lg">
              <BrandLogo settings={formData} variant="header" />
            </div>
          </div>

          {/* Preview B: Light Mode Style */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-900 flex flex-col justify-center min-h-[90px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0b192c]"></span>
              Em Documentos &amp; Relatórios (Fundo Claro)
            </span>
            <div className="p-2 bg-slate-50 rounded-lg">
              <BrandLogo settings={formData} variant="light" />
            </div>
          </div>

        </div>

        {/* Status notice */}
        {uploadSuccess && (
          <div className="mt-3 bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Logomarca aplicada com sucesso! Já está visível em todo o site.</span>
          </div>
        )}
      </div>

      {/* 2. Text Brand Customization & Logo Sizing & Backdrop */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="font-serif-title text-sm font-bold text-[#0b192c] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#c5a059]" />
            Destaque, Tamanho &amp; Apresentação da Logomarca
          </h4>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
            Visibilidade Máxima Ativa
          </span>
        </div>

        {/* Display Mode Switcher (Crucial for uploaded logos that already contain the name) */}
        {hasCustomImage && (
          <div className="bg-amber-50/80 border-2 border-[#c5a059]/60 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-black text-[#0b192c] uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>Modo de Apresentação da Imagem do Logo</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleUpdate({ logoDisplayMode: 'image-only' })}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  (formData.logoDisplayMode || 'auto') === 'image-only'
                    ? 'bg-[#0b192c] text-white border-[#c5a059] shadow-md ring-2 ring-[#c5a059]/40'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Apenas a Imagem Grande</span>
                  </span>
                  {(formData.logoDisplayMode || 'auto') === 'image-only' && (
                    <Check className="w-4 h-4 text-[#f6e088]" />
                  )}
                </div>
                <p className="text-[11px] opacity-80 leading-snug">
                  Ideal se sua imagem já contém o nome "Almeida & Torres". Oculta o texto duplicado e expande a imagem para tamanho máximo e nítido.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ logoDisplayMode: 'image-with-text' })}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  formData.logoDisplayMode === 'image-with-text' || formData.logoDisplayMode === 'auto'
                    ? 'bg-[#0b192c] text-white border-[#c5a059] shadow-md ring-2 ring-[#c5a059]/40'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>Imagem + Texto ao Lado</span>
                  </span>
                  {(formData.logoDisplayMode === 'image-with-text' || formData.logoDisplayMode === 'auto') && (
                    <Check className="w-4 h-4 text-[#f6e088]" />
                  )}
                </div>
                <p className="text-[11px] opacity-80 leading-snug">
                  Exibe a imagem como um selo/emblema ao lado do nome escrito em tipografia dourada.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Prominence & Backdrop Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Logo Size / Image Zoom */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Tamanho e Destaque da Imagem
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'medium', label: 'Médio (56px)' },
                { id: 'large', label: 'Grande (76px)' },
                { id: 'huge', label: 'Gigante (100px)' },
                { id: 'gigantic', label: 'Máximo (120px)' },
              ].map((sz) => {
                const isSelected = (formData.logoImageZoom || 'large') === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => handleUpdate({ logoImageZoom: sz.id as any, logoSize: sz.id === 'medium' ? 'normal' : sz.id === 'large' ? 'large' : 'xlarge' })}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b192c] text-[#f6e088] border-[#c5a059] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backdrop style for logo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Fundo de Contraste para a Imagem
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'white-card', label: '⬜ Fundo Branco Puro (Recomendado)' },
                { id: 'gold-halo', label: '✨ Moldura Dourada / Halo' },
                { id: 'glass-luxury', label: '💎 Vidro Cristalino' },
                { id: 'transparent', label: '🔘 Sem Fundo (Transparente)' },
              ].map((bd) => {
                const isSelected = (formData.logoBackdrop || 'gold-halo') === bd.id;
                return (
                  <button
                    key={bd.id}
                    type="button"
                    onClick={() => handleUpdate({ logoBackdrop: bd.id as any })}
                    className={`py-2 px-2 text-center rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b192c] text-[#f6e088] border-[#c5a059] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {bd.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Text inputs (only needed when text is displayed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome Principal na Logomarca
            </label>
            <input
              type="text"
              value={formData.logoText || ''}
              onChange={(e) => handleUpdate({ logoText: e.target.value })}
              placeholder="Ex: ALMEIDA & TORRES"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-[#0b192c]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Dica: O caractere <strong>&amp;</strong> ou <strong>e</strong> recebe destaque dourado automático.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Subtítulo / Especialidade da Marca
            </label>
            <input
              type="text"
              value={formData.logoSubtext || ''}
              onChange={(e) => handleUpdate({ logoSubtext: e.target.value })}
              placeholder="Ex: Advocacia Trabalhista"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Linha secundária elegante abaixo do nome principal.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mode Tabs (Upload Image vs Vector Emblem vs Presets) */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'upload'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>1. Enviar Imagem / Arquivo de Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('vector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'vector'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>2. Emblema Vetorial &amp; Ícones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('presets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'presets'
                ? 'bg-[#0b192c] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>3. Modelos Prontos (Presets)</span>
          </button>
        </div>

        {/* TAB A: UPLOAD DE ARQUIVO OU URL */}
        {activeSubTab === 'upload' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Drag & Drop / File Input Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#c5a059]/60 hover:border-[#c5a059] bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-[#0b192c] text-[#f6e088] flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h5 className="font-serif-title font-bold text-sm text-[#0b192c]">
                  Clique para selecionar a imagem do seu logo
                </h5>
                <p className="text-xs text-slate-600 mt-1">
                  Formatos recomendados: <strong>PNG transparente</strong>, <strong>SVG</strong>, <strong>JPG</strong> ou <strong>WebP</strong> (até 3MB)
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#0b192c] text-white text-xs font-bold px-4 py-2 rounded-lg shadow group-hover:bg-[#162a45] transition-colors">
                <ImageIcon className="w-4 h-4 text-[#c5a059]" />
                <span>Escolher Arquivo do Computador</span>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* URL Alternative */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Ou Cole o Link direto da Imagem do Logo (URL)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/minha-logo.png"
                  className="flex-1 bg-white border border-slate-300 rounded-lg p-2.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!imageUrlInput.trim()}
                  className="bg-[#0b192c] hover:bg-[#162a45] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Aplicar URL
                </button>
              </div>
            </div>

            {/* If has custom image, show remove button */}
            {hasCustomImage && (
              <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white p-1 border border-slate-300 flex items-center justify-center overflow-hidden">
                    <img src={formData.logoUrl} alt="Logo Atual" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Imagem Personalizada em Uso</span>
                    <span className="text-[11px] text-slate-500">Exibida no topo e no rodapé do site</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveCustomImage}
                  className="text-red-600 hover:bg-red-50 hover:text-red-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Imagem e Usar Ícone</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB B: ÍCONES E EMBLEMAS VETORIAIS */}
        {activeSubTab === 'vector' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* 1. Icon Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Escolha o Símbolo / Ícone Jurídico
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {Object.entries(LOGO_ICONS).map(([key, IconComp]) => {
                  const isSelected = currentIcon === key && formData.logoType !== 'image';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        handleUpdate({
                          logoType: 'icon',
                          logoIcon: key,
                        });
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b192c] text-[#f6e088] border-[#c5a059] ring-2 ring-[#c5a059]/40 shadow-md'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                      <span className="text-[11px] font-bold truncate max-w-full">
                        {key === 'Scale' ? 'Balança' :
                         key === 'Landmark' ? 'Tribunal' :
                         key === 'Gavel' ? 'Malhete' :
                         key === 'Shield' ? 'Escudo' :
                         key === 'Building2' ? 'Escritório' :
                         key === 'Award' ? 'Excelência' :
                         key === 'Briefcase' ? 'Pasta' :
                         key === 'FileText' ? 'Processo' :
                         key === 'Crown' ? 'Brasão' :
                         key === 'BookOpen' ? 'Código de Leis' :
                         key === 'Compass' ? 'Diretriz' : key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Shape Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Formato do Emblema
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'rounded', label: 'Arredondado' },
                    { id: 'circle', label: 'Circular' },
                    { id: 'square', label: 'Quadrado' },
                    { id: 'minimal', label: 'Minimalista' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleUpdate({ logoShape: s.id as any, logoType: 'icon' })}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        currentShape === s.id && formData.logoType !== 'image'
                          ? 'bg-[#0b192c] text-[#f6e088] border-[#c5a059]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Paleta de Cor do Emblema
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gold', label: 'Dourado Nobre' },
                    { id: 'silver', label: 'Prata / Platina' },
                    { id: 'blue', label: 'Azul Marinho' },
                    { id: 'emerald', label: 'Verde Esmeralda' },
                    { id: 'crimson', label: 'Rubi Real' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleUpdate({ logoColorTheme: t.id as any, logoType: 'icon' })}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        currentTheme === t.id && formData.logoType !== 'image'
                          ? 'bg-[#0b192c] text-[#f6e088] border-[#c5a059]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB C: PRESETS PRONTOS */}
        {activeSubTab === 'presets' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-slate-600">
              Selecione um estilo pronto com 1 clique para aplicar instantaneamente:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOGO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    handleUpdate({
                      logoType: preset.logoType,
                      logoIcon: preset.logoIcon,
                      logoText: preset.logoText,
                      logoSubtext: preset.logoSubtext,
                      logoShape: preset.logoShape,
                      logoColorTheme: preset.logoColorTheme,
                      logoUrl: '',
                    });
                  }}
                  className="bg-white hover:bg-amber-50/40 p-4 rounded-xl border border-slate-200 hover:border-[#c5a059] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <span className="font-serif-title font-bold text-xs text-[#0b192c] group-hover:text-amber-900 block">
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {preset.description}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-[#0b192c] text-[#f6e088] border border-[#c5a059] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {React.createElement(LOGO_ICONS[preset.logoIcon] || Scale, { className: 'w-5 h-5' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. Reset Button */}
      <div className="pt-3 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-xs text-slate-500 hover:text-[#0b192c] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Logomarca Padrão Original</span>
        </button>
      </div>

    </div>
  );
};
