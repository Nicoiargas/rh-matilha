"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, Building2, MapPin, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Funcionario } from "@/types/rh";

interface FuncionarioDialogProps {
  onFuncionarioCreated?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  funcionario?: Funcionario | null;
  mode?: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FuncionarioDialog({ 
  onFuncionarioCreated, 
  onSuccess, 
  onCancel, 
  funcionario, 
  mode = 'create',
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: FuncionarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cnpj: '',
    emailPessoal: '',
    telefone: '',
    emailCorporativo: '',
    telefoneCorporativo: '',
    teams: '',
    cargo: '',
    departamento: '',
    salario: '',
    chavePix: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    dataAdmissao: '',
    status: 'ATIVO'
  });

  // Controlar abertura do diálogo
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setOpen;

  // Preencher formulário quando editar
  useEffect(() => {
    if (mode === 'edit' && funcionario) {
      setFormData({
        nome: funcionario.nome || '',
        cpf: funcionario.cpf || '',
        cnpj: funcionario.cnpj || '',
        emailPessoal: funcionario.emailPessoal || '',
        telefone: funcionario.telefone || '',
        emailCorporativo: funcionario.emailCorporativo || '',
        telefoneCorporativo: funcionario.telefoneCorporativo || '',
        teams: funcionario.teams || '',
        cargo: funcionario.cargo || '',
        departamento: funcionario.departamento || '',
        salario: funcionario.salario?.toString() || '',
        chavePix: funcionario.chavePix || '',
        rua: funcionario.endereco?.rua || '',
        numero: funcionario.endereco?.numero || '',
        complemento: funcionario.endereco?.complemento || '',
        bairro: funcionario.endereco?.bairro || '',
        cidade: funcionario.endereco?.cidade || '',
        estado: funcionario.endereco?.estado || '',
        cep: funcionario.endereco?.cep || '',
        dataAdmissao: funcionario.dataAdmissao ? new Date(funcionario.dataAdmissao).toISOString().split('T')[0] : '',
        status: funcionario.status || 'ATIVO'
      });
    }
  }, [mode, funcionario]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando o usuário começar a digitar
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    if (!formData.nome.trim()) return 'Nome é obrigatório';
    if (!formData.cpf.trim()) return 'CPF é obrigatório';
    if (!formData.emailCorporativo.trim()) return 'Email corporativo é obrigatório';
    if (!formData.telefone.trim()) return 'Telefone é obrigatório';
    if (!formData.cargo.trim()) return 'Cargo é obrigatório';
    if (!formData.departamento.trim()) return 'Departamento é obrigatório';
    if (!formData.salario.trim()) return 'Salário é obrigatório';
    if (!formData.rua.trim()) return 'Rua é obrigatória';
    if (!formData.numero.trim()) return 'Número é obrigatório';
    if (!formData.bairro.trim()) return 'Bairro é obrigatório';
    if (!formData.cidade.trim()) return 'Cidade é obrigatória';
    if (!formData.estado.trim()) return 'Estado é obrigatório';
    if (!formData.cep.trim()) return 'CEP é obrigatório';
    if (!formData.dataAdmissao.trim()) return 'Data de admissão é obrigatória';

    // Validar salário
    const salario = parseFloat(formData.salario);
    if (isNaN(salario) || salario <= 0) {
      return 'Salário deve ser um valor válido maior que zero';
    }

    // Validar CPF (formato básico)
    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailCorporativo)) {
      return 'Email corporativo deve ser válido';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = mode === 'edit' && funcionario 
        ? `/api/funcionarios/${funcionario.id}` 
        : '/api/funcionarios';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salario: parseFloat(formData.salario),
          endereco: {
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento || null,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            cep: formData.cep
          }
        }),
      });

      if (response.ok) {
        const funcionario = await response.json();
        console.log(mode === 'edit' ? 'Funcionário atualizado:' : 'Funcionário criado:', funcionario);
        
        // Limpar formulário se for criação
        if (mode === 'create') {
          setFormData({
            nome: '', cpf: '', cnpj: '', emailPessoal: '', telefone: '', emailCorporativo: '',
            telefoneCorporativo: '', teams: '', cargo: '', departamento: '', salario: '',
            chavePix: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
            dataAdmissao: '', status: 'ATIVO'
          });
        }
        
        // Fechar diálogo
        setIsOpen(false);
        
        // Notificar componente pai
        if (mode === 'create' && onFuncionarioCreated) {
          onFuncionarioCreated();
        } else if (mode === 'edit' && onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} funcionário`);
      }
    } catch (error) {
      console.error(`Erro ao ${mode === 'edit' ? 'atualizar' : 'criar'} funcionário:`, error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsOpen(false);
    }
  };

  const formatCPF = (value: string) => {
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Se for modo controlado e não estiver aberto, não renderizar
  if (isControlled && !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {mode === 'create' && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Atualize as informações do funcionário'
              : 'Preencha todas as informações necessárias para cadastrar o funcionário'
            }
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input 
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input 
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailCorporativo">Email Corporativo *</Label>
                <Input 
                  id="emailCorporativo"
                  type="email"
                  value={formData.emailCorporativo}
                  onChange={(e) => handleInputChange('emailCorporativo', e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailPessoal">Email Pessoal</Label>
                <Input 
                  id="emailPessoal"
                  type="email"
                  value={formData.emailPessoal}
                  onChange={(e) => handleInputChange('emailPessoal', e.target.value)}
                  placeholder="email@gmail.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input 
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefoneCorporativo">Telefone Corporativo</Label>
                <Input 
                  id="telefoneCorporativo"
                  value={formData.telefoneCorporativo}
                  onChange={(e) => handleInputChange('telefoneCorporativo', e.target.value)}
                  placeholder="(11) 3333-0000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teams">Teams</Label>
                <Input 
                  id="teams"
                  value={formData.teams}
                  onChange={(e) => handleInputChange('teams', e.target.value)}
                  placeholder="usuario@empresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                <Input 
                  id="dataAdmissao"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" />
              <span>Informações Profissionais</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input 
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  placeholder="Desenvolvedor Full Stack"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input 
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  placeholder="Desenvolvimento"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salario">Salário *</Label>
                <Input 
                  id="salario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salario}
                  onChange={(e) => handleInputChange('salario', e.target.value)}
                  placeholder="5000.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input 
                  id="chavePix"
                  value={formData.chavePix}
                  onChange={(e) => handleInputChange('chavePix', e.target.value)}
                  placeholder="CPF, email, telefone ou chave aleatória"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="FERIAS">Férias</SelectItem>
                    <SelectItem value="LICENCA">Licença</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" />
              <span>Endereço</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input 
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rua">Rua *</Label>
                <Input 
                  id="rua"
                  value={formData.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input 
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input 
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  placeholder="Apto 1001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input 
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input 
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input 
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'edit' ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                mode === 'edit' ? 'Atualizar Funcionário' : 'Criar Funcionário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
