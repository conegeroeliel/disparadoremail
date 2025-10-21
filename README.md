# 📧 Email Dispatcher

Uma plataforma moderna e elegante para disparo de e-mails HTML usando SendGrid, inspirada nas melhores práticas de design de interfaces como Mailchimp e SendGrid Dashboard.

## ✨ Características

- **Editor HTML Avançado**: Editor com preview ao vivo e templates prontos
- **Interface Moderna**: Design limpo e profissional com gradientes azul/roxo
- **Upload de Listas**: Carregue listas de e-mails via arquivo .txt ou .csv
- **Preview em Tempo Real**: Visualize o e-mail antes de enviar
- **Integração SendGrid**: Envio confiável via API SendGrid
- **Responsivo**: Interface adaptável para desktop e mobile
- **Animações Suaves**: Transições elegantes e efeitos hover

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Backend**: Next.js API Routes
- **E-mail**: SendGrid API
- **Estado**: React Hooks, Zustand
- **Validação**: Zod
- **Ícones**: Lucide React

## 🛠️ Instalação Local

1. **Clone o repositório**
```bash
git clone <repository-url>
cd email-dispatcher
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
SENDGRID_API_KEY=sua_chave_api_sendgrid
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Execute o projeto**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🚀 Deploy em Produção (Vercel)

### Deploy Automático
1. **Conecte com GitHub**: Faça push do código para um repositório
2. **Conecte com Vercel**: [vercel.com](https://vercel.com) → New Project
3. **Configure variáveis**: Adicione `SENDGRID_API_KEY` no painel do Vercel
4. **Deploy**: Automático a cada push!

### Configuração Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel login
vercel --prod
```

📖 **Guia completo**: Veja [DEPLOY.md](./DEPLOY.md) para instruções detalhadas.

## 📋 Configuração do SendGrid

1. **Crie uma conta no SendGrid**
   - Acesse [sendgrid.com](https://sendgrid.com)
   - Crie uma conta gratuita

2. **Obtenha sua API Key**
   - Vá para Settings > API Keys
   - Crie uma nova API Key com permissões de "Mail Send"
   - Copie a chave e adicione no arquivo `.env.local`

3. **Configure o domínio (opcional)**
   - Para produção, configure um domínio verificado
   - Para desenvolvimento, use o e-mail de teste do SendGrid

## 🎨 Interface

### Layout Principal
- **Header**: Logo, navegação e configurações
- **Editor**: Área de criação de HTML com preview
- **Formulário**: Configuração de envio e destinatários

### Funcionalidades

#### Editor de E-mail
- **Modo Editor**: Código HTML com syntax highlighting
- **Modo Preview**: Visualização em tempo real
- **Templates**: Templates prontos para começar
- **Download**: Exportar HTML como arquivo

#### Configuração de Envio
- **Remetente**: Nome e e-mail do remetente
- **Assunto**: Título do e-mail
- **Destinatários**: 
  - Adição individual de e-mails
  - Upload de arquivo (.txt, .csv)
  - Lista visual com opção de remoção
- **Envio**: Botão com contador de destinatários

## 📁 Estrutura do Projeto

```
email-dispatcher/
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── email-editor.tsx
│   ├── email-form.tsx
│   └── header.tsx
├── hooks/
│   └── use-toast.ts
├── lib/
│   └── utils.ts
└── README.md
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linting
```

### Estrutura de Componentes

- **Header**: Navegação principal
- **EmailEditor**: Editor HTML com preview
- **EmailForm**: Formulário de configuração
- **UI Components**: Componentes base do Shadcn UI

### API Endpoints

- `POST /api/send-email`: Envio de e-mails via SendGrid

## 🎯 Funcionalidades Futuras

- [ ] Templates de e-mail pré-definidos
- [ ] Agendamento de envios
- [ ] Relatórios de entrega
- [ ] Segmentação de listas
- [ ] A/B Testing
- [ ] Analytics de abertura
- [ ] Integração com CRM

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.






