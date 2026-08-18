import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PrivacyModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms';
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, type, onClose }) => {
  const { officeSettings } = useApp();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative max-h-[85vh] overflow-y-auto z-[100001]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-lg bg-[#0b192c] text-[#c5a059] flex items-center justify-center">
            {type === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider">Conformidade Legal &amp; OAB</span>
            <h3 className="font-serif-title text-xl font-bold text-[#0b192c]">
              {type === 'privacy' ? 'Política de Privacidade & Proteção de Dados (LGPD)' : 'Termos de Uso do Portal Institucional'}
            </h3>
          </div>
        </div>

        {type === 'privacy' ? (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              A <strong>{officeSettings.officeName}</strong> tem o compromisso inegociável de zelar pela privacidade, sigilo e proteção dos dados pessoais de seus clientes, em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong> e o <strong>Estatuto da Advocacia e da OAB (Lei nº 8.906/1994)</strong>.
            </p>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">1. Coleta e Finalidade dos Dados</h4>
            <p>
              Os dados coletados através dos formulários institucionais (nome, e-mail, telefone, relatos fáticos e documentos comprobatórios) são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prestação de consultoria e orientação jurídica preliminar;</li>
              <li>Elaboração de peças processuais, petições e cálculos trabalhistas;</li>
              <li>Acesso seguro e autenticado ao Portal do Cliente para acompanhamento de processos;</li>
              <li>Comunicação oficial e envio de atualizações via WhatsApp ou e-mail.</li>
            </ul>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">2. Sigilo Profissional e Segurança</h4>
            <p>
              Todas as comunicações e documentos compartilhados com nossos advogados estão resguardados pelo <em>Sigilo Profissional</em> (art. 7º, inciso II da Lei 8.906/94). Não comercializamos, compartilhamos ou transferimos dados para terceiros alheios aos procedimentos jurídicos.
            </p>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">3. Direitos do Titular</h4>
            <p>
              O cliente pode a qualquer momento solicitar a confirmação, correção, atualização ou anonimização de seus dados cadastrais entrando em contato através do nosso canal oficial: <strong>{officeSettings.email}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              Bem-vindo ao portal da <strong>{officeSettings.officeName}</strong>. O uso desta plataforma digital está sujeito às seguintes condições:
            </p>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">1. Natureza das Informações</h4>
            <p>
              As informações disponibilizadas neste site possuem caráter estritamente institucional e educativo, não substituindo o parecer formal emitido por um advogado devidamente constituído mediante procuração judicial.
            </p>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">2. Acesso à Área do Cliente</h4>
            <p>
              O acesso com CPF e senha é pessoal e intransferível. O cliente é responsável pela guarda de suas credenciais de segurança e deve comunicar imediatamente o escritório em caso de suspeita de extravio.
            </p>

            <h4 className="font-bold text-[#0b192c] text-sm pt-2">3. Provimento nº 205/2021 da OAB</h4>
            <p>
              Este ambiente digital opera em estrita conformidade com as regras de publicidade e comunicação da Ordem dos Advogados do Brasil, primando pela sobriedade, transparência e veracidade das informações veiculadas.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0b192c] text-white font-bold text-xs uppercase px-6 py-2.5 rounded-lg"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
