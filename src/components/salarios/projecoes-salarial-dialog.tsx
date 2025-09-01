"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2, DollarSign, TrendingUp, Calculator, Target } from "lucide-react";

interface ProjecoesSalarialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  salario: number;
}

interface Projecao {
  funcionario: Funcionario;
  salarioAtual: number;
  salarioProjetado: number;
  diferenca: number;
  percentualAumento: number;
}

export function ProjecoesSalarialDialog({
  open,
  onOpenChange,
}: ProjecoesSalarialDialogProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [tipoProjecao, setTipoProjecao] = useState<'percentual' | 'valor'>('percentual');
  const [valorProjecao, setValorProjecao] = useState<string>("");
  const [projecoes, setProjecoes] = useState<Projecao[]>([]);
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
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/funcionarios');
      if (!response.ok) {
        throw new Error('Erro ao buscar funcionários');
      }
      const data = await response.json();
      setFuncionarios(data.filter((f: any) => f.status === 'ATIVO'));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const calcularProjecoes = () => {
    if (!valorProjecao || isNaN(parseFloat(valorProjecao))) {
      setProjecoes([]);
      return;
    }

    const valor = parseFloat(valorProjecao);
    const novasProjecoes: Projecao[] = funcionarios.map(funcionario => {
      let salarioProjetado: number;
      
      if (tipoProjecao === 'percentual') {
        salarioProjetado = funcionario.salario + (funcionario.salario * valor / 100);
      } else {
        salarioProjetado = funcionario.salario + valor;
      }

      const diferenca = salarioProjetado - funcionario.salario;
      const percentualAumento = funcionario.salario > 0 ? (diferenca / funcionario.salario) * 100 : 0;

      return {
        funcionario,
        salarioAtual: funcionario.salario,
        salarioProjetado,
        diferenca,
        percentualAumento
      };
    });

    setProjecoes(novasProjecoes);
  };

  useEffect(() => {
    calcularProjecoes();
  }, [valorProjecao, tipoProjecao, funcionarios]);

  const estatisticas = {
    totalFuncionarios: projecoes.length,
    custoAtual: projecoes.reduce((acc, p) => acc + p.salarioAtual, 0),
    custoProjetado: projecoes.reduce((acc, p) => acc + p.salarioProjetado, 0),
    diferencaTotal: projecoes.reduce((acc, p) => acc + p.diferenca, 0),
    percentualMedio: projecoes.length > 0 
      ? projecoes.reduce((acc, p) => acc + p.percentualAumento, 0) / projecoes.length 
      : 0
  };

  const handleClose = () => {
    setTipoProjecao('percentual');
    setValorProjecao("");
    setProjecoes([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-yellow-600" />
            <span>Projeções Salariais</span>
          </DialogTitle>
          <DialogDescription>
            Simule aumentos salariais e visualize o impacto financeiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações da Projeção */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações da Projeção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Aumento</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="percentual"
                        checked={tipoProjecao === 'percentual'}
                        onChange={(e) => setTipoProjecao(e.target.value as 'percentual' | 'valor')}
                        className="text-yellow-600"
                      />
                      <span className="text-sm">Percentual (%)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="valor"
                        checked={tipoProjecao === 'valor'}
                        onChange={(e) => setTipoProjecao(e.target.value as 'percentual' | 'valor')}
                        className="text-yellow-600"
                      />
                      <span className="text-sm">Valor (R$)</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorProjecao">
                    {tipoProjecao === 'percentual' ? 'Percentual de Aumento (%)' : 'Valor do Aumento (R$)'}
                  </Label>
                  <Input
                    id="valorProjecao"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={tipoProjecao === 'percentual' ? "10.00" : "1000.00"}
                    value={valorProjecao}
                    onChange={(e) => setValorProjecao(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <>
              {/* Estatísticas da Projeção */}
              {projecoes.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{estatisticas.totalFuncionarios}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Custo Atual</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {estatisticas.custoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Custo Projetado</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {estatisticas.custoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Diferença Total</CardTitle>
                      <Target className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        +R$ {estatisticas.diferencaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Lista de Projeções */}
              {projecoes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Projeções por Funcionário</CardTitle>
                    <CardDescription>
                      Impacto do aumento para cada funcionário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projecoes.map((projecao) => (
                        <div key={projecao.funcionario.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{projecao.funcionario.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {projecao.funcionario.cargo} • {projecao.funcionario.departamento}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Atual: </span>
                              <span>R$ {projecao.salarioAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Projetado: </span>
                              <span className="font-medium">R$ {projecao.salarioProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              +R$ {projecao.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({projecao.percentualAumento.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {projecoes.length === 0 && valorProjecao && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Informe um valor válido para ver as projeções.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
