import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  onSnapshot,
  query,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';
import {
  OfficeSettings,
  Lawyer,
  PracticeArea,
  User,
  LegalProcess,
  ContactRequest,
} from '../types';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId || '(default)',
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId 
    : undefined
);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Designated Administrator Accounts
export const ADMIN_EMAILS = [
  'admin@almeidaetorres.adv.br',
  'admin@almeidaetorres.com.br',
  'madsonandrye2@gmail.com'
];

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(admin => admin.toLowerCase() === clean);
}

// Collection references
export const COLLECTIONS = {
  SETTINGS: 'office_settings',
  LAWYERS: 'lawyers',
  AREAS: 'practice_areas',
  CLIENTS: 'clients',
  PROCESSES: 'processes',
  REQUESTS: 'contact_requests',
  ALERTS: 'system_alerts',
  ALERT_CONFIG: 'alert_config',
} as const;

// Helper to sanitize objects for Firestore (removes undefined values which cause setDoc to crash)
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeForFirestore(value);
      } else if (Array.isArray(value)) {
        clean[key] = value.map(item => (item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item));
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Helper to seed initial data if collections are empty and purge demo accounts
export async function seedInitialFirestoreData(seeds: {
  settings: OfficeSettings;
  lawyers: Lawyer[];
  areas: PracticeArea[];
  clients: (User & { passwordPlain: string; address?: string })[];
  processes: LegalProcess[];
  requests: ContactRequest[];
}) {
  try {
    const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), sanitizeForFirestore(seeds.settings));
    }

    const lawyersSnap = await getDocs(collection(db, COLLECTIONS.LAWYERS));
    if (lawyersSnap.empty && seeds.lawyers.length > 0) {
      const batch = writeBatch(db);
      seeds.lawyers.forEach(l => {
        batch.set(doc(db, COLLECTIONS.LAWYERS, l.id), sanitizeForFirestore(l));
      });
      await batch.commit();
    }

    const areasSnap = await getDocs(collection(db, COLLECTIONS.AREAS));
    if (areasSnap.empty && seeds.areas.length > 0) {
      const batch = writeBatch(db);
      seeds.areas.forEach(a => {
        batch.set(doc(db, COLLECTIONS.AREAS, a.id), sanitizeForFirestore(a));
      });
      await batch.commit();
    }

    // Clean up any existing legacy demo accounts from Firestore
    const demoClientIds = ['cli-1', 'cli-2', 'cli-3'];
    for (const demoId of demoClientIds) {
      try {
        const demoDoc = await getDoc(doc(db, COLLECTIONS.CLIENTS, demoId));
        if (demoDoc.exists()) {
          await deleteDoc(doc(db, COLLECTIONS.CLIENTS, demoId));
        }
      } catch (e) {
        // non-blocking
      }
    }

    // Clean up any existing legacy demo processes from Firestore
    const demoProcessIds = ['proc-1', 'proc-2', 'proc-3'];
    for (const procId of demoProcessIds) {
      try {
        const procDoc = await getDoc(doc(db, COLLECTIONS.PROCESSES, procId));
        if (procDoc.exists()) {
          await deleteDoc(doc(db, COLLECTIONS.PROCESSES, procId));
        }
      } catch (e) {
        // non-blocking
      }
    }

    const reqSnap = await getDocs(collection(db, COLLECTIONS.REQUESTS));
    if (reqSnap.empty && seeds.requests.length > 0) {
      const batch = writeBatch(db);
      seeds.requests.forEach(r => {
        batch.set(doc(db, COLLECTIONS.REQUESTS, r.id), sanitizeForFirestore(r));
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore initial seeding skipped or encountered non-blocking note:', err);
  }
}

// Firestore operations
export async function syncOfficeSettings(settings: OfficeSettings): Promise<boolean> {
  try {
    const cleanData = sanitizeForFirestore(settings);
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), cleanData, { merge: true });
    console.log('✅ Informações do escritório sincronizadas com sucesso no Firestore');
    return true;
  } catch (err) {
    console.error('❌ Erro ao salvar configurações no Firestore:', err);
    return false;
  }
}

export async function syncLawyer(lawyer: Lawyer) {
  try {
    await setDoc(doc(db, COLLECTIONS.LAWYERS, lawyer.id), sanitizeForFirestore(lawyer), { merge: true });
  } catch (err) {
    console.error('Error saving lawyer to Firestore:', err);
  }
}

export async function deleteLawyerDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LAWYERS, id));
  } catch (err) {
    console.error('Error deleting lawyer from Firestore:', err);
  }
}

export async function syncPracticeArea(area: PracticeArea) {
  try {
    await setDoc(doc(db, COLLECTIONS.AREAS, area.id), sanitizeForFirestore(area), { merge: true });
  } catch (err) {
    console.error('Error saving practice area to Firestore:', err);
  }
}

export async function deletePracticeAreaDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.AREAS, id));
  } catch (err) {
    console.error('Error deleting practice area from Firestore:', err);
  }
}

export async function syncClient(client: User & { passwordPlain: string; address?: string }) {
  try {
    await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), sanitizeForFirestore(client), { merge: true });
  } catch (err) {
    console.error('Error saving client to Firestore:', err);
  }
}

export async function deleteClientDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLIENTS, id));
  } catch (err) {
    console.error('Error deleting client from Firestore:', err);
  }
}

export async function syncProcess(proc: LegalProcess) {
  try {
    await setDoc(doc(db, COLLECTIONS.PROCESSES, proc.id), sanitizeForFirestore(proc), { merge: true });
  } catch (err) {
    console.error('Error saving process to Firestore:', err);
  }
}

export async function deleteProcessDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PROCESSES, id));
  } catch (err) {
    console.error('Error deleting process from Firestore:', err);
  }
}

export async function syncContactRequest(req: ContactRequest) {
  try {
    await setDoc(doc(db, COLLECTIONS.REQUESTS, req.id), sanitizeForFirestore(req), { merge: true });
  } catch (err) {
    console.error('Error saving contact request to Firestore:', err);
  }
}

export async function deleteContactRequestDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.REQUESTS, id));
  } catch (err) {
    console.error('Error deleting contact request from Firestore:', err);
  }
}

export async function syncSystemAlert(alert: any) {
  try {
    await setDoc(doc(db, COLLECTIONS.ALERTS, alert.id), sanitizeForFirestore(alert), { merge: true });
  } catch (err) {
    console.error('Error saving system alert to Firestore:', err);
  }
}

export async function deleteSystemAlertDoc(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ALERTS, id));
  } catch (err) {
    console.error('Error deleting system alert from Firestore:', err);
  }
}

export async function syncAlertConfig(config: any) {
  try {
    await setDoc(doc(db, COLLECTIONS.ALERT_CONFIG, 'primary'), sanitizeForFirestore(config), { merge: true });
  } catch (err) {
    console.error('Error saving alert config to Firestore:', err);
  }
}
