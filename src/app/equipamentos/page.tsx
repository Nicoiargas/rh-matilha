"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Monitor, 
  CheckCircle, 
  UserCheck,
  AlertTriangle,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Users,
  Laptop,
  Headphones,
  Mouse,
  Keyboard
} from "lucide-react";
import { EquipamentoDialog } from "@/components/equipamentos/equipamento-dialog";
import Link from "next/link";

interface EquipamentosStats {
  total: number;
  disponiveis: number;
  emUso: number;
  outros: number;
}

interface EquipamentoPorFuncionario {
  funcionario: {
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
  };
  equipamentos: any[];
}

export default function EquipamentosPage() {
  const [stats, setStats] = useState<EquipamentosStats>({
    total: 0,
    disponiveis: 0,
    emUso: 0,
    outros: 0
  });
  const [equipamentosPorFuncionario, setEquipamentosPorFuncionario] = useState<EquipamentoPorFuncionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/equipamentos');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const equipamentos = await response.json();
      
      const stats = {
        total: equipamentos.length,
        disponiveis: equipamentos.filter((e: any) => e.status === 'DISPONIVEL').length,
        emUso: equipamentos.filter((e: any) => e.status === 'EM_USO').length,
        outros: equipamentos.filter((e: any) => e.status !== 'DISPONIVEL' && e.status !== 'EM_USO').length
      };

      setStats(stats);

      // Agrupar equipamentos por funcionário
      const equipamentosEmUso = equipamentos.filter((e: any) => e.status === 'EM_USO' && e.funcionario);
      const agrupados = equipamentosEmUso.reduce((acc: any, equipamento: any) => {
        const funcionarioId = equipamento.funcionario.id;
        if (!acc[funcionarioId]) {
          acc[funcionarioId] = {
            funcionario: equipamento.funcionario,
            equipamentos: []
          };
        }
        acc[funcionarioId].equipamentos.push(equipamento);
        return acc;
      }, {});

      setEquipamentosPorFuncionario(Object.values(agrupados));
    } catch (error) {
      console.error('Erro ao buscar estatísticas de equipamentos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleNovoEquipamento = () => {
    setIsDialogOpen(true);
  };

  const handleEquipamentoSuccess = () => {
    setIsDialogOpen(false);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipamentos</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipamentos</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie equipamentos e alocações
          </p>
        </div>
        <Button onClick={handleNovoEquipamento}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/equipamentos/disponiveis">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipamentos Disponíveis</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.disponiveis || 0}</div>
              <p className="text-xs text-muted-foreground">
                Prontos para alocação
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/equipamentos/em-uso">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipamentos em Uso</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.emUso || 0}</div>
              <p className="text-xs text-muted-foreground">
                Alocados para funcionários
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/equipamentos/manutencao">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.outros || 0}</div>
              <p className="text-xs text-muted-foreground">
                Em reparo ou danificados
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/equipamentos/inventario">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventário Total</CardTitle>
              <Monitor className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Equipamentos cadastrados
              </p>
        </CardContent>
      </Card>
        </Link>
      </div>

            {/* Equipamentos por Funcionário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Equipamentos por Funcionário</span>
          </CardTitle>
          <CardDescription>
            Visualize os equipamentos alocados para cada funcionário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipamentosPorFuncionario.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum equipamento está alocado para funcionários no momento.
              </p>
            </div>
          ) : (
          <div className="space-y-4">
              {equipamentosPorFuncionario.map((grupo) => (
                <div key={grupo.funcionario.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{grupo.funcionario.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {grupo.funcionario.cargo} • {grupo.funcionario.departamento}
                      </p>
                    </div>
                    <Badge className="ml-auto bg-blue-100 text-blue-800">
                      {grupo.equipamentos.length} equipamento{grupo.equipamentos.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {grupo.equipamentos.map((equipamento) => {
                      const getTipoIcon = (tipo: string) => {
                        switch (tipo) {
                          case "NOTEBOOK":
                            return <Laptop className="h-4 w-4" />;
                          case "MONITOR":
                            return <Monitor className="h-4 w-4" />;
                          case "HEADPHONE":
                            return <Headphones className="h-4 w-4" />;
                          case "MOUSE":
                            return <Mouse className="h-4 w-4" />;
                          case "KEYBOARD":
                            return <Keyboard className="h-4 w-4" />;
                          default:
                            return <Monitor className="h-4 w-4" />;
                        }
                      };

                      return (
                        <div key={equipamento.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                            {getTipoIcon(equipamento.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{equipamento.descricao}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {equipamento.marca} {equipamento.modelo}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Novo Equipamento */}
      <EquipamentoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleEquipamentoSuccess}
      />
    </div>
  );
}