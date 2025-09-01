"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Calculator
} from "lucide-react";
import { AlteracaoSalarialDialog } from "@/components/salarios/alteracao-salarial-dialog";
import { RelatorioSalarialDialog } from "@/components/salarios/relatorio-salarial-dialog";
import { ProjecoesSalarialDialog } from "@/components/salarios/projecoes-salarial-dialog";

interface SalarioStats {
  totalFuncionarios: number;
  salarioMedio: number;
  maiorSalario: number;
  menorSalario: number;
  totalFolha: number;
  funcionariosComSalario: number;
}

interface AlteracaoSalarial {
  id: string;
  funcionarioId: string;
  salarioAnterior: number;
  novoSalario: number;
  motivo: string;
  dataAlteracao: string;
  aprovadoPor: string;
  funcionario: {
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
  };
}

export default function SalariosPage() {
  const [stats, setStats] = useState<SalarioStats | null>(null);
  const [historico, setHistorico] = useState<AlteracaoSalarial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlteracaoDialog, setShowAlteracaoDialog] = useState(false);
  const [showRelatorioDialog, setShowRelatorioDialog] = useState(false);
  const [showProjecoesDialog, setShowProjecoesDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar estatísticas e histórico em paralelo
      const [statsResponse, historicoResponse] = await Promise.all([
        fetch('/api/salarios/stats'),
        fetch('/api/salarios/historico')
      ]);

      if (!statsResponse.ok || !historicoResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const [statsData, historicoData] = await Promise.all([
        statsResponse.json(),
        historicoResponse.json()
      ]);

      setStats(statsData);
      setHistorico(historicoData);
    } catch (error) {
      console.error('Erro ao buscar dados de salários:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Salários</h1>
            <p className="text-muted-foreground">
              Carregando dados...
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Salários</h1>
            <p className="text-muted-foreground">
              Erro ao carregar dados
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex items-center">
            <div className="h-5 w-5 text-red-400 mr-2">⚠️</div>
            <span className="text-red-800 font-medium">Erro ao carregar dados</span>
          </div>
          <p className="text-red-700 mt-2 mb-4">
            {error}
          </p>
          <Button onClick={fetchData} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Salários</h1>
          <p className="text-muted-foreground">
            Controle salarial e histórico de alterações
          </p>
        </div>
        <Button onClick={() => setShowAlteracaoDialog(true)}>
          <Calculator className="mr-2 h-4 w-4" />
          Nova Alteração Salarial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFuncionarios || 0}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salário Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.salarioMedio ? `R$ ${stats.salarioMedio.toLocaleString('pt-BR')}` : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Média salarial da empresa
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Salário</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.maiorSalario ? `R$ ${stats.maiorSalario.toLocaleString('pt-BR')}` : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Salário mais alto
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menor Salário</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.menorSalario ? `R$ ${stats.menorSalario.toLocaleString('pt-BR')}` : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Salário mais baixo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Folha</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.totalFolha ? `R$ ${stats.totalFolha.toLocaleString('pt-BR')}` : 'R$ 0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Custo total mensal
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Alterações Salariais Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações Salariais</CardTitle>
          <CardDescription>
            Todas as mudanças salariais registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma alteração salarial registrada
              </h3>
              <p className="text-muted-foreground">
                As alterações salariais aparecerão aqui quando forem cadastradas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((alteracao) => {
                const diferenca = alteracao.novoSalario - alteracao.salarioAnterior;
                const percentual = alteracao.salarioAnterior > 0 
                  ? ((diferenca / alteracao.salarioAnterior) * 100).toFixed(1)
                  : '0.0';
                const isAumento = diferenca > 0;

                return (
                  <div key={alteracao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{alteracao.funcionario.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alteracao.funcionario.cargo} • {alteracao.funcionario.departamento}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isAumento ? 'text-green-600' : 'text-red-600'}`}>
                          {isAumento ? '+' : ''}R$ {diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isAumento ? '+' : ''}{percentual}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Salário anterior:</span>
                        <div className="font-medium">R$ {alteracao.salarioAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Novo salário:</span>
                        <div className="font-medium">R$ {alteracao.novoSalario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">Motivo:</span>
                          <div className="font-medium">{alteracao.motivo}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground">Data:</span>
                          <div className="font-medium">
                            {new Date(alteracao.dataAlteracao).toLocaleDateString('pt-BR')}
                          </div>
                          <span className="text-muted-foreground">Aprovado por:</span>
                          <div className="font-medium">{alteracao.aprovadoPor}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setShowAlteracaoDialog(true)}
            >
              <Calculator className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Nova Alteração</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setShowRelatorioDialog(true)}
            >
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Relatório Salarial</span>
            </div>
            <div 
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setShowProjecoesDialog(true)}
            >
              <DollarSign className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium">Projeções</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <AlteracaoSalarialDialog
        open={showAlteracaoDialog}
        onOpenChange={setShowAlteracaoDialog}
        onSuccess={() => {
          console.log('Alteração salarial criada com sucesso!');
          fetchData(); // Recarregar dados
        }}
      />

      <RelatorioSalarialDialog
        open={showRelatorioDialog}
        onOpenChange={setShowRelatorioDialog}
      />

      <ProjecoesSalarialDialog
        open={showProjecoesDialog}
        onOpenChange={setShowProjecoesDialog}
      />
    </div>
  );
}
