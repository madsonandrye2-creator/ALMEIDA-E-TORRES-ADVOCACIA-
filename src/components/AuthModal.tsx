import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogIn, 
  Shield, 
  User as UserIcon, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  UserPlus,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialRole, 
    login, 
    loginWithGoogle,
    registerWithEmail,
    officeSettings 
  } = useApp();

  // Mode: 'signin' | 'signup' | 'admin'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'admin'>('signin');

  // Sign in state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpCpf, setSignUpCpf] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalInitialRole === 'admin') {
        setAuthMode('admin');
        setSignInIdentifier('admin@almeidaetorres.adv.br');
        setSignInPassword('admin123');
      } else {
        setAuthMode('signin');
        setSignInIdentifier('123.456.789-00');
        setSignInPassword('cliente123');
      }
      setErrorMsg('');
      setSuccessMsg('');
      setShowForgotNotice(false);
    }
  }, [isAuthModalOpen, authModalInitialRole]);

  if (!isAuthModalOpen) return null;

  // Format CPF helper (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (raw.length > 6) {
      formatted = raw.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (raw.length > 3) {
      formatted = raw.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setSignUpCpf(formatted);
  };

  // Google Login / Sign Up
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.message || 'Falha ao autenticar com o Google.');
      }
    } catch (err: any) {
      setErrorMsg('Erro inesperado ao conectar com o Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Sign In submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(signInIdentifier, signInPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMsg('Ocorreu um erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signUpPassword.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithEmail({
        name: signUpName,
        email: signUpEmail,
        passwordPlain: signUpPassword,
        cpf: signUpCpf,
        phone: signUpPhone,
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Erro ao cadastrar conta.');
      } else {
        setSuccessMsg('Conta criada com sucesso! Redirecionando...');
      }
    } catch (err: any) {
      setErrorMsg('Ocorreu um erro ao criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'client1' | 'client2') => {
    setErrorMsg('');
    setShowForgotNotice(false);
    if (type === 'admin') {
      setAuthMode('admin');
      setSignInIdentifier('admin@almeidaetorres.adv.br');
      setSignInPassword('admin123');
    } else if (type === 'client1') {
      setAuthMode('signin');
      setSignInIdentifier('123.456.789-00');
      setSignInPassword('cliente123');
    } else if (type === 'client2') {
      setAuthMode('signin');
      setSignInIdentifier('mariana.santos@email.com');
      setSignInPassword('cliente123');
    }
  };

  const handleForgotPasswordWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Sou cliente da ${officeSettings.officeName} e preciso recuperar meu acesso ao Portal do Cliente.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative overflow-hidden my-8 z-[100001]">
        
        {/* Radiant top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b38e42] via-[#f6e088] to-[#b38e42]" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center mb-6 pt-1">
          <div className="w-12 h-12 rounded-xl bg-[#0b192c] text-[#c5a059] border border-[#c5a059]/50 flex items-center justify-center mx-auto mb-3 shadow-md">
            {authMode === 'admin' ? (
              <Shield className="w-6 h-6" />
            ) : authMode === 'signup' ? (
              <UserPlus className="w-6 h-6" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-serif-title text-2xl font-bold text-[#0b192c]">
            {authMode === 'admin' 
              ? 'Acesso da Equipe Jurídica' 
              : authMode === 'signup' 
                ? 'Criar Conta de Cliente' 
                : 'Portal do Cliente'
            }
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === 'admin' 
              ? 'Ambiente restrito exclusivo para os advogados do escritório'
              : authMode === 'signup'
                ? 'Cadastre-se com Google ou E-mail para acompanhar seu processo'
                : 'Acesse seu painel seguro para acompanhar seus direitos e processos'
            }
          </p>
        </div>

        {/* Main Mode Tabs: Entrar vs Criar Conta */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signin'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Entrar</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-[#0b192c] text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. GOOGLE ONE-CLICK BUTTON (Available for Client Signin & Signup) */}
        {authMode !== 'admin' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleAuth}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 hover:border-slate-400 py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {googleLoading ? (
                <span className="text-slate-500">Conectando com o Google...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {authMode === 'signup' 
                      ? 'Criar Conta com o Google' 
                      : 'Entrar com o Google'
                    }
                  </span>
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold text-[10px]">
                  ou com seus dados
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CPF ou E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="000.000.000-00 ou seu e-mail"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sua Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] text-[#b38e42] hover:underline font-medium"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {showForgotNotice && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <p className="font-semibold mb-1">Recuperação de Senha:</p>
                <p className="mb-2">Por segurança, a redefinição é validada diretamente com nossa equipe jurídica via WhatsApp.</p>
                <button
                  type="button"
                  onClick={handleForgotPasswordWhatsApp}
                  className="bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider"
                >
                  Falar no WhatsApp do Escritório
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#c5a059]" />
              <span>{loading ? 'Entrando...' : 'Entrar no Portal do Cliente'}</span>
            </button>
          </form>
        )}

        {/* 3. SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CPF <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signUpCpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-9"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-9"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Criar Senha *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none transition-all pl-9"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
              <span>Sua conta de cliente garante sigilo profissional absoluto e acesso instantâneo ao andamento dos seus processos.</span>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#c5a059]" />
              <span>{loading ? 'Criando Conta...' : 'Finalizar Cadastro de Cliente'}</span>
            </button>
          </form>
        )}

        {/* 4. ADMIN LOGIN FORM */}
        {authMode === 'admin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <Shield className="w-5 h-5 text-[#b38e42] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acesso Restrito à Equipe</p>
                <p className="text-[11px] text-amber-900">
                  Usuários e clientes cadastrados não têm acesso a este painel administrativo. Apenas advogados credenciados.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail do Administrador
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="admin@almeidaetorres.adv.br"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Senha Administrativa
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0b192c] via-[#162a45] to-[#0b192c] hover:brightness-110 text-[#f6e088] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl border border-[#c5a059]/40 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#f6e088]" />
              <span>{loading ? 'Validando Acesso...' : 'Acessar Painel da Equipe'}</span>
            </button>
          </form>
        )}

        {/* Bottom Switcher: Admin link or Return to client */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          {authMode === 'admin' ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setSignInIdentifier('');
                setSignInPassword('');
                setErrorMsg('');
              }}
              className="text-[#b38e42] hover:text-[#0b192c] font-semibold flex items-center gap-1 cursor-pointer"
            >
              &larr; Voltar para o Portal do Cliente
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setSignInIdentifier('admin@almeidaetorres.adv.br');
                setSignInPassword('admin123');
                setErrorMsg('');
              }}
              className="text-slate-400 hover:text-amber-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3 text-[#c5a059]" />
              <span>Acesso Restrito da Equipe / Admin</span>
            </button>
          )}

          {/* Quick Demo Pre-fill */}
          <div className="flex items-center gap-1.5 ml-auto text-[11px]">
            <span className="text-slate-400">Teste rápido:</span>
            <button
              type="button"
              onClick={() => handleFillDemo('client1')}
              className="text-[#0b192c] font-bold hover:underline"
            >
              Cliente
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="text-amber-700 font-bold hover:underline"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
