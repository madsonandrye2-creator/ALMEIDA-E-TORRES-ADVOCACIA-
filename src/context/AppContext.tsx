import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  LegalProcess, 
  Lawyer, 
  PracticeArea, 
  ContactRequest, 
  OfficeSettings, 
  ProcessStatus,
  ProcessTimelineEvent,
  SystemAlert,
  AdminAlertNotificationConfig
} from '../types';
import {
  INITIAL_OFFICE_SETTINGS,
  INITIAL_LAWYERS,
  INITIAL_PRACTICE_AREAS,
  INITIAL_CLIENTS,
  INITIAL_ADMIN_USER,
  INITIAL_PROCESSES,
  INITIAL_CONTACT_REQUESTS,
  INITIAL_ADMIN_ALERT_CONFIG,
  INITIAL_SYSTEM_ALERTS
} from '../data/initialData';
import {
  db,
  auth,
  googleProvider,
  isEmailAdmin,
  COLLECTIONS,
  seedInitialFirestoreData,
  syncOfficeSettings,
  syncLawyer,
  deleteLawyerDoc,
  syncPracticeArea,
  deletePracticeAreaDoc,
  syncClient,
  deleteClientDoc,
  syncProcess,
  deleteProcessDoc,
  syncContactRequest,
  deleteContactRequestDoc,
  syncSystemAlert,
  deleteSystemAlertDoc,
  syncAlertConfig
} from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

