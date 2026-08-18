import React, { useState } from 'react';
import { 
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
  AlertCircle
} from 'lucide-react';
import { OfficeSettings } from '../types';

export const LOGO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale,
  Landmark,
  Gavel,
  Shield,
  Building2,
  Award,
  Briefcase,
  FileText,
  Crown,
  BookOpen,
  Compass,
};

export const LOGO_PRESETS = [
  {
    id: 'preset-classic-gold',
    name: 'Balança Dourada Clássica',
    description: 'Estilo sóbrio com balança da justiça e acabamento dourado',
    logoType: 'icon' as const,
    logoIcon: 'Scale',
    logoText: 'ALMEIDA & TORRES',
    logoSubtext: 'Advocacia Trabalhista',
    logoShape: 'rounded' as const,
    logoColorTheme: 'gold' as const,
  },
  {
    id: 'preset-temple-law',
    name: 'Templo & Tribunal Jurídico',
    description: 'Emblema com colunas greco-romanas da justiça',
    logoType: 'icon' as const,
    logoIcon: 'Landmark',
    logoText: 'ALMEIDA & TORRES',
    logoSubtext: 'Sociedade de Advogados',
    logoShape: 'square' as const,
    logoColorTheme: 'gold' as const,
  },
  {
    id: 'preset-gavel-justice',
    name: 'Malhete & Tribunal',
    description: 'Símbolo clássico do martelo judicial de decisão',
    logoType: 'icon' as const,
    logoIcon: 'Gavel',
    logoText: 'ALMEIDA & TORRES',
    logoSubtext: 'Direito do Trabalho & Processual',
    logoShape: 'circle' as const,
    logoColorTheme: 'gold' as const,
  },
  {
    id: 'preset-shield-defense',
    name: 'Escudo Protetor dos Direitos',
    description: 'Representação de segurança, tutela e proteção ao trabalhador',
    logoType: 'icon' as const,
    logoIcon: 'Shield',
    logoText: 'ALMEIDA & TORRES',
    logoSubtext: 'Defesa & Consultoria Jurídica',
    logoShape: 'rounded' as const,
    logoColorTheme: 'gold' as const,
  },
  {
    id: 'preset-monogram-sample',
    name: 'Brasão Imperial Dourado',
    description: 'Estilo brasão nobre com insígnia coroada de alta distinção',
    logoType: 'icon' as const,
    logoIcon: 'Crown',
    logoText: 'ALMEIDA & TORRES',
    logoSubtext: 'Excelência em Prática Trabalhista',
    logoShape: 'circle' as const,
    logoColorTheme: 'gold' as const,
  },
];

interface BrandLogoProps {
  settings?: Partial<OfficeSettings> | null;
  variant?: 'header' | 'footer' | 'admin' | 'auth' | 'preview' | 'compact' | 'light';
  className?: string;
  onClick?: () => void;
  showSubtext?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  settings,
  variant = 'header',
  className = '',
  onClick,
  showSubtext = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const cfg: Partial<OfficeSettings> = settings || {};

  const logoType = cfg.logoType || (cfg.logoUrl ? 'image' : 'icon');
  const logoUrl = cfg.logoUrl;
  const iconName = cfg.logoIcon || 'Scale';
  const IconComponent = LOGO_ICONS[iconName] || Scale;
  const logoText = cfg.logoText || cfg.officeName || 'ALMEIDA & TORRES';
  const logoSubtext = cfg.logoSubtext || 'Advocacia Trabalhista';
  const shape = cfg.logoShape || 'rounded';
  const colorTheme = cfg.logoColorTheme || 'gold';

  // Format main title with stylized ampersand if present
  const renderFormattedText = (text: string, isLightBg: boolean) => {
    if (text.includes('&')) {
      const parts = text.split('&');
      return (
        <>
          {parts[0].trim()}{' '}
          <span className="text-[#c5a059] font-normal">&amp;</span>{' '}
          {parts.slice(1).join('&').trim()}
        </>
      );
    }
    if (text.toLowerCase().includes(' e ')) {
      const parts = text.split(/\s+e\s+/i);
      return (
        <>
          {parts[0].trim()}{' '}
          <span className="text-[#c5a059] font-normal">&amp;</span>{' '}
          {parts.slice(1).join(' e ').trim()}
        </>
      );
    }
    return text;
  };

