import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Send, 
  Mail, 
  Phone, 
  Volume2, 
  VolumeX, 
  Globe, 
  ShieldAlert, 
  CheckCheck, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  Activity, 
  UserPlus, 
  MessageSquare, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SystemAlert, AdminAlertNotificationConfig } from '../types';

export const AlertsManagerSection: React.FC = () => {
  const {
    systemAlerts,
    unreadAlertsCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteSystemAlert,
    clearAllSystemAlerts,
    notificationConfig,
    updateNotificationConfig,
    sendWhatsappAlert,
    sendEmailAlert,
    triggerTestAlert,
    requestBrowserNotificationPermission,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'new_user' | 'system_error' | 'contact_request' | 'maintenance'>('all');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [savedConfigMessage, setSavedConfigMessage] = useState<string | null>(null);

  const [tempConfig, setTempConfig] = useState<AdminAlertNotificationConfig>(notificationConfig);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationConfig(tempConfig);
    setSavedConfigMessage('Preferências de notificação salvas com sucesso!');
    setTimeout(() => setSavedConfigMessage(null), 3000);
  };

  const handleRequestPush = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      updateNotificationConfig({ browserNotificationsEnabled: true });
      setTempConfig(prev => ({ ...prev, browserNotificationsEnabled: true }));
      setSavedConfigMessage('Notificações do navegador autorizadas com sucesso!');
      setTimeout(() => setSavedConfigMessage(null), 3000);
    } else {
      setSavedConfigMessage('Permissão não concedida pelo navegador. Verifique as configurações de permissão.');
      setTimeout(() => setSavedConfigMessage(null), 4000);
    }
  };

  const filteredAlerts = systemAlerts.filter(alert => {
    if (filterType === 'all') return true;
    if (filterType === 'new_user') return alert.type === 'new_user';
    if (filterType === 'system_error') return alert.type === 'system_error';
    if (filterType === 'contact_request') return alert.type === 'contact_request';
    if (filterType === 'maintenance') return alert.type === 'maintenance';
    return true;
  });

  const newUserCount = systemAlerts.filter(a => a.type === 'new_user').length;
  const errorCount = systemAlerts.filter(a => a.type === 'system_error' || a.type === 'maintenance').length;
  const contactCount = systemAlerts.filter(a => a.type === 'contact_request').length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#07111e] via-[#0b192c] to-[#12233c] text-white p-6 sm:p-8 rounded-2xl border-2 border-[#c5a059]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#c5a059] text-[#07111e] font-black text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <Bell className="w-3.5 h-3.5" />
                CENTRAL DE AVISOS EM TEMPO REAL
              </span>
              {unreadAlertsCount > 0 ? (
                <span className="bg-red-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {unreadAlertsCount} {unreadAlertsCount === 1 ? 'não lido' : 'não lidos'}
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] px-2.5 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Tudo em dia
                </span>
              )}
            </div>

            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white mb-2">
              Notificações de Novas Contas & Alertas de Manutenção
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Você é avisado instantaneamente quando um novo cliente criar conta no portal e caso ocorra qualquer problema técnico no site para rápida manutenção.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {unreadAlertsCount > 0 && (
              <button
                onClick={markAllAlertsAsRead}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <CheckCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Marcar Todas como Lidas</span>
              </button>
            )}

            {systemAlerts.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Deseja realmente limpar todo o histórico de alertas arquivados?')) {
                    clearAllSystemAlerts();
                  }
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Testing Bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-[#c5a059]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0b192c]">
              Testar Notificações e Sons de Alerta
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Verifique o funcionamento dos avisos sonoros, notificações push e integração com WhatsApp/E-mail.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => triggerTestAlert('new_user')}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Testar Alerta de Nova Conta</span>
          </button>

          <button
            onClick={() => triggerTestAlert('system_error')}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Testar Alerta de Erro / Manutenção</span>
          </button>

          <button
            onClick={() => triggerTestAlert('maintenance')}
            className="flex-1 sm:flex-none bg-[#0b192c] hover:bg-[#162a45] text-[#f6e088] border border-[#c5a059]/40 font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Diagnóstico do Sistema</span>
          </button>
        </div>
      </div>

      {/* Configuration Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100/80 border-b border-slate-200 flex items-center justify-between transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0b192c] text-[#c5a059] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0b192c]">
                Canais de Envio & Destinatários dos Avisos
              </h3>
              <p className="text-xs text-slate-500">
                Configure seu WhatsApp e E-mail para onde os alertas devem ser encaminhados.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <span>{isConfigOpen ? 'Recolher' : 'Expandir'}</span>
            {isConfigOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isConfigOpen && (
          <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
            {savedConfigMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{savedConfigMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp para Receber Alertas
                </label>
                <input
                  type="text"
                  required
                  value={tempConfig.adminWhatsapp}
                  onChange={(e) => setTempConfig({ ...tempConfig, adminWhatsapp: e.target.value })}
                  placeholder="5511999998888 ou (11) 99999-8888"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Número do proprietário/administrador com DDD para disparo automático no WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  value={tempConfig.adminEmail}
                  onChange={(e) => setTempConfig({ ...tempConfig, adminEmail: e.target.value })}
                  placeholder="madsonandrye2@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  E-mail oficial para receber relatórios técnicos e alertas do sistema.
                </p>
              </div>
            </div>

            {/* Notification Checkboxes */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Eventos Monitorados pelo Sistema
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#c5a059]/60 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={tempConfig.notifyOnNewAccount}
                    onChange={(e) => setTempConfig({ ...tempConfig, notifyOnNewAccount: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#c5a059] rounded border-slate-300 focus:ring-[#c5a059]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#0b192c] block">
                      🎉 Avisar a Cada Nova Conta
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Gera alerta imediato sempre que um cliente se cadastrar no portal com e-mail ou Google.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#c5a059]/60 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={tempConfig.notifyOnSystemError}
                    onChange={(e) => setTempConfig({ ...tempConfig, notifyOnSystemError: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#0b192c] block">
                      🚨 Avisar Erros / Manutenção
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Captura erros do navegador, falhas de renderização e exceções JavaScript automaticamente.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#c5a059]/60 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={tempConfig.notifyOnContactRequest}
                    onChange={(e) => setTempConfig({ ...tempConfig, notifyOnContactRequest: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#c5a059] rounded border-slate-300 focus:ring-[#c5a059]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#0b192c] block">
                      📩 Avisar Novas Mensagens
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Dispara aviso sempre que um visitante enviar solicitação pelo formulário do site.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#c5a059]/60 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={tempConfig.soundAlertsEnabled}
                    onChange={(e) => setTempConfig({ ...tempConfig, soundAlertsEnabled: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#c5a059] rounded border-slate-300 focus:ring-[#c5a059]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#0b192c] block flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-[#c5a059]" />
                      Sons de Alerta (Áudio)
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Toca avisos sonoros sintetizados no painel ao receber novas contas ou alertas.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#c5a059]/60 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={tempConfig.browserNotificationsEnabled}
                    onChange={(e) => setTempConfig({ ...tempConfig, browserNotificationsEnabled: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#c5a059] rounded border-slate-300 focus:ring-[#c5a059]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#0b192c] block flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      Push do Navegador
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      Exibe notificações flutuantes na área de trabalho mesmo se a aba estiver em segundo plano.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRequestPush}
                className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 underline cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Pedir Autorização de Push no Navegador</span>
              </button>

              <button
                type="submit"
                className="bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#c5a059]" />
                <span>Salvar Preferências</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Alerts Log Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Navigation */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-serif-title font-bold text-lg text-[#0b192c] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#c5a059]" />
              <span>Registro de Alertas do Sistema</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                {systemAlerts.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico sincronizado em tempo real com o banco de dados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0b192c] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({systemAlerts.length})
            </button>

            <button
              onClick={() => setFilterType('new_user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'new_user'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              <span>Novas Contas ({newUserCount})</span>
            </button>

            <button
              onClick={() => setFilterType('system_error')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'system_error'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Erros & Manutenção ({errorCount})</span>
            </button>

            <button
              onClick={() => setFilterType('contact_request')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'contact_request'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Contatos ({contactCount})</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Nenhum alerta registrado</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Quando novos clientes se cadastrarem ou ocorrerem avisos de manutenção, eles aparecerão detalhados aqui.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isExpanded = expandedAlertId === alert.id;
              const isNewUser = alert.type === 'new_user';
              const isError = alert.type === 'system_error' || alert.type === 'maintenance';
              const isContact = alert.type === 'contact_request';

              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-6 transition-colors ${
                    !alert.read ? 'bg-amber-50/40 border-l-4 border-l-[#c5a059]' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isNewUser
                          ? 'bg-emerald-100 text-emerald-700'
                          : isError
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isNewUser && <UserPlus className="w-5 h-5" />}
                        {isError && <AlertTriangle className="w-5 h-5" />}
                        {isContact && <MessageSquare className="w-5 h-5" />}
                        {!isNewUser && !isError && !isContact && <Bell className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isNewUser
                              ? 'bg-emerald-100 text-emerald-800'
                              : isError
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isNewUser ? 'Nova Conta' : isError ? 'Erro / Manutenção' : 'Solicitação'}
                          </span>

                          {!alert.read && (
                            <span className="bg-[#c5a059] text-[#07111e] text-[10px] font-black px-1.5 py-0.2 rounded">
                              NOVO
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-mono">
                            {alert.createdAt}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[#0b192c]">
                          {alert.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {alert.message}
                        </p>

                        {/* Customer Quick Preview Details */}
                        {alert.details && (
                          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                            {alert.details.userName && (
                              <span className="flex items-center gap-1 font-semibold text-slate-800">
                                <strong>Nome:</strong> {alert.details.userName}
                              </span>
                            )}
                            {alert.details.userEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {alert.details.userEmail}
                              </span>
                            )}
                            {alert.details.userPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {alert.details.userPhone}
                              </span>
                            )}
                            {alert.details.userCpf && (
                              <span className="font-mono text-[11px] text-slate-500">
                                CPF: {alert.details.userCpf}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Technical details toggle if error stack or deep info exists */}
                        {alert.details && (alert.details.errorStack || alert.details.errorMessage || alert.details.pageUrl) && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                              className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 underline cursor-pointer"
                            >
                              <Info className="w-3 h-3" />
                              <span>{isExpanded ? 'Ocultar Detalhes Técnicos' : 'Ver Relatório Técnico de Manutenção'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono space-y-1.5 overflow-x-auto border border-slate-800">
                                {alert.details.componentName && (
                                  <div>
                                    <span className="text-amber-400 font-bold">Origem/Componente:</span> {alert.details.componentName}
                                  </div>
                                )}
                                {alert.details.pageUrl && (
                                  <div>
                                    <span className="text-blue-400 font-bold">Página:</span> {alert.details.pageUrl}
                                  </div>
                                )}
                                {alert.details.errorMessage && (
                                  <div>
                                    <span className="text-red-400 font-bold">Erro:</span> {alert.details.errorMessage}
                                  </div>
                                )}
                                {alert.details.errorStack && (
                                  <div>
                                    <span className="text-slate-400 font-bold">Stack Trace:</span>
                                    <pre className="text-[10px] text-slate-300 mt-1 whitespace-pre-wrap max-h-36 overflow-y-auto">
                                      {alert.details.errorStack}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:self-start flex-shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => sendWhatsappAlert(alert)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Encaminhar para meu WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => sendEmailAlert(alert)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Encaminhar para meu E-mail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>E-mail</span>
                      </button>

                      {!alert.read ? (
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium px-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Lido
                        </span>
                      )}

                      <button
                        onClick={() => deleteSystemAlert(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir alerta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* System Health Status Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-white">
                Auditoria de Saúde do Site & Manutenção Contínua
              </h3>
              <p className="text-xs text-slate-400">
                Monitoramento ativo de conectividade, banco de dados e integridade do portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema 100% Operacional</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <div className="text-slate-400 mb-1 font-semibold flex items-center justify-between">
              <span>Banco Firestore</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-bold text-white text-sm">Conectado & Sincronizado</p>
            <p className="text-[11px] text-slate-400 mt-1">Sincronização bidirecional em tempo real ativa.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <div className="text-slate-400 mb-1 font-semibold flex items-center justify-between">
              <span>Isolamento de Contas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-bold text-white text-sm">Privilégios Bloqueados</p>
            <p className="text-[11px] text-slate-400 mt-1">Contas criadas são estritamente de clientes.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <div className="text-slate-400 mb-1 font-semibold flex items-center justify-between">
              <span>Error Boundary</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-bold text-white text-sm">Monitor Ativo</p>
            <p className="text-[11px] text-slate-400 mt-1">Erros de renderização geram alerta imediato.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <div className="text-slate-400 mb-1 font-semibold flex items-center justify-between">
              <span>Push do Navegador</span>
              {notificationConfig.browserNotificationsEnabled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="font-bold text-white text-sm">
              {notificationConfig.browserNotificationsEnabled ? 'Habilitado' : 'Aguardando Ativação'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Alertas na tela do dispositivo.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
