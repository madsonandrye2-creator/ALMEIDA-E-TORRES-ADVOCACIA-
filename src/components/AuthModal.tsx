import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogIn, 
  Shield, 
  User as UserIcon, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialRole, 
    login, 
    clients,
    officeSettings 
  } = useApp();

  const [roleTab, setRoleTab] = useState<'client' | 'admin'>('client');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setRoleTab(authModalInitialRole || 'client');
      setErrorMsg('');
      setShowForgotNotice(false);
      
      // Auto pre-fill based on tab if blank
      if (authModalInitialRole === 'admin') {
        setIdentifier('admin@almeidaetorres.adv.br');
        setPassword('admin123');
      } else {
        setIdentifier('123.456.789-00');
        setPassword('cliente123');
      }
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Credenciais inválidas.');
      }
    }, 300);
  };

  const handleFillDemo = (type: 'admin' | 'client1' | 'client2') => {
    setErrorMsg('');
    setShowForgotNotice(false);
    if (type === 'admin') {
      setRoleTab('admin');
      setIdentifier('admin@almeidaetorres.adv.br');
      setPassword('admin123');
    } else if (type === 'client1') {
      setRoleTab('client');
      setIdentifier('123.456.789-00');
      setPassword('cliente123');
    } else if (type === 'client2') {
      setRoleTab('client');
      setIdentifier('mariana.santos@email.com');
      setPassword('cliente123');
    }
  };

  const handleForgotPasswordWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Sou cliente da ${officeSettings.officeName} e preciso recuperar meu acesso ao Portal do Cliente.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative overflow-hidden z-[100001]">
        
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0b192c] text-[#c5a059] border border-[#c5a059]/50 flex items-center justify-center mx-auto mb-3 shadow-md">
            {roleTab === 'admin' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
          </div>
          <h3 className="font-serif-title text-2xl font-bold text-[#0b192c]">
            {roleTab === 'admin' ? 'Acesso Administrativo' : 'Portal do Cliente'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {roleTab === 'admin' 
              ? 'Painel exclusivo para advogados e equipe do escritório'
              : 'Acompanhe seu processo trabalhista e orientações'
            }
          </p>
        </div>

        {/* User Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRoleTab('client');
              setIdentifier('123.456.789-00');
              setPassword('cliente123');
              setErrorMsg('');
            }}
            className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'client'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Área do Cliente</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setRoleTab('admin');
              setIdentifier('admin@almeidaetorres.adv.br');
              setPassword('admin123');
              setErrorMsg('');
            }}
            className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'admin'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Administração</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {roleTab === 'admin' ? 'E-mail do Administrador' : 'CPF ou E-mail Cadastrado'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={roleTab === 'admin' ? 'admin@almeidaetorres.adv.br' : '000.000.000-00 ou seu e-mail'}
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-[11px] text-[#b38e42] hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password recovery tip box */}
          {showForgotNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              <p className="font-semibold mb-1">Recuperação de Acesso:</p>
              <p className="mb-2">Por motivos de segurança jurídica, a redefinição de senha é validada pelo WhatsApp oficial do escritório ou pela recepção.</p>
              <button
                type="button"
                onClick={handleForgotPasswordWhatsApp}
                className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider"
              >
                Solicitar Nova Senha no WhatsApp
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-[#c5a059]" />
            <span>{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
          </button>
        </form>

        {/* Demo Fast Access Helper */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1 text-[#b38e42]">
              <Sparkles className="w-3.5 h-3.5" />
              Contas de Teste / Demonstração:
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillDemo('client1')}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded p-2 text-left text-slate-700 transition-colors"
            >
              <p className="font-bold text-[#0b192c]">Cliente (Carlos)</p>
              <p className="text-[10px] text-slate-500">CPF: 123.456.789-00</p>
              <p className="text-[10px] text-slate-500">Senha: cliente123</p>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded p-2 text-left text-amber-900 transition-colors"
            >
              <p className="font-bold text-[#0b192c]">Administrador</p>
              <p className="text-[10px] text-amber-800 truncate">admin@almeidaetorres...</p>
              <p className="text-[10px] text-amber-800">Senha: admin123</p>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