  // Shape class generator
  const getShapeClass = () => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'minimal':
        return 'rounded-md bg-transparent border-0 shadow-none';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  // Color theme classes for emblem container
  const getEmblemThemeClass = (isLightBg: boolean) => {
    if (shape === 'minimal') {
      return 'text-[#c5a059]';
    }
    switch (colorTheme) {
      case 'silver':
        return 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-400/50 text-slate-200 shadow-md';
      case 'blue':
        return 'bg-gradient-to-br from-[#0b192c] to-[#1e3a8a] border border-blue-400/50 text-blue-300 shadow-md';
      case 'emerald':
        return 'bg-gradient-to-br from-[#062c1d] to-[#0b192c] border border-emerald-500/50 text-emerald-300 shadow-md';
      case 'crimson':
        return 'bg-gradient-to-br from-[#3b0d11] to-[#0b192c] border border-red-500/50 text-red-300 shadow-md';
      case 'gold':
      default:
        return 'bg-gradient-to-br from-[#0b192c] via-[#112338] to-[#162a45] border border-[#c5a059]/70 text-[#f6e088] shadow-md';
    }
  };

  const isLightMode = variant === 'light' || variant === 'preview';
  const logoScale = cfg.logoSize || 'large';
  const backdrop = cfg.logoBackdrop || 'gold-halo';
  const hasGlow = cfg.logoGlow !== false;
  const displayMode = cfg.logoDisplayMode || 'auto'; // 'image-only' | 'image-with-text' | 'text-only' | 'auto'
  const imageZoom = cfg.logoImageZoom || 'large'; // 'medium' | 'large' | 'huge' | 'gigantic'

  // Determine whether to show text alongside image
  // If displayMode is 'image-only', text is hidden so the logo image can be the solitary, grand hero logo.
  // If displayMode is 'auto', if there is a custom image, default to showing the image with high prominence.
  const shouldShowCompanionText = 
    displayMode === 'image-with-text' || 
    (displayMode === 'auto' && showSubtext && variant !== 'compact');

  // Sizing by scale & variant - Extra visible, high-definition and prominent
  const getImageDimensions = () => {
    if (variant === 'compact') return 'h-10 sm:h-12 max-w-[160px]';
    if (variant === 'footer') {
      return displayMode === 'image-only' 
        ? 'h-20 sm:h-24 md:h-28 max-w-[400px]' 
        : 'h-16 sm:h-20 max-w-[300px]';
    }
    if (variant === 'admin') return 'h-12 sm:h-14 max-w-[220px]';
    if (variant === 'auth' || variant === 'preview') {
      return 'h-20 sm:h-24 md:h-28 max-w-[380px]';
    }

    // Header sizing based on imageZoom & displayMode
    if (displayMode === 'image-only') {
      switch (imageZoom) {
        case 'medium':
          return 'h-14 sm:h-16 max-w-[260px]';
        case 'huge':
          return 'h-20 sm:h-24 md:h-28 max-w-[450px]';
        case 'gigantic':
          return 'h-24 sm:h-28 md:h-32 max-w-[550px]';
        case 'large':
        default:
          return 'h-16 sm:h-20 md:h-22 max-w-[360px]';
      }
    }

    // When companion text is shown beside the image:
    switch (imageZoom) {
      case 'medium':
        return 'h-12 sm:h-14 max-w-[180px]';
      case 'huge':
        return 'h-18 sm:h-22 max-w-[280px]';
      case 'gigantic':
        return 'h-22 sm:h-26 max-w-[340px]';
      case 'large':
      default:
        return 'h-14 sm:h-18 max-w-[240px]';
    }
  };

  const getBackdropClass = () => {
    switch (backdrop) {
      case 'white-card':
        return 'bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#c5a059] shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_20px_rgba(197,160,89,0.4)] group-hover:shadow-[0_0_40px_rgba(197,160,89,0.7)] ring-2 ring-[#c5a059]/40';
      case 'glass-luxury':
        return 'bg-white/20 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border-2 border-white/40 shadow-xl group-hover:border-[#c5a059]';
      case 'transparent':
        return 'bg-transparent p-0 border-0 shadow-none';
      case 'gold-halo':
      default:
        return `bg-gradient-to-br from-[#07111e] via-[#0b192c] to-[#162a45] p-2.5 sm:p-3 rounded-2xl border-2 border-[#c5a059] ${
          hasGlow ? 'shadow-[0_0_35px_rgba(197,160,89,0.55)] group-hover:shadow-[0_0_50px_rgba(246,224,136,0.85)]' : 'shadow-xl'
        } group-hover:border-[#f6e088] ring-1 ring-[#c5a059]/50`;
    }
  };

