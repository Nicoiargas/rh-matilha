"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";
import { FuncionarioDialog } from "@/components/funcionarios/funcionario-dialog";

interface FuncionarioStats {
  total: number;
  ativos: number;
  novos: number;
  inativos: number;
}

export default function FuncionariosPage() {
  const [stats, setStats] = useState<FuncionarioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout para evitar espera infinita
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const fetchPromise = fetch('/api/dashboard/stats');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats({
        total: data.totalFuncionarios || 0,
        ativos: data.funcionariosAtivos || 0,
        novos: 0, // Será calculado quando implementarmos histórico
        inativos: (data.totalFuncionarios || 0) - (data.funcionariosAtivos || 0) - (data.funcionariosFerias || 0) - (data.funcariosLicenca || 0)
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: usar dados padrão se houver erro
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchStats(), 2000); // Tentar novamente em 2 segundos
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFuncionarioCreated = () => {
    // Recarregar estatísticas quando um novo funcionário for criado
    fetchStats();
  };

  const handleFuncionarioUpdated = () => {
    // Recarregar estatísticas quando um funcionário for atualizado
    fetchStats();
  };

  // Fallback para dados padrão se houver erro
  const getFallbackStats = (): FuncionarioStats => ({
    total: 0,
    ativos: 0,
    novos: 0,
    inativos: 0
  });

  const currentStats = stats || getFallbackStats();

  if (loading && retryCount === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
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

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Erro ao carregar estatísticas
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 font-medium">Erro ao carregar dados</span>
          </div>
          <p className="text-red-700 mt-2 mb-4">
            {error}
          </p>
          <div className="flex space-x-2">
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button onClick={() => setError(null)} variant="outline">
              Continuar sem estatísticas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os funcionários da empresa
          </p>
        </div>
        <FuncionarioDialog onFuncionarioCreated={handleFuncionarioCreated} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total de colaboradores
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStats.ativos}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.total > 0 ? `${((currentStats.ativos / currentStats.total) * 100).toFixed(1)}% da força de trabalho` : '0% da força de trabalho'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentStats.novos}</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentStats.inativos}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.total > 0 ? `${((currentStats.inativos / currentStats.total) * 100).toFixed(1)}% da força de trabalho` : '0% da força de trabalho'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funcionários Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os funcionários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FuncionariosTable onFuncionarioUpdated={handleFuncionarioUpdated} />
        </CardContent>
      </Card>
    </div>
  );
}
