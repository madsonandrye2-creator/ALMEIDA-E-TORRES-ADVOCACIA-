# Documentação do Sistema — Almeida & Torres Advocacia Trabalhista

## 1. Visão Geral do Projeto
O portal **Almeida & Torres Advocacia** é uma aplicação web completa desenvolvida com **React 19**, **TypeScript**, **Tailwind CSS** e integrada ao **Firebase (Firestore & Authentication)**. O sistema atende tanto à presença institucional e captação de clientes quanto à gestão jurídica interna e acompanhamento de processos pelos clientes.

---

## 2. Principais Módulos da Aplicação

### 2.1. Área Institucional e Atendimento
- **Hero & Apresentação**: Banner de destaque com foco em Direito do Trabalho, defesa dos direitos dos trabalhadores e canais diretos de contato.
- **Áreas de Atuação**: Detalhamento de causas trabalhistas (rescisão indireta, horas extras, insalubridade/periculosidade, assédio, acidentes de trabalho e reversão de justa causa).
- **Simulador de Direitos Trabalhistas (`LaborRightsSimulator`)**: Ferramenta interativa para o trabalhador estimar rescisão, verbas devidas, férias, 13º e FGTS.
- **Corpo Jurídico (`TeamSection`)**: Apresentação dos advogados especialistas com foto/monograma, número de OAB, especialidades e links de contato.
- **Hub de Ação Rápida & WhatsApp Flutuante**: Botões integrados para atendimento imediato via WhatsApp com mensagens pré-formatadas.

### 2.2. Autenticação e Cadastro Automático (`AuthModal`)
- **Login e Registro em Tempo Real**: Suporte a login por e-mail/senha e autenticação via Google.
- **Cadastro Automático de Clientes**: Ao registrar uma conta, os dados do cliente são sincronizados em tempo real no Firestore e disponibilizados instantaneamente no Painel Administrativo.
- **Campos Obrigatórios**:
  - Nome Completo
  - E-mail
  - **CPF Obrigatório** com validação de 11 dígitos e máscara `000.000.000-00`
  - Telefone / WhatsApp com DDD

### 2.3. Área do Cliente (`ClientArea`)
- **Acompanhamento de Processos em Tempo Real**:
  - Consulta detalhada de processos vinculados por ID ou CPF do cliente.
  - Linha do tempo de andamento processual (`ProcessTimeline`) com status (Em análise, Petição Inicial, Audiência, Sentença, Recurso, Execução e Concluído).
- **Gestão de Documentos**:
  - Upload e download de documentos do cliente (RG/CNH, Carteira de Trabalho, Contracheques, Extratos do FGTS).
- **Atualização de Cadastro**:
  - Edição de dados pessoais, profissão, empresa reclamada, endereço completo e foto de perfil / monograma.

### 2.4. Painel Administrativo (`AdminPanel`)
Acesso exclusivo para administradores (`role: 'admin'`) com controle total sobre as operações do escritório:

1. **Dashboard Executivo**:
   - Totalizadores de processos ativos, audiências do mês, clientes cadastrados e honorários.
   - **Feed de Cadastros Automáticos**: Lista em tempo real de novos clientes registrados no portal com botão de criação rápida de processo e contato via WhatsApp com um clique.
2. **Gestão de Processos (`/processes`)**:
   - Criação, edição, exclusão e alteração de fases de processos trabalhistas.
   - Vínculo direto com clientes cadastrados e advogados responsáveis.
   - Upload de anexos e peças processuais.
3. **Gestão de Clientes (`/clients`)**:
   - Listagem completa com busca por Nome, E-mail, CPF ou Telefone.
   - Edição de fichas cadastrais e histórico processual de cada cliente.
4. **Gestão de Audiências e Prazos (`/hearings`)**:
   - Calendário de audiências com alertas de proximidade e status.
5. **Corpo Jurídico (`/lawyers`)**:
   - Cadastro e edição de advogados, cargos, OAB e fotos de perfil.
6. **Editor Visual do Site & Identidade (`/site-settings` & `LogoEditorModal`)**:
   - Edição rápida dos textos institucionais, telefones, endereços, redes sociais e personalização visual da logomarca/símbolo da balança da justiça.
7. **Central de Alertas & Auditoria de Manutenção (`AlertsManagerSection`)**:
   - Notificações de novos clientes registrados, prazos iminentes e verificador de integridade das rotas e serviços.

---

## 3. Arquitetura Técnica

```
├── /src
│   ├── components/            # Componentes visuais modulares
│   │   ├── AdminPanel.tsx     # Painel de controle do administrador
│   │   ├── ClientArea.tsx     # Portal do cliente / processos
│   │   ├── AuthModal.tsx      # Modal de login/cadastro com validação de CPF
│   │   ├── UserAvatar.tsx     # Monograma estilizado e avatar com foto
│   │   └── ...
│   ├── context/
│   │   └── AppContext.tsx     # Estado global com persistência e sincronização Firestore
│   ├── lib/
│   │   └── firebase.ts        # Inicialização do Firebase Auth e Firestore
│   ├── types.ts               # Tipagens TypeScript (User, Process, Hearing, Document)
│   ├── App.tsx                # Roteamento e orquestração de visualizações
│   └── index.css              # Estilização global com Tailwind CSS
├── firestore.rules            # Regras de segurança do banco de dados
└── package.json               # Dependências do projeto
```

---

## 4. Como Executar o Projeto

1. **Instalação de Dependências**:
   ```bash
   npm install
   ```

2. **Executar em Modo de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação será iniciada na porta `3000` (`http://localhost:3000`).

3. **Verificação de Tipos e Linting**:
   ```bash
   npm run lint
   ```

4. **Build para Produção**:
   ```bash
   npm run build
   ```

---

## 5. Regras de Negócio e Segurança
- **Hierarquia de Acesso (RBAC)**: Usuários criados pelo portal comum recebem estritamente o papel `role: 'client'`. O acesso administrativo (`role: 'admin'`) é protegido e restrito aos operadores do escritório.
- **Validação de CPF**: Todo cliente deve possuir um CPF válido de 11 dígitos, garantindo a rastreabilidade e a vinculação automática dos processos trabalhistas.
- **Persistência Híbrida**: O sistema utiliza o Firebase Firestore com fallback resiliente para armazenamento local, assegurando que o portal funcione perfeitamente com ou sem conexão ativa com a nuvem.
