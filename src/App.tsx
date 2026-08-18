import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminToolbar } from './components/AdminToolbar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkerRightsActionHub } from './components/WorkerRightsActionHub';
import { AboutSection } from './components/AboutSection';
import { StatsSection } from './components/StatsSection';
import { PracticeAreas } from './components/PracticeAreas';
import { LaborRightsSimulator } from './components/LaborRightsSimulator';
import { TeamSection } from './components/TeamSection';
import { ContactSection } from './components/ContactSection';
import { ClientArea } from './components/ClientArea';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#c5a059] selection:text-white">
      <AdminToolbar />
      <Header />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <Hero />
            <WorkerRightsActionHub />
            <AboutSection />
            <StatsSection />
            <PracticeAreas />
            <LaborRightsSimulator />
            <TeamSection />
            <ContactSection />
          </>
        )}

        {activeView === 'client-area' && <ClientArea />}

        {activeView === 'admin-panel' && <AdminPanel />}
      </main>

      <Footer />
      <WhatsAppFloatingButton />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
