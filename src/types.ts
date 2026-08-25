export type UserRole = 'client' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  profession?: string;
  companyName?: string;
  notes?: string;
  createdAt?: string;
}

export type ProcessStatus = 
  | 'iniciado' 
  | 'documentacao' 
  | 'protocolado' 
  | 'aguardando_manifestacao' 
  | 'audiencia' 
  | 'sentenca' 
  | 'recurso'
  | 'execucao'
  | 'concluido';

export interface ProcessTimelineEvent {
  id: string;
  date: string;
  title: string;
  status: ProcessStatus;
  description: string;
  notes?: string;
  authorName: string;
}

export interface LegalProcess {
  id: string;
  processNumber: string; // Ex: 0010234-56.2024.5.02.0001
  clientId: string;
  clientName: string;
  clientCpf: string;
  lawyerId: string;
  lawyerName: string;
  lawyerOab: string;
  title: string; // Ex: Ação Reclamatória Trabalhista - Horas Extras e Rescisão
  type: string; // Ex: Reclamatória Trabalhista
  court: string; // Ex: 1ª Vara do Trabalho de São Paulo - TRT-2
  opposingParty: string; // Ex: Empresa Reclamada S.A.
  currentStatus: ProcessStatus;
  startDate: string;
  lastUpdateDate: string;
  timeline: ProcessTimelineEvent[];
  valueEstimated?: string;
  notes?: string;
}

export interface Lawyer {
  id: string;
  name: string;
  oab: string; // Ex: OAB/SP 123.456 (Placeholder)
  specialty: string;
  roleTitle: string; // Ex: Sócio Fundador / Advogado Associado
  bio: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  highlighted?: boolean;
}

export interface PracticeArea {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  isMainHighlight?: boolean;
  iconName: string;
  commonTopics: string[];
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  practiceArea: string;
  description: string;
  createdAt: string;
  status: 'pendente' | 'em_atendimento' | 'concluido';
  adminNotes?: string;
}

export interface OfficeSettings {
  officeName: string;
  tagline: string;

  // Custom Logo Configuration
  logoType?: 'image' | 'icon'; // 'image' for uploaded/URL picture, 'icon' for vector emblem
  logoUrl?: string; // Image file base64 or URL
  logoIcon?: string; // 'Scale' | 'Shield' | 'Landmark' | 'Gavel' | 'Building2' | 'Award' | 'Briefcase' | 'FileText' | 'Crown'
  logoText?: string; // Main brand text (e.g. "ALMEIDA & TORRES")
  logoSubtext?: string; // Secondary line (e.g. "Advocacia Trabalhista")
  logoShape?: 'square' | 'rounded' | 'circle' | 'minimal';
  logoColorTheme?: 'gold' | 'silver' | 'blue' | 'emerald' | 'crimson';
  logoHeight?: number; // Custom display height in px (e.g. 44)
  logoSize?: 'compact' | 'normal' | 'large' | 'xlarge'; // Visual prominence scale
  logoBackdrop?: 'gold-halo' | 'white-card' | 'glass-luxury' | 'transparent'; // Background treatment for logos
  logoGlow?: boolean; // Ambient gold lighting glow
  logoDisplayMode?: 'image-only' | 'image-with-text' | 'text-only' | 'auto'; // Whether to hide duplicate text if the image already contains the logo name
  logoImageZoom?: 'medium' | 'large' | 'huge' | 'gigantic'; // Specific height scale for uploaded logo image
  logoImageEnhance?: 'none' | 'bright-contrast' | 'white-backing' | 'gold-border-glow'; // Visual filter / contrast enhancement

  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  phone: string;
  secondaryPhone?: string;
  whatsapp: string; // Raw digits for wa.me link
  whatsappFormatted: string; // Display format
  email: string;
  documentEmail?: string;
  address: string;
  neighborhood?: string;
  postalCode?: string;
  cityState: string;
  mapsUrl?: string;
  workingHours: string;
  aboutHistory: string;
  aboutMission: string;
  aboutValues: string;
  aboutApproach: string;
  
  // Editable Stats Numbers
  statsLawyersCount: string;
  statsYearsExperience: string;
  statsClientsServed: string;
  statsCasesHandled: string;
  statsSatisfactionRate: string;

  socialInstagram?: string;
  socialLinkedin?: string;
  socialFacebook?: string;
}
