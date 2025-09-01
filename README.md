# RH Matilha - Sistema de Gerenciamento de Recursos Humanos


Sistema completo de gerenciamento de recursos humanos desenvolvido para a empresa Matilha, com banco de dados local SQLite e interface moderna.

## 🚀 **Funcionalidades Principais**

### 👥 **Gestão de Funcionários**
- ✅ Cadastro completo com dados pessoais e corporativos
- ✅ Endereço completo (rua, número, complemento, bairro, cidade, estado, CEP)
- ✅ Controle de status (Ativo, Inativo, Férias, Licença)
- ✅ Histórico de alterações salariais
- ✅ Gestão de contratos (CLT, PJ, Estágio, Trainee)

### 🏢 **Gestão Empresarial**
- ✅ Dados da empresa (CNPJ, razão social, nome fantasia)
- ✅ Endereço corporativo
- ✅ Responsável pelo RH

### 📊 **Dashboard Inteligente**
- ✅ Estatísticas em tempo real
- ✅ Distribuição por departamento
- ✅ Contadores de funcionários ativos, em férias, licença
- ✅ Controle de equipamentos em uso
- ✅ Projetos ativos

### 🎁 **Benefícios e Equipamentos**
- ✅ Controle de benefícios (plano de saúde, vale refeição, etc.)
- ✅ Gestão de equipamentos emprestados
- ✅ Status de equipamentos (em uso, devolvido, danificado)

### 📅 **Controle de Férias**
- ✅ Solicitações de férias
- ✅ Aprovação e controle de status
- ✅ Cálculo de dias disponíveis

### 📈 **Projetos e Atividades**
- ✅ Controle de projetos ativos
- ✅ Alocação de funcionários em projetos
- ✅ Histórico de participação

## 🛠️ **Tecnologias Utilizadas**

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: CSS-based custom charts
- **Database**: SQLite com Prisma ORM
- **Date Handling**: date-fns
- **Forms**: React Hook Form, Zod

## 📦 **Instalação e Configuração**

### 1. **Pré-requisitos**
```bash
Node.js 18+ 
npm ou yarn
```

### 2. **Clone e Instalação**
```bash
git clone <repository-url>
cd rh-matilha
npm install
```

### 3. **Configuração do Banco de Dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Criar banco e aplicar schema
npm run db:push

# Executar seed inicial (cria empresa padrão)
npm run seed
```

### 4. **Iniciar Sistema**
```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:3000**

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais**
- **`funcionarios`** - Dados dos colaboradores
- **`enderecos`** - Endereços dos funcionários
- **`beneficios`** - Benefícios oferecidos
- **`equipamentos`** - Equipamentos emprestados
- **`projetos`** - Projetos da empresa
- **`ferias`** - Controle de férias
- **`alteracoes_salariais`** - Histórico salarial
- **`contratos`** - Contratos dos funcionários
- **`empresas`** - Dados da empresa

### **Relacionamentos**
- Funcionário → Endereço (1:1)
- Funcionário → Benefícios (1:N)
- Funcionário → Equipamentos (1:N)
- Funcionário → Projetos (N:N via tabela intermediária)
- Funcionário → Férias (1:N)
- Funcionário → Alterações Salariais (1:N)
- Funcionário → Contratos (1:N)

## 🎯 **Como Usar o Sistema**

### **1. Primeiro Acesso**
- Acesse http://localhost:3000
- O sistema já vem com dados iniciais da empresa "Matilha Tecnologia Ltda"
- Dashboard mostrará estatísticas zeradas (sem funcionários ainda)

### **2. Cadastrar Funcionários**
- Vá para a página "Funcionários"
- Clique em "Novo Funcionário"
- Preencha todos os campos obrigatórios (*)
- Salve o funcionário

### **3. Visualizar Dados**
- Dashboard atualiza automaticamente com estatísticas reais
- Gráfico de departamentos mostra distribuição real
- Tabela de funcionários lista todos os cadastrados

### **4. Gerenciar Outros Aspectos**
- **Férias**: Controle de solicitações e aprovações
- **Equipamentos**: Empréstimo e devolução
- **Benefícios**: Cadastro e controle de ativos
- **Projetos**: Criação e alocação de funcionários

## 🔧 **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Iniciar servidor de produção

# Banco de Dados
npm run db:generate      # Gerar cliente Prisma
npm run db:push          # Aplicar mudanças no banco
npm run db:studio        # Abrir interface visual do banco
npm run seed             # Executar seed inicial

# Linting
npm run lint             # Verificar código
```

## 📱 **Responsividade**

O sistema é totalmente responsivo e funciona em:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (até 767px)

## 🚀 **Deploy**

### **Local/Desenvolvimento**
```bash
npm run build
npm run start
```

### **Produção**
- Configure variáveis de ambiente
- Use banco PostgreSQL ou MySQL para produção
- Configure Prisma para ambiente de produção

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 **Suporte**

Para suporte técnico ou dúvidas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

## 🗺️ **Roadmap**

### **Versão 1.1** (Próxima)
- [ ] Sistema de autenticação e autorização
- [ ] Relatórios em PDF
- [ ] Importação em lote via Excel
- [ ] Notificações por email

### **Versão 1.2**
- [ ] App mobile
- [ ] Integração com sistemas externos
- [ ] Dashboard avançado com métricas
- [ ] Backup automático do banco

### **Versão 2.0**
- [ ] IA para análise de dados
- [ ] Previsão de turnover
- [ ] Otimização de recursos
- [ ] Integração com folha de pagamento

---

**Desenvolvido com ❤️ pela equipe Matilha**
