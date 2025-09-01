"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign } from "lucide-react";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  salario: number;
}

interface AlteracaoSalarialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AlteracaoSalarialDialog({
  open,
  onOpenChange,
  onSuccess,
}: AlteracaoSalarialDialogProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string>("");
  const [tipoAumento, setTipoAumento] = useState<'valor' | 'percentual'>('valor');
  const [valorAumento, setValorAumento] = useState<string>("");
  const [percentualAumento, setPercentualAumento] = useState<string>("");
  const [novoSalario, setNovoSalario] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [aprovadoPor, setAprovadoPor] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar funcionários quando o modal abrir
  useEffect(() => {
    if (open) {
      fetchFuncionarios();
    }
  }, [open]);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios');
      if (!response.ok) {
        throw new Error('Erro ao buscar funcionários');
      }
      const data = await response.json();
      setFuncionarios(data.filter((f: any) => f.status === 'ATIVO'));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError('Erro ao carregar funcionários');
    }
  };

  // Calcular novo salário baseado no tipo de aumento
  const calcularNovoSalario = (salarioAtual: number, valor: string, tipo: 'valor' | 'percentual') => {
    if (!valor || isNaN(parseFloat(valor))) return salarioAtual;
    
    const valorNumerico = parseFloat(valor);
    
    if (tipo === 'valor') {
      return salarioAtual + valorNumerico;
    } else {
      return salarioAtual + (salarioAtual * valorNumerico / 100);
    }
  };

  // Atualizar campos quando valor ou percentual mudar
  const handleValorAumentoChange = (valor: string) => {
    setValorAumento(valor);
    const funcionario = funcionarios.find(f => f.id === selectedFuncionario);
    if (funcionario) {
      const novoSalarioCalculado = calcularNovoSalario(funcionario.salario, valor, 'valor');
      setNovoSalario(novoSalarioCalculado.toString());
      
      // Calcular percentual correspondente
      const percentual = funcionario.salario > 0 ? ((novoSalarioCalculado - funcionario.salario) / funcionario.salario) * 100 : 0;
      setPercentualAumento(percentual.toFixed(2));
    }
  };

  const handlePercentualAumentoChange = (percentual: string) => {
    setPercentualAumento(percentual);
    const funcionario = funcionarios.find(f => f.id === selectedFuncionario);
    if (funcionario) {
      const novoSalarioCalculado = calcularNovoSalario(funcionario.salario, percentual, 'percentual');
      setNovoSalario(novoSalarioCalculado.toString());
      
      // Calcular valor correspondente
      const valor = novoSalarioCalculado - funcionario.salario;
      setValorAumento(valor.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFuncionario || !motivo) {
      setError('Funcionário e motivo são obrigatórios');
      return;
    }

    if (!valorAumento && !percentualAumento) {
      setError('Informe o valor ou percentual do aumento');
      return;
    }

    const salario = parseFloat(novoSalario);
    if (isNaN(salario) || salario < 0) {
      setError('Salário deve ser um valor válido maior que zero');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/salarios/historico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funcionarioId: selectedFuncionario,
          novoSalario: salario,
          motivo: motivo,
          aprovadoPor: aprovadoPor || 'Sistema'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar alteração salarial');
      }

      // Limpar formulário
      setSelectedFuncionario("");
      setTipoAumento('valor');
      setValorAumento("");
      setPercentualAumento("");
      setNovoSalario("");
      setMotivo("");
      setAprovadoPor("");
      
      // Fechar modal e notificar sucesso
      onOpenChange(false);
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao criar alteração salarial:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFuncionario("");
      setTipoAumento('valor');
      setValorAumento("");
      setPercentualAumento("");
      setNovoSalario("");
      setMotivo("");
      setAprovadoPor("");
      setError(null);
      onOpenChange(false);
    }
  };

  const funcionarioSelecionado = funcionarios.find(f => f.id === selectedFuncionario);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Nova Alteração Salarial</span>
          </DialogTitle>
          <DialogDescription>
            Registre uma nova alteração salarial para um funcionário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário *</Label>
            <Select value={selectedFuncionario} onValueChange={setSelectedFuncionario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{funcionario.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {funcionario.cargo} • {funcionario.departamento}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {funcionarioSelecionado && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <span className="text-muted-foreground">Salário atual:</span>
                <div className="font-medium text-blue-900">
                  R$ {funcionarioSelecionado.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Aumento</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="valor"
                    checked={tipoAumento === 'valor'}
                    onChange={(e) => setTipoAumento(e.target.value as 'valor' | 'percentual')}
                    className="text-green-600"
                  />
                  <span className="text-sm">Valor (R$)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="percentual"
                    checked={tipoAumento === 'percentual'}
                    onChange={(e) => setTipoAumento(e.target.value as 'valor' | 'percentual')}
                    className="text-green-600"
                  />
                  <span className="text-sm">Percentual (%)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorAumento">Valor do Aumento (R$)</Label>
                <Input
                  id="valorAumento"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={valorAumento}
                  onChange={(e) => handleValorAumentoChange(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="percentualAumento">Percentual do Aumento (%)</Label>
                <Input
                  id="percentualAumento"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={percentualAumento}
                  onChange={(e) => handlePercentualAumentoChange(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novoSalario">Novo Salário (Calculado)</Label>
              <Input
                id="novoSalario"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={novoSalario}
                disabled={true}
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                Valor calculado automaticamente baseado no aumento informado
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Alteração *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo da alteração salarial..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aprovadoPor">Aprovado por</Label>
            <Input
              id="aprovadoPor"
              placeholder="Nome do responsável pela aprovação"
              value={aprovadoPor}
              onChange={(e) => setAprovadoPor(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alteração'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
