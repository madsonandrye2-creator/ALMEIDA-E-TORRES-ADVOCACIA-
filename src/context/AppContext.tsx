import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  LegalProcess, 
  Lawyer, 
  PracticeArea, 
  ContactRequest, 
  OfficeSettings, 
  ProcessStatus,
  ProcessTimelineEvent
} from '../types';
import {
  INITIAL_OFFICE_SETTINGS,
  INITIAL_LAWYERS,
  INITIAL_PRACTICE_AREAS,
  INITIAL_CLIENTS,
  INITIAL_ADMIN_USER,
  INITIAL_PROCESSES,
  INITIAL_CONTACT_REQUESTS
} from '../data/initialData';
import {
  db,
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
  deleteContactRequestDoc
} from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  login: (identifier: string, passwordPlain: string) => { success: boolean; message?: string; user?: User };
  logout: () => void;
  
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
}

const STORAGE_KEYS = {
  USER: 'at_adv_current_user',
  SETTINGS: 'at_adv_settings',
  LAWYERS: 'at_adv_lawyers',
  AREAS: 'at_adv_areas',
  CLIENTS: 'at_adv_clients',
  PROCESSES: 'at_adv_processes',
  REQUESTS: 'at_adv_requests',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial seed
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
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
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [processes, setProcesses] = useState<LegalProcess[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROCESSES);
      return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
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
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as User & { passwordPlain: string; address?: string });
        setClients(items);
      }
    }, err => {
      console.warn('Clients snapshot listener note:', err);
    });

    // Subscribe to Processes
    const unsubProcesses = onSnapshot(collection(db, COLLECTIONS.PROCESSES), snapshot => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as LegalProcess);
        setProcesses(items);
      }
    }, err => {
      console.warn('Processes snapshot listener note:', err);
    });

    // Subscribe to Contact Requests
    const unsubRequests = onSnapshot(collection(db, COLLECTIONS.REQUESTS), snapshot => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data() as ContactRequest);
        // Sort descending by date
        setContactRequests(items);
      }
    }, err => {
      console.warn('Requests snapshot listener note:', err);
    });

    return () => {
      unsubSettings();
      unsubLawyers();
      unsubAreas();
      unsubClients();
      unsubProcesses();
      unsubRequests();
    };
  }, []);

  // Auth methods
  const login = (identifier: string, passwordPlain: string) => {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanCpf = identifier.replace(/\D/g, '');

    // Check Admin first
    if (
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

    // Check Clients by CPF or Email
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

    return { success: false, message: 'Usuário não encontrado. Verifique seu CPF ou e-mail cadastrado.' };
  };

  const logout = () => {
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
      avatar: clientData.avatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&q=80&w=200`,
    };
    setClients(prev => [newClient, ...prev]);
    syncClient(newClient);
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
    localStorage.clear();

    // Re-sync to Firestore
    syncOfficeSettings(INITIAL_OFFICE_SETTINGS);
    INITIAL_LAWYERS.forEach(l => syncLawyer(l));
    INITIAL_PRACTICE_AREAS.forEach(a => syncPracticeArea(a));
    INITIAL_CLIENTS.forEach(c => syncClient(c));
    INITIAL_PROCESSES.forEach(p => syncProcess(p));
    INITIAL_CONTACT_REQUESTS.forEach(r => syncContactRequest(r));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
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
        activeView,
        setActiveView,
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