  // Sizing for Vector Emblem
  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-5 h-5';
      case 'auth':
      case 'preview':
        return 'w-10 h-10';
      case 'footer':
        return 'w-7 h-7';
      case 'admin':
        return 'w-6 h-6';
      case 'header':
      default:
        return logoScale === 'xlarge' ? 'w-10 h-10' : logoScale === 'large' ? 'w-8 h-8' : 'w-7 h-7';
    }
  };

  const getEmblemContainerSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-9 h-9';
      case 'auth':
      case 'preview':
        return 'w-16 h-16 sm:w-20 sm:h-20';
      case 'footer':
        return 'w-14 h-14';
      case 'admin':
        return 'w-11 h-11';
      case 'header':
      default:
        return logoScale === 'xlarge'
          ? 'w-18 h-18 sm:w-20 sm:h-20'
          : logoScale === 'large'
          ? 'w-13 h-13 sm:w-16 sm:h-16'
          : 'w-12 h-12';
    }
  };

  const hasValidCustomImage = logoType === 'image' && logoUrl && !imageError;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3.5 sm:gap-4 select-none transition-all ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
      id="site-brand-logo"
    >
      {/* 1. Custom Image Mode */}
      {hasValidCustomImage ? (
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 ${getBackdropClass()}`}>
            <img
              src={logoUrl}
              alt={logoText}
              className={`w-auto object-contain transition-transform group-hover:scale-105 duration-300 filter brightness-105 contrast-105 ${getImageDimensions()}`}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Companion text alongside the image (only when not in image-only mode) */}
          {shouldShowCompanionText && (
            <div className="flex flex-col text-left">
              <span className={`font-serif-title font-black tracking-wider leading-tight ${
                variant === 'header' 
                  ? 'text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]' 
                  : 'text-lg sm:text-xl'
              } ${isLightMode ? 'text-[#0b192c]' : 'text-white'}`}>
                {renderFormattedText(logoText, isLightMode)}
              </span>
              {logoSubtext && (
                <span className={`text-[11px] sm:text-xs tracking-[0.25em] uppercase font-extrabold mt-0.5 ${
                  isLightMode ? 'text-slate-600' : 'text-[#f6e088] drop-shadow'
                }`}>
                  {logoSubtext}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 2. Vector Emblem + Typography Mode */
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div
            className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 ring-2 ring-[#c5a059]/60 group-hover:ring-[#f6e088] ${
              hasGlow ? 'shadow-[0_0_30px_rgba(197,160,89,0.4)] group-hover:shadow-[0_0_40px_rgba(197,160,89,0.65)]' : ''
            } ${getEmblemContainerSize()} ${getShapeClass()} ${getEmblemThemeClass(
              isLightMode
            )}`}
          >
            <IconComponent className={`${getIconSize()} transition-transform group-hover:rotate-3`} />
          </div>

          {variant !== 'compact' && (
            <div className="flex flex-col text-left">
              <span
                className={`font-serif-title font-black tracking-wider leading-tight flex items-center gap-1.5 ${
                  variant === 'header'
                    ? 'text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]'
                    : variant === 'footer'
                    ? 'text-2xl'
                    : variant === 'auth' || variant === 'preview'
                    ? 'text-2xl sm:text-3xl'
                    : 'text-lg sm:text-xl'
                } ${isLightMode ? 'text-[#0b192c]' : 'text-white'}`}
              >
                {renderFormattedText(logoText, isLightMode)}
              </span>

              {showSubtext && logoSubtext && (
                <span
                  className={`text-[11px] sm:text-xs tracking-[0.25em] uppercase font-extrabold mt-0.5 ${
                    isLightMode ? 'text-slate-600' : 'text-[#f6e088] drop-shadow'
                  }`}
                >
                  {logoSubtext}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
