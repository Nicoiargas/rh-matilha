# 🚀 **INSTRUÇÕES RÁPIDAS - RH Matilha**

## ✅ **Sistema Pronto e Funcionando!**

O sistema está rodando em **http://localhost:3000** com:
- ✅ Banco de dados SQLite configurado
- ✅ Dados iniciais da empresa "Matilha" criados
- ✅ APIs funcionando
- ✅ Interface responsiva
- ✅ Sem dados mockados

## 🎯 **PRIMEIROS PASSOS**

### 1. **Acesse o Sistema**
```
http://localhost:3000
```

### 2. **Dashboard Inicial**
- Mostrará estatísticas zeradas (normal, sem funcionários ainda)
- Empresa "Matilha Tecnologia Ltda" já cadastrada

### 3. **Cadastre Seu Primeiro Funcionário**
- Vá para **"Funcionários"** no menu lateral
- Clique em **"Novo Funcionário"**
- Preencha os campos obrigatórios (*)
- Salve

### 4. **Veja os Dados Atualizados**
- Dashboard mostrará estatísticas reais
- Gráfico de departamentos funcionará
- Tabela listará funcionários cadastrados

## 🗄️ **BANCO DE DADOS**

### **Localização**
```
prisma/dev.db
```

### **Visualizar Dados**
```bash
npm run db:studio
```
Abrirá interface web em http://localhost:5555

### **Comandos Úteis**
```bash
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar mudanças
npm run seed           # Recriar dados iniciais
```

## 📱 **FUNCIONALIDADES DISPONÍVEIS**

### **✅ Funcionando**
- Dashboard com estatísticas reais
- Cadastro completo de funcionários
- Gestão de endereços
- Controle de status
- Tabela de funcionários
- Gráficos de departamento

### **🔄 Próximas Implementações**
- Gestão de férias
- Controle de equipamentos
- Benefícios
- Projetos
- Contratos
- Alterações salariais

## 🛠️ **TROUBLESHOOTING**

### **Erro 404 nas APIs**
- Verifique se o servidor está rodando
- Confirme se o banco foi criado (`prisma/dev.db`)

### **Dados não aparecem**
- Execute `npm run seed` para recriar dados iniciais
- Verifique console do navegador para erros

### **Servidor não inicia**
```bash
rm -rf .next
npm install
npm run dev
```

## 📊 **ESTRUTURA DOS DADOS**

### **Funcionário Completo**
- Dados pessoais (CPF, nome, telefone)
- Dados corporativos (email, cargo, departamento)
- Endereço completo
- Salário e status
- Observações

### **Relacionamentos**
- 1 funcionário = 1 endereço
- 1 funcionário = N benefícios
- 1 funcionário = N equipamentos
- 1 funcionário = N projetos

## 🎨 **PERSONALIZAÇÃO**

### **Cores e Tema**
- Edite `src/app/globals.css`
- Modifique variáveis CSS

### **Departamentos**
- Edite `src/components/funcionarios/funcionario-dialog.tsx`
- Adicione/remova opções no Select

### **Campos do Formulário**
- Modifique `src/components/funcionarios/funcionario-dialog.tsx`
- Ajuste validações e campos obrigatórios

## 🚀 **PRÓXIMOS PASSOS RECOMENDADOS**

1. **Cadastre 3-5 funcionários** para testar o sistema
2. **Teste diferentes departamentos** para ver o gráfico funcionar
3. **Implemente gestão de férias** (próxima funcionalidade)
4. **Adicione controle de equipamentos**
5. **Configure benefícios padrão**

## 📞 **SUPORTE**

- **Console do navegador**: F12 → Console
- **Logs do servidor**: Terminal onde rodou `npm run dev`
- **Banco de dados**: `npm run db:studio`

---

**🎉 Sistema funcionando perfeitamente! Comece cadastrando seus funcionários!**
