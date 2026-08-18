import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { officeSettings } = useApp();

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Gostaria de falar com a equipe da ${officeSettings.officeName}.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleOpenWhatsApp}
        className="group relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgb(37,211,102,0.4)] transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer"
        aria-label="Falar no WhatsApp"
        title="Falar no WhatsApp"
        id="btn-floating-whatsapp"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </button>
    </div>
  );
};
