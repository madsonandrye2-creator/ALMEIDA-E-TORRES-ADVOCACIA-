import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Scale, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSectionEditButton } from './AdminSectionEditButton';

export const ContactSection: React.FC = () => {
  const { officeSettings, practiceAreas, addContactRequest, currentUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    practiceArea: 'Direito Trabalhista (Foco Principal)',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.description) {
      alert('Por favor, preencha os campos obrigatórios (Nome, Telefone/WhatsApp e Descrição).');
      return;
    }

    setSubmitting(true);

    try {
      const created = addContactRequest({
        name: formData.name,
        email: formData.email || 'Não informado',
        phone: formData.phone,
        subject: formData.subject || 'Consulta Trabalhista',
        practiceArea: formData.practiceArea,
        description: formData.description,
      });

      setLastSubmittedId(created.id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsAppDirectly = () => {
    const text = encodeURIComponent(
      `*Solicitação de Atendimento Jurídico - ${officeSettings.officeName}*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Área:* ${formData.practiceArea}\n` +
      `*Assunto:* ${formData.subject || 'Atendimento Trabalhista'}\n\n` +
      `*Relato:* ${formData.description}\n\n` +
      `Gostaria de dar continuidade à minha orientação pelo WhatsApp.`
    );
    window.open(`https://wa.me/${officeSettings.whatsapp}?text=${text}`, '_blank');
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      practiceArea: 'Direito Trabalhista (Foco Principal)',
      description: '',
    });
    setSubmitted(false);
  };

  return (
    <section id="contato" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          {currentUser?.role === 'admin' && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <AdminSectionEditButton tab="contacts" label="✏️ Alterar Telefones, WhatsApp & E-mails" />
              <AdminSectionEditButton tab="location" label="✏️ Alterar Endereço & Localização" />
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#b38e42] bg-amber-50 px-3 py-1 rounded-md border border-amber-200/60 mb-3">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Fale com Nossos Especialistas</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#0b192c] mb-4">
            Atendimento ao Cliente &amp; Contato
          </h2>
          <div className="w-16 h-1 bg-[#c5a059] mx-auto mb-5 rounded-full" />
          <p className="text-slate-600 text-base leading-relaxed">
            Relate sua dúvida ou problema trabalhista no formulário abaixo. Nossa equipe analisará as informações e dará continuidade imediata ao seu atendimento pelo WhatsApp oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Office Contacts Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-[#0b192c] rounded-2xl p-8 text-white shadow-xl border border-[#c5a059]/40 relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-serif-title text-2xl font-bold text-[#f6e088] mb-6">
                Canais de Atendimento
              </h3>

              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center flex-shrink-0 text-[#f6e088]">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider block">
                      WhatsApp Oficial
                    </span>
                    <a
                      href={`https://wa.me/${officeSettings.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-white hover:text-[#f6e088] transition-colors"
                    >
                      {officeSettings.whatsappFormatted}
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Atendimento rápido e orientações preliminares
                    </span>
                  </div>
                </div>

                {/* Telefone Fixo */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center flex-shrink-0 text-[#f6e088]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider block">
                      Telefones de Atendimento
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <a
                        href={`tel:${officeSettings.phone.replace(/\D/g, '')}`}
                        className="text-base font-semibold text-white hover:text-[#f6e088] transition-colors"
                      >
                        {officeSettings.phone} <span className="text-xs text-slate-400 font-normal">(Fixo / PABX)</span>
                      </a>
                      {officeSettings.secondaryPhone && (
                        <a
                          href={`tel:${officeSettings.secondaryPhone.replace(/\D/g, '')}`}
                          className="text-sm font-medium text-slate-200 hover:text-[#f6e088] transition-colors"
                        >
                          {officeSettings.secondaryPhone} <span className="text-xs text-slate-400 font-normal">(Plantão / Suporte)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* E-mails */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center flex-shrink-0 text-[#f6e088]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider block">
                      E-mails Oficiais
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <a
                        href={`mailto:${officeSettings.email}`}
                        className="text-sm font-semibold text-white hover:text-[#f6e088] transition-colors"
                      >
                        {officeSettings.email}
                      </a>
                      {officeSettings.documentEmail && (
                        <a
                          href={`mailto:${officeSettings.documentEmail}`}
                          className="text-xs text-slate-300 hover:text-[#f6e088] transition-colors"
                        >
                          {officeSettings.documentEmail} <span className="text-[10px] text-slate-400">(Documentos &amp; Jurídico)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Endereço & Localização */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center flex-shrink-0 text-[#f6e088]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider block">
                      Endereço &amp; Localização
                    </span>
                    <p className="text-sm text-slate-200 font-medium">
                      {officeSettings.address}
                    </p>
                    <p className="text-xs text-slate-300">
                      {[officeSettings.neighborhood, officeSettings.cityState, officeSettings.postalCode ? `CEP ${officeSettings.postalCode}` : ''].filter(Boolean).join(' - ')}
                    </p>
                    <a
                      href={officeSettings.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${officeSettings.address}, ${officeSettings.cityState}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#f6e088] hover:text-white font-bold mt-2 bg-white/10 px-3 py-1 rounded border border-[#c5a059]/40 transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-[#c5a059]" />
                      <span>Abrir no Google Maps / Traçar Rota</span>
                    </a>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#c5a059]/20 border border-[#c5a059] flex items-center justify-center flex-shrink-0 text-[#f6e088]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-[#c5a059] tracking-wider block">
                      Horário de Funcionamento
                    </span>
                    <p className="text-sm text-slate-200">
                      {officeSettings.workingHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & LGPD reminder card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#b38e42] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#0b192c] uppercase">
                  Proteção de Dados &amp; Sigilo Profissional
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Suas informações estão protegidas sob sigilo da advocacia e pelas diretrizes da Lei Geral de Proteção de Dados (LGPD). Nunca compartilhamos seus dados com terceiros.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-xl relative">
              
              {!submitted ? (
                <>
                  <div className="mb-6">
                    <h3 className="font-serif-title text-2xl font-bold text-[#0b192c] mb-1">
                      Envie seu Caso para Análise
                    </h3>
                    <p className="text-xs text-slate-500">
                      Preencha os campos abaixo. Após o envio, você poderá continuar o atendimento diretamente no WhatsApp oficial.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nome */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Seu Nome Completo *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ex: João da Silva"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Telefone / WhatsApp */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Telefone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Ex: (11) 99999-8888"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* E-mail */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          E-mail (opcional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Ex: joao@email.com"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Área Jurídica */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Área de Interesse
                        </label>
                        <select
                          name="practiceArea"
                          value={formData.practiceArea}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all"
                        >
                          {practiceAreas.map((area) => (
                            <option key={area.id} value={area.title}>
                              {area.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Assunto */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Assunto Resumido
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Ex: Demissão sem justa causa / Cobrança de horas extras"
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Descrição do Problema */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Descreva seu problema ou dúvida *
                      </label>
                      <textarea
                        name="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Conte detalhes como: há quanto tempo trabalhava na empresa, se tinha carteira assinada, valores não recebidos ou motivo da saída..."
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#c5a059] focus:bg-white rounded-lg p-4 text-sm text-slate-900 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#0b192c] hover:bg-[#162a45] text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4 text-[#c5a059]" />
                      <span>{submitting ? 'Registrando...' : 'Registrar Solicitação & Continuar'}</span>
                    </button>
                  </form>
                </>
              ) : (
                /* Success Screen with WhatsApp Trigger */
                <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="font-serif-title text-2xl font-bold text-[#0b192c] mb-2">
                    Solicitação Recebida com Sucesso!
                  </h3>

                  <p className="text-slate-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    Seu relato foi salvo no sistema da <strong>{officeSettings.officeName}</strong>. 
                    Para agilizar a análise dos seus documentos e falar agora com um advogado, clique no botão abaixo:
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-md mx-auto text-left text-xs text-amber-900">
                    <p className="font-bold mb-1">Resumo enviado:</p>
                    <p><strong>Nome:</strong> {formData.name}</p>
                    <p><strong>Área:</strong> {formData.practiceArea}</p>
                    <p><strong>Telefone:</strong> {formData.phone}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <button
                      onClick={handleOpenWhatsAppDirectly}
                      id="btn-continuar-whatsapp"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5 fill-white/20" />
                      <span>Continuar Atendimento pelo WhatsApp</span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleResetForm}
                      className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
                    >
                      Enviar outro relato
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
