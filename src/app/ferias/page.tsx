"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { FeriasDialog } from "@/components/ferias/ferias-dialog";
import { StatusChangeDialog } from "@/components/ferias/status-change-dialog";
import { FeriasChart } from "@/components/ferias/ferias-chart";
import Link from "next/link";

interface FeriasStats {
  totalFuncionarios: number;
  feriasPendentes: number;
  feriasAprovadas: number;
  feriasRejeitadas: number;
  funcionariosComFeriasEmHaver: number;
}

export default function FeriasPage() {
  const [stats, setStats] = useState<FeriasStats>({
    totalFuncionarios: 0,
    feriasPendentes: 0,
    feriasAprovadas: 0,
    feriasRejeitadas: 0,
    funcionariosComFeriasEmHaver: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const feriasResponse = await fetch('/api/ferias');
      const funcionariosResponse = await fetch('/api/funcionarios');

      if (!feriasResponse.ok || !funcionariosResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const feriasData = await feriasResponse.json();
      const funcionarios = await funcionariosResponse.json();

      // Calcular estatísticas
      const totalFuncionarios = funcionarios.length;
      const feriasPendentes = feriasData.filter((f: any) => f.status === 'PENDENTE').length;
      const feriasAprovadas = feriasData.filter((f: any) => f.status === 'APROVADA').length;
      const feriasRejeitadas = feriasData.filter((f: any) => f.status === 'REJEITADA').length;
      
      // Calcular funcionários com férias em haver (têm direito mas não programaram)
      const funcionariosComFerias = new Set(feriasData.map((f: any) => f.funcionarioId));
      const funcionariosComFeriasEmHaver = funcionarios.filter((f: any) => {
        // Verificar se o funcionário tem pelo menos 1 ano de trabalho
        const dataAdmissao = new Date(f.dataAdmissao);
        const hoje = new Date();
        const anosTrabalhados = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        
        // Tem direito se trabalhou 1+ anos E não tem férias programadas
        return anosTrabalhados >= 1 && !funcionariosComFerias.has(f.id);
      }).length;

      setStats({
        totalFuncionarios,
        feriasPendentes,
        feriasAprovadas,
        feriasRejeitadas,
        funcionariosComFeriasEmHaver
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de férias:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleNovaSolicitacao = () => {
    setIsDialogOpen(true);
  };

  const handleSolicitacaoSuccess = () => {
    setIsDialogOpen(false);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Férias</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Férias</h1>
            <p className="text-muted-foreground">
              Erro ao carregar dados
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
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Férias</h1>
          <p className="text-muted-foreground">
            Gerencie solicitações e aprovações de férias
          </p>
        </div>
        <Button onClick={handleNovaSolicitacao}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/ferias/pendentes">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Férias Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.feriasPendentes || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/ferias/aprovadas">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Férias Aprovadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.feriasAprovadas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Para este ano
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/ferias/recusadas">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Férias Rejeitadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.feriasRejeitadas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/ferias/em-haver">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Férias em Haver</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.funcionariosComFeriasEmHaver || 0}</div>
              <p className="text-xs text-muted-foreground">
                Com direito mas sem programar
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Gráfico de Distribuição de Férias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Análise de Distribuição de Férias</span>
          </CardTitle>
          <CardDescription>
            Visualize a distribuição de férias aprovadas nos próximos 12 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeriasChart />
        </CardContent>
      </Card>

      {/* Modal de Nova Solicitação */}
      <FeriasDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSolicitacaoSuccess}
      />
    </div>
  );
}
