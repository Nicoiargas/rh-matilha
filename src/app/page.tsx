"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Monitor,
  ArrowRight
} from "lucide-react";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

interface DashboardStats {
  totalFuncionarios: number;
  funcionariosAtivos: number;
  funcionariosFerias: number;
  funcionariosLicenca: number;
  equipamentosEmUso: number;
  projetosAtivos: number;
  feriasPendentes: number;
  mediaSalarial: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect executado');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Iniciando fetch das estatísticas...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/dashboard/stats', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Fallback para dados mockados
      setStats({
        totalFuncionarios: 15,
        funcionariosAtivos: 12,
        funcionariosFerias: 2,
        funcionariosLicenca: 1,
        equipamentosEmUso: 8,
        projetosAtivos: 5,
        feriasPendentes: 3,
        mediaSalarial: 8500.00
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Carregando dados...
          </p>

        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Erro ao carregar dados
          </p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total de Funcionários",
      value: stats.totalFuncionarios.toString(),
      change: "+0%",
      changeType: "neutral" as const,
      icon: Users,
      description: "Total de colaboradores",
      href: "/funcionarios"
    },
    {
      title: "Funcionários Ativos",
      value: stats.funcionariosAtivos.toString(),
      change: "+0%",
      changeType: "positive" as const,
      icon: Users,
      description: "Em atividade",
      href: "/funcionarios"
    },
    {
      title: "Em Férias",
      value: stats.funcionariosFerias.toString(),
      change: "0",
      changeType: "neutral" as const,
      icon: Calendar,
      description: "Atualmente",
      href: "/ferias"
    },
    {
      title: "Salário Médio",
      value: stats.mediaSalarial > 0 ? `R$ ${stats.mediaSalarial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "R$ 0,00",
      change: "+0%",
      changeType: "neutral" as const,
      icon: DollarSign,
      description: "Média salarial",
      href: "/salarios"
    },
    {
      title: "Equipamentos",
      value: stats.equipamentosEmUso.toString(),
      change: "+0",
      changeType: "neutral" as const,
      icon: Monitor,
      description: "Em uso",
      href: "/equipamentos"
    }
  ];

  const getBadgeVariant = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "default";
      case "negative":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de recursos humanos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-50/50 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getBadgeVariant(stat.changeType)}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Departamento</CardTitle>
            <CardDescription>
              Funcionários distribuídos por área
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/funcionarios">
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Novo Funcionário</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </Link>
            <Link href="/ferias">
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Solicitar Férias</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </Link>
            <Link href="/salarios">
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <DollarSign className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium">Ajuste Salarial</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </Link>
            <Link href="/equipamentos">
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <Monitor className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Empréstimo Equipamento</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
