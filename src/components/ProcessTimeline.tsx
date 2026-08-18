import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Scale, 
  Calendar, 
  User, 
  Gavel,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { LegalProcess, ProcessStatus, ProcessTimelineEvent } from '../types';

interface ProcessTimelineProps {
  process: LegalProcess;
}

const STAGES_ORDER: { key: ProcessStatus; label: string; shortLabel: string }[] = [
  { key: 'iniciado', label: 'Processo Iniciado', shortLabel: 'Iniciado' },
  { key: 'documentacao', label: 'Documentação Recebida', shortLabel: 'Documentos' },
  { key: 'protocolado', label: 'Processo Protocolado', shortLabel: 'Protocolo' },
  { key: 'aguardando_manifestacao', label: 'Aguardando Manifestação', shortLabel: 'Manifestação' },
  { key: 'audiencia', label: 'Audiência', shortLabel: 'Audiência' },
  { key: 'sentenca', label: 'Sentença', shortLabel: 'Sentença' },
  { key: 'concluido', label: 'Processo Concluído', shortLabel: 'Conclusão' },
];

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ process }) => {
  const currentStageIndex = STAGES_ORDER.findIndex(s => s.key === process.currentStatus);
  const effectiveIndex = currentStageIndex === -1 ? 2 : currentStageIndex;

  return (
    <div className="space-y-8">
      {/* 1. Horizontal / Stepper Visual Pipeline */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h4 className="font-serif-title text-base font-bold text-[#0b192c] mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#c5a059]" />
            Etapas do Procedimento Trabalhista
          </span>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
            Fase Atual: {STAGES_ORDER[effectiveIndex]?.label || process.currentStatus}
          </span>
        </h4>

        {/* Stepper Grid / Flow */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
            {STAGES_ORDER.map((stage, idx) => {
              const isCompleted = idx < effectiveIndex || (process.currentStatus === 'concluido');
              const isCurrent = idx === effectiveIndex && process.currentStatus !== 'concluido';
              const isFuture = idx > effectiveIndex && process.currentStatus !== 'concluido';

              return (
                <div 
                  key={stage.key}
                  className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                    isCurrent 
                      ? 'bg-amber-50 border-2 border-[#c5a059] shadow-md -translate-y-1' 
                      : isCompleted
                      ? 'bg-white border border-green-200'
                      : 'bg-white/60 border border-slate-200 opacity-60'
                  }`}
                >
                  {/* Step Bubble */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 shadow-sm ${
                    isCurrent
                      ? 'bg-[#c5a059] text-[#07111e] ring-4 ring-amber-200 animate-pulse'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <span className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-[#0b192c]' : isCompleted ? 'text-green-800' : 'text-slate-500'
                  }`}>
                    {stage.shortLabel}
                  </span>

                  <span className="text-[10px] text-slate-400 mt-1">
                    {isCurrent ? 'Em Andamento' : isCompleted ? 'Concluída' : 'Futura'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Chronological Detailed Timeline of Updates & Notes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-serif-title text-lg font-bold text-[#0b192c]">
              Histórico Detalhado &amp; Pareceres do Advogado
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Todas as movimentações processuais certificadas pelo escritório
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md border border-slate-200">
            {process.timeline.length} {process.timeline.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:top-3 before:bottom-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-[#c5a059]/40">
          {[...process.timeline].reverse().map((event, index) => {
            const isLatest = index === 0;

            return (
              <div 
                key={event.id}
                className={`relative bg-slate-50 rounded-xl p-5 border transition-all ${
                  isLatest 
                    ? 'border-[#c5a059] bg-amber-50/30 shadow-md ring-1 ring-[#c5a059]/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Node pin */}
                <div className={`absolute -left-[31px] sm:-left-[35px] top-5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  isLatest ? 'bg-[#c5a059] ring-2 ring-[#c5a059]/40' : 'bg-slate-400'
                }`} />

                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0b192c] text-[#f6e088]">
                      {event.date}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Última Atualização
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-[#c5a059]" />
                    {event.authorName}
                  </span>
                </div>

                <h5 className="font-serif-title text-base font-bold text-[#0b192c] mb-1.5">
                  {event.title}
                </h5>

                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  {event.description}
                </p>

                {event.notes && (
                  <div className="bg-white border-l-4 border-[#c5a059] p-3 rounded-r-lg shadow-sm text-xs text-slate-700 mt-2">
                    <span className="font-bold text-[#0b192c] block mb-0.5">
                      Observação / Orientação Jurídica:
                    </span>
                    {event.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
