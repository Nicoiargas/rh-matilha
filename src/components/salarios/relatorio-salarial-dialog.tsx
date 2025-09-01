"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, TrendingUp, Download, FileText, Users, DollarSign } from "lucide-react";

interface RelatorioSalarialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FuncionarioSalario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  salario: number;
  dataAdmissao: string;
}

export function RelatorioSalarialDialog({
  open,
  onOpenChange,
}: RelatorioSalarialDialogProps) {
  const [funcionarios, setFuncionarios] = useState<FuncionarioSalario[]>([]);
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("todos");
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

  const funcionariosFiltrados = filtroDepartamento === "todos" 
    ? funcionarios 
    : funcionarios.filter(f => f.departamento === filtroDepartamento);

  const departamentos = [...new Set(funcionarios.map(f => f.departamento))];

  const estatisticas = {
    totalFuncionarios: funcionariosFiltrados.length,
    salarioMedio: funcionariosFiltrados.length > 0 
      ? funcionariosFiltrados.reduce((acc, f) => acc + f.salario, 0) / funcionariosFiltrados.length 
      : 0,
    maiorSalario: funcionariosFiltrados.length > 0 
      ? Math.max(...funcionariosFiltrados.map(f => f.salario)) 
      : 0,
    menorSalario: funcionariosFiltrados.length > 0 
      ? Math.min(...funcionariosFiltrados.map(f => f.salario)) 
      : 0,
    totalFolha: funcionariosFiltrados.reduce((acc, f) => acc + f.salario, 0)
  };

  const handleExportar = () => {
    // Simular exportação
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  const handleClose = () => {
    setFiltroDepartamento("todos");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Relatório Salarial</span>
          </DialogTitle>
          <DialogDescription>
            Visualize e analise os dados salariais da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filtrar por Departamento:</label>
              <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Departamentos</SelectItem>
                  {departamentos.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportar} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

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
              {/* Estatísticas */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalFuncionarios}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {estatisticas.salarioMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maior Salário</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {estatisticas.maiorSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total da Folha</CardTitle>
                    <FileText className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {estatisticas.totalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Funcionários */}
              <Card>
                <CardHeader>
                  <CardTitle>Funcionários</CardTitle>
                  <CardDescription>
                    Lista detalhada dos funcionários {filtroDepartamento !== "todos" && `do departamento ${filtroDepartamento}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {funcionariosFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum funcionário encontrado para o filtro selecionado.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {funcionariosFiltrados.map((funcionario) => (
                        <div key={funcionario.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{funcionario.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {funcionario.cargo} • {funcionario.departamento}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Admitido em: {new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              R$ {funcionario.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {estatisticas.salarioMedio > 0 && funcionario.salario > estatisticas.salarioMedio ? 'Acima da média' : 'Abaixo da média'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
