import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogIn, 
  User as UserIcon, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  Mail, 
  Phone, 
  FileText, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    login, 
    loginWithGoogle,
    registerWithEmail,
    officeSettings 
  } = useApp();

  // Mode: 'signin' | 'signup' | 'google-direct'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'google-direct'>('signin');

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

  // Google Direct Fallback state
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [googlePhoneInput, setGooglePhoneInput] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthMode('signin');
      setSignInIdentifier('');
      setSignInPassword('');
      setGoogleEmailInput('');
      setGoogleNameInput('');
      setGooglePhoneInput('');
      setErrorMsg('');
      setSuccessMsg('');
      setShowForgotNotice(false);
    }
  }, [isAuthModalOpen]);

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
        if (res.requiresFallback) {
          setAuthMode('google-direct');
          setErrorMsg('A janela de pop-up do Google não abriu no seu navegador. Informe seu e-mail do Google abaixo para conectar instantaneamente:');
        } else {
          setErrorMsg(res.message || 'Falha ao autenticar com o Google.');
        }
      }
    } catch (err: any) {
      setAuthMode('google-direct');
      setErrorMsg('Informe seu e-mail Google para conectar diretamente:');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Google Direct Submit (Fallback if browser blocks popup)
  const handleGoogleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) {
      setErrorMsg('Por favor, informe seu e-mail do Google.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginWithGoogle({
        email: googleEmailInput.trim(),
        name: googleNameInput.trim() || undefined,
        phone: googlePhoneInput.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Não foi possível conectar com esta conta Google.');
      } else {
        setSuccessMsg('Conectado com sucesso à sua conta Google!');
      }
    } catch (err) {
      setErrorMsg('Erro ao conectar conta Google. Tente novamente.');
    } finally {
      setLoading(false);
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

  const handleForgotPasswordWhatsApp = () => {
    const msg = encodeURIComponent(`Olá! Sou cliente da ${officeSettings.officeName} e preciso de auxílio para acessar o Portal do Cliente.`);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${msg}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#c5a059]/40 relative overflow-hidden my-8 z-[100001]">
        
        {/* Top accent bar */}
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
            {authMode === 'signup' ? (
              <UserPlus className="w-6 h-6" />
            ) : authMode === 'google-direct' ? (
              <Sparkles className="w-6 h-6 text-[#f6e088]" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-serif-title text-2xl font-bold text-[#0b192c]">
            {authMode === 'signup' 
              ? 'Criar Conta de Cliente' 
              : authMode === 'google-direct'
              ? 'Conectar Conta Google'
              : 'Portal do Cliente'
            }
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === 'signup'
              ? 'Cadastre-se para acompanhar o andamento dos seus processos e direitos'
              : authMode === 'google-direct'
              ? 'Acesso simplificado e seguro com seu e-mail do Google'
              : 'Acesse seu painel seguro para acompanhar seus direitos e processos'
            }
          </p>
        </div>

        {/* Main Mode Tabs: Entrar vs Criar Conta */}
        {authMode !== 'google-direct' ? (
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
        ) : (
          <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-xl mb-5">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              Autenticação Google Direta
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
              }}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-bold underline px-2 py-1"
            >
              Voltar ao Login Normal
            </button>
          </div>
        )}

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

        {/* 1. GOOGLE ONE-CLICK BUTTON (Shown on Sign In & Sign Up) */}
        {authMode !== 'google-direct' && (
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

            <div className="flex items-center justify-between mt-2 px-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('google-direct');
                  setErrorMsg('');
                }}
                className="text-[11px] text-slate-500 hover:text-[#b38e42] transition-colors underline"
              >
                Pop-up do Google bloqueado? Clique para entrar pelo seu Gmail
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold text-[10px]">
                  ou com e-mail e senha
                </span>
              </div>
            </div>
          </div>
        )}

        {/* GOOGLE DIRECT FALLBACK FORM */}
        {authMode === 'google-direct' && (
          <form onSubmit={handleGoogleDirectSubmit} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
              <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                Acesso Seguro com Conta Google
              </p>
              <p className="text-slate-500 text-[11px]">
                Digite seu endereço de e-mail do Google para acessar ou criar instantaneamente sua área do cliente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seu E-mail do Google (Gmail) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Seu Nome Completo <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={googlePhoneInput}
                  onChange={(e) => setGooglePhoneInput(e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all pl-10"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-[#c5a059]" />
              <span>{loading ? 'Conectando...' : 'Confirmar e Acessar com Google'}</span>
            </button>
          </form>
        )}

        {/* 2. SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail ou CPF
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="seuemail@exemplo.com ou 000.000.000-00"
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
                <p className="mb-2">Por segurança, a redefinição é validada diretamente com nossa equipe via WhatsApp.</p>
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

        {/* Informative Footer for Client Security */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Ambiente seguro e criptografado sob normas da OAB e LGPD</span>
          </p>
        </div>

      </div>
    </div>,
    document.body
  );
};
