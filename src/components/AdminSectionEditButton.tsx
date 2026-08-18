import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuickEditSiteModal } from './QuickEditSiteModal';

interface AdminSectionEditButtonProps {
  tab: 'contacts' | 'location' | 'texts' | 'stats' | 'lawyers' | 'general';
  label?: string;
  className?: string;
}

export const AdminSectionEditButton: React.FC<AdminSectionEditButtonProps> = ({
  tab,
  label = 'Editar Informações',
  className = ''
}) => {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#c5a059] shadow-md transition-all z-20 cursor-pointer ${className}`}
        title={`Alterar informações de ${label} (Admin)`}
      >
        <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
        <span>{label}</span>
      </button>

      <QuickEditSiteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialTab={tab}
      />
    </>
  );
};
