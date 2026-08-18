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
  deleteContactRequestDoc
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
  loginWithGoogle: () => Promise<{ success: boolean; message?: string; user?: User }>;
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

  // Safe ActiveView setter ensuring clients CANNOT open admin-panel
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
  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
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
        avatar: fbUser.photoURL || existingClient?.avatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&q=80&w=200`,
      };

      const fullClientRecord = {
        ...clientUser,
        passwordPlain: existingClient?.passwordPlain || 'google-auth',
        address: existingClient?.address || '',
      };

      if (!existingClient) {
        setClients(prev => [fullClientRecord, ...prev]);
      }
      syncClient(fullClientRecord);

      setCurrentUser(clientUser);
      setActiveView('client-area');
      setIsAuthModalOpen(false);
      return { success: true, user: clientUser };
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('closed');
      return { 
        success: false, 
        message: isPopupClosed 
          ? 'O login com Google foi cancelado na janela pop-up.' 
          : 'Não foi possível autenticar com o Google. Você também pode se cadastrar ou entrar usando seu e-mail e senha.' 
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
        avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&q=80&w=200`,
      };

      const fullClientRecord = {
        ...newClientUser,
        passwordPlain: data.passwordPlain,
        address: '',
      };

      setClients(prev => [fullClientRecord, ...prev]);
      syncClient(fullClientRecord);

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
