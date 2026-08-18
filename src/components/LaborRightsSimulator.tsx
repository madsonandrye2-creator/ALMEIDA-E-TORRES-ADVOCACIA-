import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  HelpCircle, 
  CheckCircle2, 
  MessageCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LaborRightsSimulator: React.FC = () => {
  const { officeSettings } = useApp();

  const [dismissalType, setDismissalType] = useState<'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'rescisao_indireta'>('sem_justa_causa');
  const [salary, setSalary] = useState('3500');
  const [monthsWorked, setMonthsWorked] = useState('24');
  const [hasUnpaidOvertime, setHasUnpaidOvertime] = useState(true);
  const [noFormalContract, setNoFormalContract] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const numSalary = parseFloat(salary) || 0;
  const numMonths = parseInt(monthsWorked) || 0;

  // Simple estimated rights preview
  const estimatedFGTSBalance = (numSalary * 0.08 * numMonths);
  const estimatedFine40 = dismissalType === 'sem_justa_causa' || dismissalType === 'rescisao_indireta'
    ? estimatedFGTSBalance * 0.40
    : 0;
  const estimatedNotice = dismissalType === 'sem_justa_causa' || dismissalType === 'rescisao_indireta'
    ? numSalary * (1 + Math.min(Math.floor(numMonths / 12) * 0.1, 0.9))
    : 0;
  const estimated13th = (numSalary / 12) * (numMonths % 12 || 12);
  const estimatedVacation = (numSalary * 1.33);

  const totalEstimate = estimatedFine40 + estimatedNotice + estimated13th + estimatedVacation + (hasUnpaidOvertime ? numSalary * 3 : 0);

  const handleSendToLawyer = () => {
    const text = encodeURIComponent(
      `*Simulação de Direitos Trabalhistas - ${officeSettings.officeName}*\n\n` +
      `*Tipo de Saída/Demissão:* ${dismissalType}\n` +
      `*Último Salário Bruto:* R$ ${numSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `*Tempo de Empresa:* ${numMonths} meses\n` +
      `*Possui Horas Extras não pagas:* ${hasUnpaidOvertime ? 'Sim' : 'Não'}\n` +
      `*Sem registro em Carteira (Informal/PJ):* ${noFormalContract ? 'Sim' : 'Não'}\n\n` +
      `Gostaria de uma análise detalhada dos meus holerites e rescisão com um advogado.`
    );
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <section className="py-16 bg-[#07111e] text-white border-y border-[#c5a059]/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f6e088] bg-[#c5a059]/15 px-3 py-1 rounded-md border border-[#c5a059]/30 mb-3">
            <Calculator className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Ferramenta Informativa Gratuita</span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white mb-3">
            Simulador de Direitos &amp; Verbas Trabalhistas
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Verifique quais verbas você tem direito a receber e envie os dados para conferência minuciosa com nossos advogados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-[#0b192c] rounded-2xl p-6 sm:p-8 border border-[#c5a059]/40 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Inputs Column */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Motivo do Desligamento / Situação
                </label>
                <select
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value as any)}
                  className="w-full bg-[#07111e] border border-white/20 focus:border-[#c5a059] rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="sem_justa_causa">Demissão sem justa causa pelo empregador</option>
                  <option value="rescisao_indireta">Rescisão Indireta (Falta grave da empresa / Atraso de salário)</option>
                  <option value="pedido_demissao">Pedido de demissão pelo empregado</option>
                  <option value="com_justa_causa">Demissão com justa causa (Reversão)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Último Salário Bruto (R$)
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Ex: 3500"
                    className="w-full bg-[#07111e] border border-white/20 focus:border-[#c5a059] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Meses Trabalhados na Empresa
                  </label>
                  <input
                    type="number"
                    value={monthsWorked}
                    onChange={(e) => setMonthsWorked(e.target.value)}
                    placeholder="Ex: 24"
                    className="w-full bg-[#07111e] border border-white/20 focus:border-[#c5a059] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasUnpaidOvertime}
                    onChange={(e) => setHasUnpaidOvertime(e.target.checked)}
                    className="rounded text-[#c5a059] focus:ring-[#c5a059]"
                  />
                  <span>Fazia horas extras, trabalhava em feriados ou não tinha intervalo completo</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noFormalContract}
                    onChange={(e) => setNoFormalContract(e.target.checked)}
                    className="rounded text-[#c5a059] focus:ring-[#c5a059]"
                  />
                  <span>Trabalhou sem carteira assinada ou como falso PJ (Pejotização)</span>
                </label>
              </div>
            </div>

            {/* Results & CTA Column */}
            <div className="lg:col-span-5 bg-[#07111e] rounded-xl p-6 border border-[#c5a059]/40 text-center">
              <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider block mb-1">
                Estimativa Referencial de Verbas
              </span>
              
              <div className="font-serif-title text-2xl sm:text-3xl font-extrabold text-[#f6e088] mb-1">
                R$ {totalEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                * Inclui estimativa de aviso prévio, FGTS 40%, proporcionais e reflexos cabíveis.
              </p>

              <button
                onClick={handleSendToLawyer}
                className="w-full bg-[#c5a059] hover:bg-[#d4af37] text-[#07111e] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-[#07111e]/20" />
                <span>Enviar Cálculo para o Advogado</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
