# 🚀 Guia de Deploy no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Conta no SendGrid**: [sendgrid.com](https://sendgrid.com)
3. **Repositório no GitHub**: Para conectar com o Vercel

## 🔧 Configuração do SendGrid

### 1. Criar Conta no SendGrid
- Acesse [sendgrid.com](https://sendgrid.com)
- Crie uma conta gratuita (100 e-mails/dia)
- Verifique seu e-mail

### 2. Obter API Key
1. No SendGrid, vá em **Settings** → **API Keys**
2. Clique em **Create API Key**
3. Nome: `Email Dispatcher`
4. Permissões: **Mail Send** → **Full Access**
5. Copie a API Key gerada

### 3. Verificar E-mail Remetente
1. No SendGrid, vá em **Settings** → **Sender Authentication**
2. Clique em **Single Sender Verification**
3. Adicione o e-mail que será usado como remetente
4. Confirme o e-mail recebido

## 🌐 Deploy no Vercel

### 1. Preparar o Repositório
```bash
# Inicializar Git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit"

# Conectar com GitHub
# 1. Crie um repositório no GitHub
# 2. Conecte o repositório local
git remote add origin https://github.com/seu-usuario/email-dispatcher.git
git push -u origin main
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **New Project**
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente:

#### Variáveis de Ambiente no Vercel:
```
SENDGRID_API_KEY = sua_api_key_do_sendgrid
NEXT_PUBLIC_APP_URL = https://seu-projeto.vercel.app
```

### 3. Configurações do Projeto
- **Framework Preset**: Next.js
- **Root Directory**: `./` (padrão)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install`

## 🔐 Configuração de Segurança

### 1. Variáveis de Ambiente
No painel do Vercel, adicione:
- `SENDGRID_API_KEY`: Sua chave do SendGrid
- `NEXT_PUBLIC_APP_URL`: URL da sua aplicação

### 2. Domínio Personalizado (Opcional)
1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

## 📊 Monitoramento

### 1. Logs de Deploy
- Acesse o painel do Vercel
- Vá em **Functions** para ver logs das APIs

### 2. Analytics
- Vercel Analytics incluído
- Monitoramento de performance automático

## 🔄 Deploy Automático

Após a configuração inicial:
1. **Push para GitHub** = Deploy automático
2. **Pull Request** = Preview automático
3. **Merge para main** = Deploy em produção

## 🛠️ Comandos Úteis

### Deploy Local (Teste)
```bash
npm run build
npm run start
```

### Verificar Build
```bash
npm run build
```

### Instalar Vercel CLI (Opcional)
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🚨 Troubleshooting

### Erro de API Key
- Verifique se a API Key está correta
- Confirme se o e-mail remetente está verificado no SendGrid

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente para testar

### E-mails não enviando
- Verifique os logs no Vercel Functions
- Confirme se o SendGrid está configurado corretamente

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **SendGrid Docs**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## ✅ Checklist de Deploy

- [ ] Conta no Vercel criada
- [ ] Conta no SendGrid criada
- [ ] API Key do SendGrid obtida
- [ ] E-mail remetente verificado no SendGrid
- [ ] Repositório no GitHub criado
- [ ] Código enviado para o GitHub
- [ ] Projeto conectado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Teste de envio de e-mail funcionando

🎉 **Parabéns! Seu sistema está online!**
