import React, { useState } from 'react';
import { 
  FileWarning, 
  Clock, 
  Briefcase, 
  HeartPulse, 
  ShieldAlert, 
  Coins, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProblemCard {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  urgency: string;
  tag: string;
  highlight: string;
  preFilledMessage: string;
}

export const WorkerRightsActionHub: React.FC = () => {
  const { officeSettings } = useApp();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const problemCards: ProblemCard[] = [
    {
      id: 'demissao',
      icon: FileWarning,
      title: 'Fui Demitido ou Quero Sair',
      subtitle: 'Cálculo de rescisão, aviso prévio, multa de 40% do FGTS e seguro-desemprego retidos.',
      urgency: 'Prazo limite de 2 anos para cobrar',
      tag: 'Mais Frequente',
      highlight: 'Conferência de holerites e TRCT',
      preFilledMessage: 'Olá! Fui desligado da empresa (ou pretendo me desligar) e gostaria de saber se minhas verbas rescisórias e direitos foram calculados corretamente.',
    },
    {
      id: 'horas_extras',
      icon: Clock,
      title: 'Horas Extras & Banco de Horas',
      subtitle: 'Jornadas além do limite sem pagamento, intervalos de almoço suprimidos ou sobreaviso.',
      urgency: 'Adicional de 50% a 100% + reflexos',
      tag: 'Gera Grandes Valores',
      highlight: 'Recuperação de até 5 anos retroativos',
      preFilledMessage: 'Olá! Trabalho (ou trabalhei) fazendo horas extras e não recebia corretamente. Gostaria de entender quanto posso recuperar.',
    },
    {
      id: 'pj_informal',
      icon: Briefcase,
      title: 'Pejotização / Sem Carteira Assinada',
      subtitle: 'Exigência de abrir MEI/PJ, horários fixos e subordinação sem FGTS, 13º e férias.',
      urgency: 'Reconhecimento de vínculo em juízo',
      tag: 'Fraude Trabalhista',
      highlight: 'Direito a todos os benefícios CLT',
      preFilledMessage: 'Olá! Trabalho/trabalhei como PJ ou sem registro na carteira, com horários e cobranças de chefe. Quero saber como ter meus direitos CLT reconhecidos.',
    },
    {
      id: 'acidente_doenca',
      icon: HeartPulse,
      title: 'Acidente de Trabalho ou Burnout',
      subtitle: 'Lesões por esforço repetitivo (LER/DORT), problemas de coluna, ansiedade e depressão laboral.',
      urgency: 'Estabilidade de 12 meses + Indenização',
      tag: 'Proteção à Saúde',
      highlight: 'Indenizações materiais e morais',
      preFilledMessage: 'Olá! Sofri acidente de trabalho ou desenvolvi problema de saúde decorrente do serviço. Gostaria de orientação sobre meus direitos e estabilidade.',
    },
    {
      id: 'assedio_rescisao',
      icon: ShieldAlert,
      title: 'Assédio Moral & Perseguição',
      subtitle: 'Cobranças humilhantes, metas abusivas, isolamento ou desvio de função na empresa.',
      urgency: 'Rescisão Indireta (Demissão da Empresa)',
      tag: 'Saia com Todos os Direitos',
      highlight: 'Receba como se tivesse sido demitido',
      preFilledMessage: 'Olá! Estou sofrendo perseguição/assédio no trabalho e o ambiente está insustentável. Gostaria de entender a Rescisão Indireta.',
    },
    {
      id: 'fgts_atraso',
      icon: Coins,
      title: 'FGTS Não Depositado / Atrasos',
      subtitle: 'Empresa não recolhe o FGTS no extrato da Caixa ou atrasa salários frequentemente.',
      urgency: 'Motivo legal para Rescisão Indireta',
      tag: 'Falta Grave Patronal',
      highlight: 'Liberação imediata do saldo acumulado',
      preFilledMessage: 'Olá! Consultei meu extrato e a empresa não está depositando meu FGTS (ou está atrasando salários). O que posso fazer?',
    },
  ];

  const handleOpenWhatsApp = (message: string) => {
    const fullMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${fullMsg}`, '_blank');
  };

  const clientTestimonials = [
    {
      name: 'Marcos Vinícius S.',
      role: 'Ex-analista de Logística',
      city: 'São Paulo/SP',
      stars: 5,
      comment: 'Fui demitido após 6 anos e a empresa não queria pagar minhas horas extras. A equipe da Almeida & Torres calculou cada centavo e recebi o valor integral na justiça sem dor de cabeça.',
      caseType: 'Horas Extras & Rescisão',
    },
    {
      name: 'Patrícia Helena R.',
      role: 'Supervisora Comercial',
      city: 'Guarulhos/SP',
      stars: 5,
      comment: 'Estava em um ambiente abusivo sofrendo assédio diário. Consegui a rescisão indireta, saí da empresa com todos os meus direitos e a multa de 40% do FGTS liberada.',
      caseType: 'Rescisão Indireta & Danos Morais',
    },
    {
      name: 'Carlos Eduardo M.',
      role: 'Desenvolvedor / Especialista TI',
      city: 'Campinas/SP',
      stars: 5,
      comment: 'Trabalhava como PJ mas tinha todas as obrigações de empregado. O escritório comprovou a fraude e garantiu retroativamente todas as minhas férias, 13º e FGTS de 3 anos.',
      caseType: 'Reconhecimento de Vínculo (Pejotização)',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-amber-50/25 to-white text-slate-900 border-b border-slate-200 relative overflow-hidden">
      
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Section Header: Focused on Worker Pain-Points */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#0b192c] text-[#f6e088] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-3.5 shadow-md border border-[#c5a059]">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Orientação Imediata ao Trabalhador</span>
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0b192c] leading-tight mb-4">
            Identifique sua Situação e Saiba Seus Direitos
          </h2>
          
          <div className="w-20 h-1 bg-[#c5a059] mx-auto mb-5 rounded-full" />

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Selecione o problema que você está enfrentando no trabalho para falar diretamente com um advogado especialista e receber uma análise sem custos:
          </p>
        </div>

        {/* 6 Interactive Cards for Workers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {problemCards.map((card) => {
            const Icon = card.icon;
            const isHovered = selectedCase === card.id;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setSelectedCase(card.id)}
                onMouseLeave={() => setSelectedCase(null)}
                className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-[#c5a059] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b192c] to-[#162a45] text-[#f6e088] border border-[#c5a059]/60 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {card.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-5">
                  <h3 className="font-serif-title text-xl font-bold text-[#0b192c] group-hover:text-amber-900 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* Highlight Pill & Urgency */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{card.highlight}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{card.urgency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Guarantees for the Consumer / Worker */}
        <div className="bg-gradient-to-br from-[#07111e] via-[#0b192c] to-[#162a45] rounded-3xl p-8 sm:p-10 text-white border border-[#c5a059]/50 shadow-2xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
            <h3 className="font-serif-title text-2xl sm:text-3xl font-black text-[#f6e088] mb-2">
              Segurança e Tranquilidade para Você
            </h3>
            <p className="text-slate-300 text-sm">
              Trabalhamos com ética, transparência e foco total na proteção dos seus direitos:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c5a059] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#f6e088] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Análise Sem Custos</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tire todas as suas dúvidas sobre seus direitos e valores antes de qualquer decisão.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c5a059] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#f6e088] flex items-center justify-center mb-3">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Honorários no Êxito</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Na maioria dos casos trabalhistas, os honorários são calculados sobre os valores conquistados.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c5a059] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#f6e088] flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Sigilo Absoluto</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Total discrição sobre sua consulta para proteger sua carreira e sua reputação profissional.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c5a059] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#f6e088] flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Acompanhamento 24h</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Acesse nossa Área do Cliente a qualquer momento pelo celular para ver o andamento do processo.
              </p>
            </div>
          </div>
        </div>

        {/* Real Testimonials from Workers */}
        <div className="mb-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b38e42] bg-amber-50 px-3 py-1 rounded-md border border-amber-200/60 mb-2">
              <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
              <span>Avaliações Verificadas (4.9/5 estrelas)</span>
            </div>
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#0b192c]">
              O que dizem os trabalhadores que atendemos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clientTestimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#c5a059] transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-[#0b192c]">{t.name}</h5>
                    <p className="text-[11px] text-slate-500">{t.role} • {t.city}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t.caseType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