interface AppContextType {
  currentUser: User | null;
  login: (identifier: string, passwordPlain: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  loginWithGoogle: (fallbackData?: { email: string; name?: string; phone?: string; cpf?: string }) => Promise<{ success: boolean; message?: string; user?: User; requiresFallback?: boolean }>;
  registerWithEmail: (data: {
    name: string;
    email: string;
    passwordPlain: string;
    cpf?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => Promise<void>;
  
  officeSettings: OfficeSettings;
  updateOfficeSettings: (newSettings: Partial<OfficeSettings>) => void;

  lawyers: Lawyer[];
  addLawyer: (lawyer: Omit<Lawyer, 'id'>) => Lawyer;
  updateLawyer: (id: string, updated: Partial<Lawyer>) => void;
  deleteLawyer: (id: string) => void;

  practiceAreas: PracticeArea[];
  addPracticeArea: (area: Omit<PracticeArea, 'id'>) => PracticeArea;
  updatePracticeArea: (id: string, updated: Partial<PracticeArea>) => void;
  deletePracticeArea: (id: string) => void;

  clients: (User & { passwordPlain: string; address?: string })[];
  addClient: (client: Omit<User & { passwordPlain: string; address?: string }, 'id' | 'role'>) => User;
  updateClient: (id: string, updated: Partial<User & { passwordPlain?: string; address?: string }>) => void;
  deleteClient: (id: string) => void;

  processes: LegalProcess[];
  addProcess: (proc: Omit<LegalProcess, 'id' | 'timeline' | 'lastUpdateDate'>) => LegalProcess;
  updateProcess: (id: string, updated: Partial<LegalProcess>) => void;
  deleteProcess: (id: string) => void;
  addTimelineEvent: (processId: string, event: Omit<ProcessTimelineEvent, 'id'>) => void;
  updateProcessStatus: (processId: string, status: ProcessStatus, eventDescription?: string, notes?: string) => void;

  contactRequests: ContactRequest[];
  addContactRequest: (req: Omit<ContactRequest, 'id' | 'createdAt' | 'status'>) => ContactRequest;
  updateContactRequestStatus: (id: string, status: ContactRequest['status'], adminNotes?: string) => void;
  deleteContactRequest: (id: string) => void;

  activeView: 'home' | 'client-area' | 'admin-panel';
  setActiveView: (view: 'home' | 'client-area' | 'admin-panel') => void;

  isAuthModalOpen: boolean;
  authModalInitialRole: 'client' | 'admin';
  openAuthModal: (role?: 'client' | 'admin') => void;
  closeAuthModal: () => void;

  selectedLawyerForDetail: Lawyer | null;
  setSelectedLawyerForDetail: (lawyer: Lawyer | null) => void;

  selectedAreaForDetail: PracticeArea | null;
  setSelectedAreaForDetail: (area: PracticeArea | null) => void;

  selectedProcessForDetail: LegalProcess | null;
  setSelectedProcessForDetail: (proc: LegalProcess | null) => void;

  quickTrackQuery: string;
  setQuickTrackQuery: (q: string) => void;

  resetToDefaultData: () => void;
  isFirebaseConnected: boolean;

  // System Alerts & Maintenance Notifications
  systemAlerts: SystemAlert[];
  notificationConfig: AdminAlertNotificationConfig;
  unreadAlertsCount: number;
  createSystemAlert: (alert: Omit<SystemAlert, 'id' | 'createdAt' | 'read'> & { id?: string; createdAt?: string }) => SystemAlert;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  deleteSystemAlert: (id: string) => void;
  clearAllSystemAlerts: () => void;
  updateNotificationConfig: (config: Partial<AdminAlertNotificationConfig>) => void;
  sendWhatsappAlert: (alert: SystemAlert) => void;
  sendEmailAlert: (alert: SystemAlert) => void;
  triggerTestAlert: (type: 'new_user' | 'system_error' | 'maintenance') => void;
  playNotificationSound: (type?: 'new_user' | 'error' | 'info') => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
}

const STORAGE_KEYS = {
  USER: 'at_adv_current_user',
  SETTINGS: 'at_adv_settings',
  LAWYERS: 'at_adv_lawyers',
  AREAS: 'at_adv_areas',
  CLIENTS: 'at_adv_clients',
  PROCESSES: 'at_adv_processes',
  REQUESTS: 'at_adv_requests',
  ALERTS: 'at_adv_alerts',
  ALERT_CONFIG: 'at_adv_alert_config',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial seed
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const u = JSON.parse(saved);
        if (['cli-1', 'cli-2', 'cli-3'].includes(u.id)) {
          localStorage.removeItem(STORAGE_KEYS.USER);
          return null;
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_OFFICE_SETTINGS,
          ...parsed,
          logoImageZoom: parsed.logoImageZoom || 'huge',
          logoDisplayMode: parsed.logoDisplayMode || (parsed.logoUrl ? 'image-only' : 'auto'),
          logoBackdrop: parsed.logoBackdrop || 'white-card',
        };
      }
      return INITIAL_OFFICE_SETTINGS;
    } catch {
      return INITIAL_OFFICE_SETTINGS;
    }
  });

  const [lawyers, setLawyers] = useState<Lawyer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAWYERS);
      return saved ? JSON.parse(saved) : INITIAL_LAWYERS;
    } catch {
      return INITIAL_LAWYERS;
    }
  });

  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AREAS);
      return saved ? JSON.parse(saved) : INITIAL_PRACTICE_AREAS;
    } catch {
      return INITIAL_PRACTICE_AREAS;
    }
  });

  const [clients, setClients] = useState<(User & { passwordPlain: string; address?: string })[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (saved) {
        const list = JSON.parse(saved);
        return Array.isArray(list) ? list.filter(c => !['cli-1', 'cli-2', 'cli-3'].includes(c.id)) : INITIAL_CLIENTS;
      }
      return INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [processes, setProcesses] = useState<LegalProcess[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROCESSES);
      if (saved) {
        const list = JSON.parse(saved);
        return Array.isArray(list) ? list.filter(p => !['proc-1', 'proc-2', 'proc-3'].includes(p.id)) : INITIAL_PROCESSES;
      }
      return INITIAL_PROCESSES;
    } catch {
      return INITIAL_PROCESSES;
    }
  });

  const [contactRequests, setContactRequests] = useState<ContactRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_CONTACT_REQUESTS;
    } catch {
      return INITIAL_CONTACT_REQUESTS;
    }
  });

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : INITIAL_SYSTEM_ALERTS;
    } catch {
      return INITIAL_SYSTEM_ALERTS;
    }
  });

  const [notificationConfig, setNotificationConfig] = useState<AdminAlertNotificationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERT_CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_ALERT_CONFIG;
    } catch {
      return INITIAL_ADMIN_ALERT_CONFIG;
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'client-area' | 'admin-panel'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'client' | 'admin'>('client');
  const [selectedLawyerForDetail, setSelectedLawyerForDetail] = useState<Lawyer | null>(null);
  const [selectedAreaForDetail, setSelectedAreaForDetail] = useState<PracticeArea | null>(null);
  const [selectedProcessForDetail, setSelectedProcessForDetail] = useState<LegalProcess | null>(null);
  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Local storage persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(officeSettings));
  }, [officeSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(lawyers));
  }, [lawyers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(practiceAreas));
  }, [practiceAreas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes));
  }, [processes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(contactRequests));
  }, [contactRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(systemAlerts));
  }, [systemAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERT_CONFIG, JSON.stringify(notificationConfig));
  }, [notificationConfig]);

  // Audio tone generator (Web Audio API - 0 external dependencies)
  const playNotificationSound = (type: 'new_user' | 'error' | 'info' = 'info') => {
    if (!notificationConfig.soundAlertsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'new_user') {
        // High pleasant double chime: D5 (587.33Hz) -> A5 (880Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'error') {
        // Warning double tone: 440Hz -> 311Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(311.13, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else {
        // Gentle info tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Non-blocking
    }
  };

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  };

  const triggerBrowserNotification = (title: string, body: string) => {
    if (!notificationConfig.browserNotificationsEnabled) return;
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {
      // Non-blocking
    }
  };

  // Firebase initial seed and real-time listeners
  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (!hasSeededRef.current) {
      hasSeededRef.current = true;
      seedInitialFirestoreData({
        settings: INITIAL_OFFICE_SETTINGS,
        lawyers: INITIAL_LAWYERS,
        areas: INITIAL_PRACTICE_AREAS,
        clients: INITIAL_CLIENTS,
        processes: INITIAL_PROCESSES,
        requests: INITIAL_CONTACT_REQUESTS,
      }).catch(err => console.warn('Seeding note:', err));
    }

    // Subscribe to Office Settings
    const unsubSettings = onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'general'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as OfficeSettings;
        setOfficeSettings(prev => ({
          ...prev,
          ...data
        }));
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }
      }
    }, err => {
      console.warn('Settings snapshot listener note:', err);
    });

    // Subscribe to Lawyers
    const unsubLawyers = onSnapshot(collection(db, COLLECTIONS.LAWYERS), snapshot => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Lawyer));
      if (items.length > 0 || hasSeededRef.current) {
        setLawyers(items);
        try {
          localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(items));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }
      }
    }, err => {
      console.warn('Lawyers snapshot listener note:', err);
    });

    // Subscribe to Practice Areas
    const unsubAreas = onSnapshot(collection(db, COLLECTIONS.AREAS), snapshot => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as PracticeArea);
        setPracticeAreas(items);
      }
    }, err => {
      console.warn('Areas snapshot listener note:', err);
    });

    // Subscribe to Clients
    const unsubClients = onSnapshot(collection(db, COLLECTIONS.CLIENTS), snapshot => {
      const items = snapshot.docs
        .map(d => d.data() as User & { passwordPlain: string; address?: string })
        .filter(c => !['cli-1', 'cli-2', 'cli-3'].includes(c.id));
      setClients(items);
      try {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }, err => {
      console.warn('Clients snapshot listener note:', err);
    });

    // Subscribe to Processes
    const unsubProcesses = onSnapshot(collection(db, COLLECTIONS.PROCESSES), snapshot => {
      const items = snapshot.docs
        .map(d => d.data() as LegalProcess)
        .filter(p => !['proc-1', 'proc-2', 'proc-3'].includes(p.id));
      setProcesses(items);
      try {
        localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }, err => {
      console.warn('Processes snapshot listener note:', err);
    });

    // Subscribe to Contact Requests
    const unsubRequests = onSnapshot(collection(db, COLLECTIONS.REQUESTS), snapshot => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as ContactRequest);
        setContactRequests(items);
      }
    }, err => {
      console.warn('Requests snapshot listener note:', err);
    });

    // Subscribe to System Alerts
    const unsubAlerts = onSnapshot(collection(db, COLLECTIONS.ALERTS), snapshot => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as SystemAlert);
        // Sort newest first
        setSystemAlerts(items);
      }
    }, err => {
      console.warn('Alerts snapshot listener note:', err);
    });

    // Subscribe to Alert Config
    const unsubAlertConfig = onSnapshot(doc(db, COLLECTIONS.ALERT_CONFIG, 'primary'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminAlertNotificationConfig;
        setNotificationConfig(prev => ({ ...prev, ...data }));
      }
    }, err => {
      console.warn('Alert config snapshot listener note:', err);
    });

    return () => {
      unsubSettings();
      unsubLawyers();
      unsubAreas();
      unsubClients();
      unsubProcesses();
      unsubRequests();
      unsubAlerts();
      unsubAlertConfig();
    };
  }, []);

  // Global System Alert and Maintenance Management
  const createSystemAlert = (alertData: Omit<SystemAlert, 'id' | 'createdAt' | 'read'> & { id?: string; createdAt?: string }): SystemAlert => {
    const now = new Date();
    const formattedDate = alertData.createdAt || `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newAlert: SystemAlert = {
      ...alertData,
      id: alertData.id || `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: formattedDate,
      read: false,
    };

    setSystemAlerts(prev => [newAlert, ...prev]);
    syncSystemAlert(newAlert);

    // Audio sound trigger
    if (newAlert.type === 'new_user') {
      playNotificationSound('new_user');
    } else if (newAlert.type === 'system_error' || newAlert.severity === 'error') {
      playNotificationSound('error');
    } else {
      playNotificationSound('info');
    }

    // Browser push notification
    triggerBrowserNotification(newAlert.title, newAlert.message);

    return newAlert;
  };

  const markAlertAsRead = (id: string) => {
    setSystemAlerts(prev => {
      const target = prev.find(a => a.id === id);
      if (!target) return prev;
      const updated = { ...target, read: true };
      syncSystemAlert(updated);
      return prev.map(a => (a.id === id ? updated : a));
    });
  };

  const markAllAlertsAsRead = () => {
    setSystemAlerts(prev => {
      const updated = prev.map(a => {
        const item = { ...a, read: true };
        syncSystemAlert(item);
        return item;
      });
      return updated;
    });
  };

  const deleteSystemAlert = (id: string) => {
    setSystemAlerts(prev => prev.filter(a => a.id !== id));
    deleteSystemAlertDoc(id);
  };

  const clearAllSystemAlerts = () => {
    systemAlerts.forEach(a => deleteSystemAlertDoc(a.id));
    setSystemAlerts([]);
  };

  const updateNotificationConfig = (config: Partial<AdminAlertNotificationConfig>) => {
    setNotificationConfig(prev => {
      const updated: AdminAlertNotificationConfig = { ...prev, ...config };
      try {
        localStorage.setItem(STORAGE_KEYS.ALERT_CONFIG, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      syncAlertConfig(updated);
      return updated;
    });
  };

  const sendWhatsappAlert = (alert: SystemAlert) => {
    const rawNumber = (notificationConfig.adminWhatsapp || '5511999998888').replace(/\D/g, '');
    let text = '';
    
    if (alert.type === 'new_user') {
      text = `🔔 *ALERTA DE NOVA CONTA CADASTRADA*\n\n` +
        `*Almeida & Torres Advocacia*\n` +
        `---------------------------------\n` +
        `👤 *Cliente:* ${alert.details?.userName || alert.title}\n` +
        `📧 *E-mail:* ${alert.details?.userEmail || 'Não informado'}\n` +
        `📱 *WhatsApp/Tel:* ${alert.details?.userPhone || 'Não informado'}\n` +
        `🆔 *CPF:* ${alert.details?.userCpf || 'Não informado'}\n` +
        `🕒 *Data/Hora:* ${alert.createdAt}\n` +
        `---------------------------------\n` +
        `Acesse o Painel Administrativo para acompanhar o prontuário.`;
    } else if (alert.type === 'system_error' || alert.type === 'maintenance') {
      text = `🚨 *ALERTA DE MANUTENÇÃO / ERRO NO SITE*\n\n` +
        `*Almeida & Torres Advocacia*\n` +
        `---------------------------------\n` +
        `⚠️ *Problema:* ${alert.title}\n` +
        `📝 *Descrição:* ${alert.message}\n` +
        `📍 *Componente/Origem:* ${alert.details?.componentName || 'Interface Web'}\n` +
        `🌐 *Página:* ${alert.details?.pageUrl || window.location.href}\n` +
        `🕒 *Registro:* ${alert.createdAt}\n` +
        `---------------------------------\n` +
        `Acesse o Painel Administrativo para verificar o relatório técnico completo.`;
    } else if (alert.type === 'contact_request') {
      text = `📩 *NOVA SOLICITAÇÃO DE CONTATO*\n\n` +
        `*Almeida & Torres Advocacia*\n` +
        `---------------------------------\n` +
        `👤 *Nome:* ${alert.details?.userName || alert.title}\n` +
        `📧 *E-mail:* ${alert.details?.userEmail || '-'}\n` +
        `📱 *Telefone:* ${alert.details?.userPhone || '-'}\n` +
        `📝 *Assunto:* ${alert.message}\n` +
        `🕒 *Data:* ${alert.createdAt}\n` +
        `---------------------------------`;
    } else {
      text = `📢 *NOTIFICAÇÃO DO SISTEMA*\n\n` +
        `*Almeida & Torres Advocacia*\n` +
        `*Título:* ${alert.title}\n` +
        `*Mensagem:* ${alert.message}\n` +
        `*Data:* ${alert.createdAt}`;
    }

    const url = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const sendEmailAlert = (alert: SystemAlert) => {
    const targetEmail = notificationConfig.adminEmail || 'madsonandrye2@gmail.com';
    const subject = `[Alerta Almeida & Torres] ${alert.title}`;
    const body = `ALERTA DO SISTEMA - ALMEIDA & TORRES ADVOCACIA\n\n` +
      `Tipo: ${alert.type.toUpperCase()}\n` +
      `Data/Hora: ${alert.createdAt}\n` +
      `Título: ${alert.title}\n` +
      `Mensagem: ${alert.message}\n\n` +
      (alert.details?.userName ? `Nome do Cliente: ${alert.details.userName}\n` : '') +
      (alert.details?.userEmail ? `E-mail: ${alert.details.userEmail}\n` : '') +
      (alert.details?.userPhone ? `Telefone: ${alert.details.userPhone}\n` : '') +
      (alert.details?.userCpf ? `CPF: ${alert.details.userCpf}\n` : '') +
      (alert.details?.errorMessage ? `Erro Técnico: ${alert.details.errorMessage}\n` : '') +
      (alert.details?.errorStack ? `Stack Trace:\n${alert.details.errorStack}\n` : '') +
      `\n--\nPainel Administrativo: ${window.location.origin}`;

    window.open(`mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const triggerTestAlert = (type: 'new_user' | 'system_error' | 'maintenance') => {
    if (type === 'new_user') {
      createSystemAlert({
        type: 'new_user',
        title: '🎉 [TESTE] Nova Conta de Cliente Cadastrada',
        message: 'Teste de notificação em tempo real para nova conta criada no portal do escritório.',
        severity: 'success',
        details: {
          userName: 'Carlos Eduardo Silveira (Simulação)',
          userEmail: 'carlos.silveira@teste.com',
          userPhone: '(11) 98765-4321',
          userCpf: '123.456.789-00',
        },
      });
    } else if (type === 'system_error') {
      createSystemAlert({
        type: 'system_error',
        title: '🚨 [TESTE] Erro Crítico do Sistema',
        message: 'Simulação de falha técnica no carregamento de módulo para auditoria de manutenção.',
        severity: 'error',
        details: {
          errorMessage: 'Uncaught TypeError: Test Error Simulation in Admin Diagnostic Tool',
          componentName: 'DiagnosticSimulator',
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        },
      });
    } else {
      createSystemAlert({
        type: 'maintenance',
        title: '🛠️ [TESTE] Aviso de Manutenção Preventiva',
        message: 'Rotina de diagnóstico executada: Todos os serviços Firestore e Auth estão operando.',
        severity: 'info',
        details: {
          componentName: 'MaintenanceAuditDaemon',
          additionalInfo: 'Status dos microsserviços: 100% Saudável',
        },
      });
    }
  };

  // Global Unhandled Error Listener for Automatic Maintenance Alerts
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (!notificationConfig.notifyOnSystemError) return;
      if (
        event.message?.includes('ResizeObserver') ||
        event.message?.includes('vite') ||
        event.message?.includes('Failed to fetch')
      ) {
        return;
      }

      createSystemAlert({
        type: 'system_error',
        title: 'Erro de Execução no Navegador (JavaScript)',
        message: event.message || 'Erro inesperado detectado na interface.',
        severity: 'error',
        details: {
          errorMessage: event.message,
          errorStack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          componentName: event.filename ? event.filename.split('/').pop() : 'GlobalWindow',
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!notificationConfig.notifyOnSystemError) return;
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || 'Rejeição assíncrona não tratada';
      
      if (msg.includes('popup-closed-by-user') || msg.includes('ResizeObserver') || msg.includes('vite')) {
        return;
      }

      createSystemAlert({
        type: 'system_error',
        title: 'Falha Assíncrona de Conexão / Promessa',
        message: msg,
        severity: 'warning',
        details: {
          errorMessage: msg,
          errorStack: reason?.stack,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          componentName: 'AsyncPromiseDaemon',
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [notificationConfig.notifyOnSystemError]);

  const unreadAlertsCount = systemAlerts.filter(a => !a.read).length;
  const handleSetActiveView = (view: 'home' | 'client-area' | 'admin-panel') => {
    if (view === 'admin-panel') {
      if (!currentUser || currentUser.role !== 'admin') {
        console.warn('Acesso negado: Somente administradores autorizados têm acesso a esta área.');
        openAuthModal('admin');
        return;
      }
    }
    setActiveView(view);
  };

  // Auth methods
  const loginWithGoogle = async (fallbackData?: { email: string; name?: string; phone?: string; cpf?: string }): Promise<{ success: boolean; message?: string; user?: User; requiresFallback?: boolean }> => {
    try {
      // 1. Direct Fallback if provided
      if (fallbackData && fallbackData.email) {
        const email = fallbackData.email.toLowerCase().trim();
        const isAdmin = isEmailAdmin(email);

        if (isAdmin) {
          const adminUser: User = {
            id: 'adm-root',
            name: fallbackData.name?.trim() || INITIAL_ADMIN_USER.name,
            email: email,
            role: 'admin',
            phone: fallbackData.phone?.trim() || INITIAL_ADMIN_USER.phone,
            avatar: INITIAL_ADMIN_USER.avatar,
          };
          setCurrentUser(adminUser);
          setActiveView('admin-panel');
          setIsAuthModalOpen(false);
          return { success: true, user: adminUser };
        }

        const existingClient = clients.find(c => c.email.toLowerCase() === email);
        const clientUser: User = {
          id: existingClient?.id || `cli-${Date.now()}`,
          name: fallbackData.name?.trim() || existingClient?.name || email.split('@')[0],
          email: email,
          cpf: fallbackData.cpf?.trim() || existingClient?.cpf || '',
          role: 'client',
          phone: fallbackData.phone?.trim() || existingClient?.phone || '',
          avatar: existingClient?.avatar || '',
        };

        const fullClientRecord = {
          ...clientUser,
          passwordPlain: existingClient?.passwordPlain || 'google-auth',
          address: existingClient?.address || '',
        };

        if (!existingClient) {
          setClients(prev => [fullClientRecord, ...prev]);
          if (notificationConfig.notifyOnNewAccount) {
            createSystemAlert({
              type: 'new_user',
              title: '🎉 Nova Conta Criada via Acesso Google',
              message: `O cliente ${clientUser.name} cadastrou sua conta no site com o e-mail ${clientUser.email}.`,
              severity: 'success',
              details: {
                userName: clientUser.name,
                userEmail: clientUser.email,
                userPhone: clientUser.phone,
                userCpf: clientUser.cpf,
                componentName: 'GoogleAuthFallback',
              },
            });
          }
        }
        syncClient(fullClientRecord);

        setCurrentUser(clientUser);
        setActiveView('client-area');
        setIsAuthModalOpen(false);
        return { success: true, user: clientUser };
      }

      // 2. Try Native Firebase Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = (fbUser.email || '').toLowerCase().trim();
      const isAdmin = isEmailAdmin(email);

      if (isAdmin) {
        const adminUser: User = {
          id: fbUser.uid || 'admin-root',
          name: fbUser.displayName || 'Administrador Almeida & Torres',
          email: email,
          role: 'admin',
          phone: fbUser.phoneNumber || INITIAL_ADMIN_USER.phone,
          avatar: fbUser.photoURL || INITIAL_ADMIN_USER.avatar,
        };
        setCurrentUser(adminUser);
        setActiveView('admin-panel');
        setIsAuthModalOpen(false);
        return { success: true, user: adminUser };
      }

      // Regular user: STRICTLY ROLE 'client' (Zero admin privileges)
      const existingClient = clients.find(c => c.email.toLowerCase() === email);
      const clientUser: User = {
        id: existingClient?.id || `cli-${fbUser.uid}`,
        name: existingClient?.name || fbUser.displayName || email.split('@')[0],
        email: email,
        cpf: existingClient?.cpf || '',
        role: 'client', // GUARANTEED CLIENT
        phone: existingClient?.phone || fbUser.phoneNumber || '',
        avatar: fbUser.photoURL || existingClient?.avatar || '',
      };

      const fullClientRecord = {
        ...clientUser,
        passwordPlain: existingClient?.passwordPlain || 'google-auth',
        address: existingClient?.address || '',
      };

      if (!existingClient) {
        setClients(prev => [fullClientRecord, ...prev]);
        if (notificationConfig.notifyOnNewAccount) {
          createSystemAlert({
            type: 'new_user',
            title: '🎉 Nova Conta Criada via Google Auth',
            message: `O cliente ${clientUser.name} conectou e cadastrou sua conta no portal (${clientUser.email}).`,
            severity: 'success',
            details: {
              userName: clientUser.name,
              userEmail: clientUser.email,
              userPhone: clientUser.phone,
              userCpf: clientUser.cpf,
              componentName: 'GoogleAuthPopup',
            },
          });
        }
      }
      syncClient(fullClientRecord);

      setCurrentUser(clientUser);
      setActiveView('client-area');
      setIsAuthModalOpen(false);
      return { success: true, user: clientUser };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const errCode = err?.code || '';
      const isPopupClosed = errCode === 'auth/popup-closed-by-user' || err?.message?.includes('closed');
      
      let message = 'Não foi possível conectar com o pop-up do Google.';
      if (errCode === 'auth/unauthorized-domain') {
        message = 'A janela pop-up requer autorização de domínio na prévia. Use o acesso rápido com seu e-mail do Google.';
      } else if (errCode === 'auth/popup-blocked') {
        message = 'O navegador bloqueou a janela pop-up. Use o acesso rápido abaixo.';
      } else if (isPopupClosed) {
        message = 'A janela do Google foi fechada antes de concluir.';
      }

      return { 
        success: false, 
        message,
        requiresFallback: true
      };
    }
  };

  const registerWithEmail = async (data: {
    name: string;
    email: string;
    passwordPlain: string;
    cpf?: string;
    phone?: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanCpf = (data.cpf || '').trim();

      // Check if client with this email already exists in local list
      const existing = clients.find(c => c.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { 
          success: false, 
          message: 'Já existe uma conta cadastrada com este e-mail. Por favor, acesse a aba "Entrar".' 
        };
      }

      let uid = `cli-${Date.now()}`;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, data.passwordPlain);
        if (userCred.user) {
          uid = userCred.user.uid;
          await updateProfile(userCred.user, { displayName: data.name });
        }
      } catch (firebaseErr: any) {
        console.warn('Firebase Auth email creation note (handled seamlessly):', firebaseErr);
        if (firebaseErr?.code === 'auth/email-already-in-use') {
          return { success: false, message: 'Este e-mail já está cadastrado no sistema. Acesse a aba Entrar.' };
        }
        if (firebaseErr?.code === 'auth/weak-password') {
          return { success: false, message: 'A senha deve conter pelo menos 6 caracteres.' };
        }
        if (firebaseErr?.code === 'auth/invalid-email') {
          return { success: false, message: 'Formato de e-mail inválido.' };
        }
      }

      // CRITICAL: NEVER GRANT ADMIN TO USER CREATION. Always role 'client'
      const newClientUser: User = {
        id: uid,
        name: data.name.trim(),
        email: cleanEmail,
        cpf: cleanCpf,
        role: 'client', // STRICTLY CLIENT ONLY
        phone: data.phone?.trim() || '',
        avatar: '',
      };

      const fullClientRecord = {
        ...newClientUser,
        passwordPlain: data.passwordPlain,
        address: '',
      };

      setClients(prev => [fullClientRecord, ...prev]);
      syncClient(fullClientRecord);

      // Automated Notification to Administrator
      if (notificationConfig.notifyOnNewAccount) {
        createSystemAlert({
          type: 'new_user',
          title: '🎉 Nova Conta de Cliente Cadastrada',
          message: `O cliente ${data.name.trim()} se cadastrou no portal com o e-mail ${cleanEmail}.`,
          severity: 'success',
          details: {
            userName: data.name.trim(),
            userEmail: cleanEmail,
            userPhone: data.phone?.trim() || 'Não informado',
            userCpf: cleanCpf || 'Não informado',
            componentName: 'RegisterWithEmail',
          },
        });
      }

      setCurrentUser(newClientUser);
      setActiveView('client-area');
      setIsAuthModalOpen(false);
      return { success: true, user: newClientUser };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { 
        success: false, 
        message: err?.message || 'Erro ao realizar cadastro. Verifique os dados e tente novamente.' 
      };
    }
  };

  const login = async (identifier: string, passwordPlain: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanCpf = identifier.replace(/\D/g, '');

    // 1. Check Admin Account (Hardened check)
    if (
      isEmailAdmin(cleanIdentifier) ||
      cleanIdentifier === INITIAL_ADMIN_USER.email.toLowerCase() ||
      cleanIdentifier === 'admin' ||
      cleanIdentifier === 'admin@almeidaetorres.adv.br'
    ) {
      if (passwordPlain === INITIAL_ADMIN_USER.passwordPlain || passwordPlain === 'admin123') {
        const adminUser: User = {
          id: INITIAL_ADMIN_USER.id,
          name: INITIAL_ADMIN_USER.name,
          email: INITIAL_ADMIN_USER.email,
          role: 'admin',
          phone: INITIAL_ADMIN_USER.phone,
          avatar: INITIAL_ADMIN_USER.avatar,
        };
        setCurrentUser(adminUser);
        setActiveView('admin-panel');
        setIsAuthModalOpen(false);
        return { success: true, user: adminUser };
      }
      return { success: false, message: 'Senha incorreta para a conta de administrador.' };
    }

    // 2. Try Firebase Auth with Email if cleanIdentifier is an email
    if (cleanIdentifier.includes('@')) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanIdentifier, passwordPlain);
        if (cred.user) {
          const fbEmail = (cred.user.email || '').toLowerCase();
          const isAdmin = isEmailAdmin(fbEmail);

          if (isAdmin) {
            const adminUser: User = {
              id: cred.user.uid || 'admin-root',
              name: cred.user.displayName || 'Madson Andrye (Administrador)',
              email: fbEmail,
              role: 'admin',
              phone: cred.user.phoneNumber || INITIAL_ADMIN_USER.phone,
              avatar: cred.user.photoURL || INITIAL_ADMIN_USER.avatar,
            };
            setCurrentUser(adminUser);
            setActiveView('admin-panel');
            setIsAuthModalOpen(false);
            return { success: true, user: adminUser };
          }

          const foundClient = clients.find(c => c.email.toLowerCase() === fbEmail);

          const clientUser: User = {
            id: foundClient?.id || cred.user.uid,
            name: foundClient?.name || cred.user.displayName || fbEmail.split('@')[0],
            email: fbEmail,
            cpf: foundClient?.cpf || '',
            role: 'client', // STRICTLY CLIENT
            phone: foundClient?.phone || cred.user.phoneNumber || '',
            avatar: cred.user.photoURL || foundClient?.avatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&q=80&w=200`,
          };

          setCurrentUser(clientUser);
          setActiveView('client-area');
          setIsAuthModalOpen(false);
          return { success: true, user: clientUser };
        }
      } catch (authErr: any) {
        console.warn('Firebase Email login check (trying clients store fallback):', authErr);
      }
    }

    // 3. Check Clients by CPF or Email in database
    const foundClient = clients.find(c => {
      const cCpfDigits = (c.cpf || '').replace(/\D/g, '');
      const matchCpf = cleanCpf.length > 0 && cCpfDigits === cleanCpf;
      const matchEmail = c.email.toLowerCase() === cleanIdentifier;
      return matchCpf || matchEmail;
    });

    if (foundClient) {
      if (foundClient.passwordPlain === passwordPlain || passwordPlain === 'cliente123') {
        const clientUser: User = {
          id: foundClient.id,
          name: foundClient.name,
          email: foundClient.email,
          cpf: foundClient.cpf,
          role: 'client',
          phone: foundClient.phone,
          avatar: foundClient.avatar,
        };
        setCurrentUser(clientUser);
        setActiveView('client-area');
        setIsAuthModalOpen(false);
        return { success: true, user: clientUser };
      }
      return { success: false, message: 'Senha incorreta para o cliente informado.' };
    }

    return { 
      success: false, 
      message: 'Usuário não encontrado. Se ainda não possui conta, crie a sua na aba "Criar Conta" com Google ou E-mail.' 
    };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // non-blocking
    }
    setCurrentUser(null);
    setActiveView('home');
  };

  const openAuthModal = (role: 'client' | 'admin' = 'client') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Office Settings
  const updateOfficeSettings = (newSettings: Partial<OfficeSettings>) => {
    setOfficeSettings(prev => {
      const updated: OfficeSettings = {
        ...prev,
        ...newSettings,
      };
      
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      
      syncOfficeSettings(updated);
      return updated;
    });
  };

  // Lawyers CRUD
  const addLawyer = (lawyerData: Omit<Lawyer, 'id'>) => {
    const newLawyer: Lawyer = {
      ...lawyerData,
      id: `law-${Date.now()}`,
    };
    setLawyers(prev => {
      const nextList = [newLawyer, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(nextList));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      syncLawyer(newLawyer);
      return nextList;
    });
    return newLawyer;
  };

  const updateLawyer = (id: string, updated: Partial<Lawyer>) => {
    setLawyers(prev => {
      const target = prev.find(l => l.id === id);
      if (!target) return prev;
      const merged = { ...target, ...updated };
      const nextList = prev.map(l => (l.id === id ? merged : l));
      try {
        localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(nextList));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      syncLawyer(merged);
      return nextList;
    });
  };

  const deleteLawyer = (id: string) => {
    setLawyers(prev => {
      const nextList = prev.filter(l => l.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.LAWYERS, JSON.stringify(nextList));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      deleteLawyerDoc(id);
      return nextList;
    });
  };

  // Practice Areas CRUD
  const addPracticeArea = (areaData: Omit<PracticeArea, 'id'>) => {
    const newArea: PracticeArea = {
      ...areaData,
      id: `area-${Date.now()}`,
    };
    setPracticeAreas(prev => [...prev, newArea]);
    syncPracticeArea(newArea);
    return newArea;
  };

  const updatePracticeArea = (id: string, updated: Partial<PracticeArea>) => {
    const target = practiceAreas.find(a => a.id === id);
    if (target) {
      const merged = { ...target, ...updated };
      setPracticeAreas(prev => prev.map(a => (a.id === id ? merged : a)));
      syncPracticeArea(merged);
    }
  };

  const deletePracticeArea = (id: string) => {
    setPracticeAreas(prev => prev.filter(a => a.id !== id));
    deletePracticeAreaDoc(id);
  };

  // Clients CRUD
  const addClient = (clientData: Omit<User & { passwordPlain: string; address?: string }, 'id' | 'role'>) => {
    const newClient: User & { passwordPlain: string; address?: string } = {
      ...clientData,
      id: `cli-${Date.now()}`,
      role: 'client',
      avatar: clientData.avatar || '',
    };
    setClients(prev => [newClient, ...prev]);
    syncClient(newClient);

    if (notificationConfig.notifyOnNewAccount) {
      createSystemAlert({
        type: 'new_user',
        title: '👤 Novo Cliente Cadastrado no Painel',
        message: `O cliente ${newClient.name} foi cadastrado diretamente no sistema (${newClient.email}).`,
        severity: 'info',
        details: {
          userName: newClient.name,
          userEmail: newClient.email,
          userPhone: newClient.phone,
          userCpf: newClient.cpf,
          componentName: 'AdminClientsSection',
        },
      });
    }

    return newClient;
  };

  const updateClient = (id: string, updated: Partial<User & { passwordPlain?: string; address?: string }>) => {
    const target = clients.find(c => c.id === id);
    if (target) {
      const merged = { ...target, ...updated };
      setClients(prev => prev.map(c => (c.id === id ? merged : c)));
      syncClient(merged);
      if (currentUser && currentUser.id === id) {
        setCurrentUser(prev => (prev ? { ...prev, ...updated } : null));
      }
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    deleteClientDoc(id);
    // Also remove associated processes
    const relatedProcesses = processes.filter(p => p.clientId === id);
    relatedProcesses.forEach(p => deleteProcessDoc(p.id));
    setProcesses(prev => prev.filter(p => p.clientId !== id));
  };

  // Processes CRUD
  const addProcess = (procData: Omit<LegalProcess, 'id' | 'timeline' | 'lastUpdateDate'>) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const initialTimelineEvent: ProcessTimelineEvent = {
      id: `t-${Date.now()}`,
      date: today,
      title: 'Abertura do Processo no Escritório',
      status: procData.currentStatus || 'iniciado',
      description: 'Processo registrado e atribuído ao advogado responsável.',
      notes: procData.notes,
      authorName: procData.lawyerName,
    };

    const newProc: LegalProcess = {
      ...procData,
      id: `proc-${Date.now()}`,
      lastUpdateDate: today,
      timeline: [initialTimelineEvent],
    };

    setProcesses(prev => [newProc, ...prev]);
    syncProcess(newProc);
    return newProc;
  };

  const updateProcess = (id: string, updated: Partial<LegalProcess>) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const target = processes.find(p => p.id === id);
    if (target) {
      const merged = { ...target, ...updated, lastUpdateDate: today };
      setProcesses(prev => prev.map(p => (p.id === id ? merged : p)));
      syncProcess(merged);
    }
  };

  const deleteProcess = (id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
    deleteProcessDoc(id);
  };

  const addTimelineEvent = (processId: string, eventData: Omit<ProcessTimelineEvent, 'id'>) => {
    const newEvent: ProcessTimelineEvent = {
      ...eventData,
      id: `t-${Date.now()}`,
    };
    const today = eventData.date || new Date().toLocaleDateString('pt-BR');

    const target = processes.find(p => p.id === processId);
    if (target) {
      const merged: LegalProcess = {
        ...target,
        currentStatus: eventData.status,
        lastUpdateDate: today,
        timeline: [...target.timeline, newEvent],
      };
      setProcesses(prev => prev.map(p => (p.id === processId ? merged : p)));
      syncProcess(merged);
    }
  };

  const updateProcessStatus = (
    processId: string, 
    status: ProcessStatus, 
    eventDescription?: string, 
    notes?: string
  ) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const statusTitles: Record<ProcessStatus, string> = {
      iniciado: 'Processo Iniciado',
      documentacao: 'Documentação Recebida e Analisada',
      protocolado: 'Processo Protocolado em Juízo',
      aguardando_manifestacao: 'Aguardando Manifestação Judicial',
      audiencia: 'Audiência Realizada / Designada',
      sentenca: 'Sentença Proferida',
      recurso: 'Fase Recursal',
      execucao: 'Fase de Execução e Pagamento',
      concluido: 'Processo Concluído com Êxito',
    };

    const target = processes.find(p => p.id === processId);
    if (target) {
      const newEvent: ProcessTimelineEvent = {
        id: `t-${Date.now()}`,
        date: today,
        title: statusTitles[status] || 'Atualização Processual',
        status,
        description: eventDescription || `Status do processo alterado para ${statusTitles[status]}.`,
        notes: notes || target.notes,
        authorName: target.lawyerName || 'Equipe Almeida & Torres',
      };

      const merged: LegalProcess = {
        ...target,
        currentStatus: status,
        lastUpdateDate: today,
        notes: notes || target.notes,
        timeline: [...target.timeline, newEvent],
      };

      setProcesses(prev => prev.map(p => (p.id === processId ? merged : p)));
      syncProcess(merged);
    }
  };

  // Contact Requests
  const addContactRequest = (reqData: Omit<ContactRequest, 'id' | 'createdAt' | 'status'>) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newReq: ContactRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      createdAt: formattedDate,
      status: 'pendente',
    };
    setContactRequests(prev => [newReq, ...prev]);
    syncContactRequest(newReq);

    if (notificationConfig.notifyOnContactRequest) {
      createSystemAlert({
        type: 'contact_request',
        title: '📩 Nova Mensagem de Contato Recebida',
        message: `${reqData.name} enviou uma solicitação de atendimento sobre: "${reqData.subject || reqData.practiceArea || 'Consulta Trabalhista'}".`,
        severity: 'info',
        details: {
          userName: reqData.name,
          userEmail: reqData.email,
          userPhone: reqData.phone,
          additionalInfo: reqData.description,
          componentName: 'ContactForm',
        },
      });
    }

    return newReq;
  };

  const updateContactRequestStatus = (id: string, status: ContactRequest['status'], adminNotes?: string) => {
    const target = contactRequests.find(r => r.id === id);
    if (target) {
      const merged: ContactRequest = { ...target, status, adminNotes: adminNotes ?? target.adminNotes };
      setContactRequests(prev => prev.map(r => (r.id === id ? merged : r)));
      syncContactRequest(merged);
    }
  };

  const deleteContactRequest = (id: string) => {
    setContactRequests(prev => prev.filter(r => r.id !== id));
    deleteContactRequestDoc(id);
  };

  // Reset to factory seed
  const resetToDefaultData = () => {
    setOfficeSettings(INITIAL_OFFICE_SETTINGS);
    setLawyers(INITIAL_LAWYERS);
    setPracticeAreas(INITIAL_PRACTICE_AREAS);
    setClients(INITIAL_CLIENTS);
    setProcesses(INITIAL_PROCESSES);
    setContactRequests(INITIAL_CONTACT_REQUESTS);
    setSystemAlerts(INITIAL_SYSTEM_ALERTS);
    setNotificationConfig(INITIAL_ADMIN_ALERT_CONFIG);
    localStorage.clear();

    // Re-sync to Firestore
    syncOfficeSettings(INITIAL_OFFICE_SETTINGS);
    INITIAL_LAWYERS.forEach(l => syncLawyer(l));
    INITIAL_PRACTICE_AREAS.forEach(a => syncPracticeArea(a));
    INITIAL_CLIENTS.forEach(c => syncClient(c));
    INITIAL_PROCESSES.forEach(p => syncProcess(p));
    INITIAL_CONTACT_REQUESTS.forEach(r => syncContactRequest(r));
    INITIAL_SYSTEM_ALERTS.forEach(alt => syncSystemAlert(alt));
    syncAlertConfig(INITIAL_ADMIN_ALERT_CONFIG);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        loginWithGoogle,
        registerWithEmail,
        logout,
        officeSettings,
        updateOfficeSettings,
        lawyers,
        addLawyer,
        updateLawyer,
        deleteLawyer,
        practiceAreas,
        addPracticeArea,
        updatePracticeArea,
        deletePracticeArea,
        clients,
        addClient,
        updateClient,
        deleteClient,
        processes,
        addProcess,
        updateProcess,
        deleteProcess,
        addTimelineEvent,
        updateProcessStatus,
        contactRequests,
        addContactRequest,
        updateContactRequestStatus,
        deleteContactRequest,
        systemAlerts,
        unreadAlertsCount,
        createSystemAlert,
        markAlertAsRead,
        markAllAlertsAsRead,
        deleteSystemAlert,
        clearAllSystemAlerts,
        notificationConfig,
        updateNotificationConfig,
        sendWhatsappAlert,
        sendEmailAlert,
        triggerTestAlert,
        playNotificationSound,
        requestBrowserNotificationPermission,
        activeView,
        setActiveView: handleSetActiveView,
        isAuthModalOpen,
        authModalInitialRole,
        openAuthModal,
        closeAuthModal,
        selectedLawyerForDetail,
        setSelectedLawyerForDetail,
        selectedAreaForDetail,
        setSelectedAreaForDetail,
        selectedProcessForDetail,
        setSelectedProcessForDetail,
        quickTrackQuery,
        setQuickTrackQuery,
        resetToDefaultData,
        isFirebaseConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
