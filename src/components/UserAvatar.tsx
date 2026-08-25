import React, { useState, useEffect } from 'react';
import { User as UserIcon, Camera, Upload, X } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'gold' | 'navy' | 'emerald' | 'crimson' | 'dynamic';
  className?: string;
  showBorder?: boolean;
  borderWidth?: 'thin' | 'medium' | 'thick';
  editable?: boolean;
  onEditClick?: () => void;
  ringGlow?: boolean;
}

// Clean title/honorific prefixes from name before computing initial
export const getCleanInitial = (name?: string): string => {
  if (!name || !name.trim()) return 'A';
  const clean = name
    .trim()
    .replace(/^(dr\.|dra\.|sr\.|sra\.|adv\.|advogado|advogada|prof\.|mestre)\s+/i, '')
    .trim();
  const firstChar = clean.charAt(0);
  return firstChar ? firstChar.toUpperCase() : 'A';
};

// Get two-letter monogram if available
export const getCleanInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'A';
  const clean = name
    .trim()
    .replace(/^(dr\.|dra\.|sr\.|sra\.|adv\.|advogado|advogada|prof\.|mestre)\s+/i, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Deterministic gradient selection based on name
const getDynamicGradient = (name?: string) => {
  const gradients = [
    'from-[#0b192c] via-[#162a45] to-[#07111e]', // Luxury Navy Gold
    'from-[#1a1423] via-[#2d1b4e] to-[#0d0a14]', // Royal Amethyst
    'from-[#0c231e] via-[#143d34] to-[#061512]', // Emerald Justice
    'from-[#241315] via-[#421b20] to-[#150a0b]', // Deep Burgundy
    'from-[#1a1c23] via-[#2d3139] to-[#0f1115]', // Platinum Slate
  ];
  if (!name) return gradients[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Usuário',
  src,
  alt,
  size = 'md',
  variant = 'gold',
  className = '',
  showBorder = true,
  borderWidth = 'medium',
  editable = false,
  onEditClick,
  ringGlow = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Reset image failure state when src changes
  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initial = getCleanInitial(name);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl sm:text-2xl',
    '2xl': 'w-20 h-20 text-3xl',
    '3xl': 'w-24 h-24 text-4xl',
  };

  const borderClasses = {
    thin: 'border border-[#c5a059]/60',
    medium: 'border-2 border-[#c5a059]',
    thick: 'border-[3px] border-[#c5a059]',
  };

  const glowClass = ringGlow 
    ? 'shadow-[0_0_20px_rgba(197,160,89,0.45)]' 
    : 'shadow-md';

  const hasValidPhoto = Boolean(src && src.trim().length > 5 && !imageFailed);

  const getBackgroundGradient = () => {
    if (variant === 'dynamic') return getDynamicGradient(name);
    if (variant === 'emerald') return 'from-[#062c1d] via-[#0e4b33] to-[#07111e]';
    if (variant === 'crimson') return 'from-[#3b0d11] via-[#5c161c] to-[#07111e]';
    if (variant === 'navy') return 'from-[#07111e] via-[#0b192c] to-[#162a45]';
    // Gold luxury default
    return 'from-[#07111e] via-[#0b192c] to-[#1a2f4c]';
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 group ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-full overflow-hidden select-none transition-all duration-300 ${
          sizeClasses[size]
        } ${showBorder ? borderClasses[borderWidth] : ''} ${glowClass} ${
          !hasValidPhoto
            ? `bg-gradient-to-br ${getBackgroundGradient()} text-[#f6e088]`
            : 'bg-slate-800'
        }`}
      >
        {hasValidPhoto ? (
          <img
            src={src!}
            alt="" // Deliberately blank alt so browser NEVER renders ugly broken text inside circular frames
            aria-label={alt || name}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Handcrafted Luxury Monogram Initial */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Subtle radial inner sheen */}
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none rounded-full" />
            
            {/* Elegant Serif Initial with Golden Gradient & Shadow */}
            <span
              className="font-serif-title font-black text-[#f6e088] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight transform group-hover:scale-110 transition-transform select-none"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.7), 0 0 10px rgba(197,160,89,0.3)',
              }}
            >
              {initial}
            </span>

            {/* Micro Gold Accent Dot for extra refinement on larger sizes */}
            {(size === 'xl' || size === '2xl' || size === '3xl') && (
              <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-[#f6e088] opacity-60 shadow-[0_0_4px_#f6e088]" />
            )}
          </div>
        )}
      </div>

      {/* Editable Overlay / Button if enabled */}
      {editable && (
        <button
          type="button"
          onClick={onEditClick}
          className="absolute -bottom-1 -right-1 bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] p-1.5 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110 cursor-pointer"
          title="Alterar foto de perfil"
          aria-label="Alterar foto de perfil"
        >
          <Camera className="w-3 h-3 font-bold" />
        </button>
      )}
    </div>
  );
};
