"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { 
  Monitor, 
  Laptop, 
  Headphones, 
  Mouse, 
  Keyboard,
  Plus,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { EquipamentoDialog } from "@/components/equipamentos/equipamento-dialog";

interface EquipamentoStats {
  total: number;
  disponiveis: number;
  emUso: number;
  emManutencao: number;
  danificados: number;
}

export default function EquipamentosPage() {
  const [stats, setStats] = useState<EquipamentoStats | null>(null);
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEquipamentos, setFilteredEquipamentos] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout para evitar espera infinita
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const fetchPromise = Promise.all([
        fetch('/api/equipamentos'),
        fetch('/api/funcionarios')
      ]);
      
      const [equipamentosResponse, funcionariosResponse] = await Promise.race([fetchPromise, timeoutPromise]) as [Response, Response];
      
      if (!equipamentosResponse.ok || !funcionariosResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }
      
      const [equipamentosData, funcionarios] = await Promise.all([
        equipamentosResponse.json(),
        funcionariosResponse.json()
      ]);

      setEquipamentos(equipamentosData);

      // Calcular estatísticas
      const total = equipamentosData.length;
      const disponiveis = equipamentosData.filter((e: any) => e.status === 'DISPONIVEL').length;
      const emUso = equipamentosData.filter((e: any) => e.status === 'EM_USO').length;
      const emManutencao = equipamentosData.filter((e: any) => e.status === 'EM_MANUTENCAO').length;
      const danificados = equipamentosData.filter((e: any) => e.status === 'DANIFICADO').length;

      setStats({
        total,
        disponiveis,
        emUso,
        emManutencao,
        danificados
      });

      setFilteredEquipamentos(equipamentosData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: usar dados padrão se houver erro
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(), 2000); // Tentar novamente em 2 segundos
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredEquipamentos(equipamentos);
      return;
    }

    // Filtrar equipamentos baseado na busca
    const filtered = equipamentos.filter(equipamento => {
      const searchTerm = query.toLowerCase();
      return (
        equipamento.descricao.toLowerCase().includes(searchTerm) ||
        equipamento.marca.toLowerCase().includes(searchTerm) ||
        equipamento.modelo.toLowerCase().includes(searchTerm) ||
        equipamento.tipo.toLowerCase().includes(searchTerm) ||
        (equipamento.funcionario && equipamento.funcionario.nome.toLowerCase().includes(searchTerm)) ||
        equipamento.status.toLowerCase().includes(searchTerm)
      );
    });
    
    setFilteredEquipamentos(filtered);
  };

  const handleEquipamentoCreated = () => {
    // Recarregar dados quando um novo equipamento for criado
    fetchData();
  };

  const handleEquipamentoUpdated = () => {
    // Recarregar dados quando um equipamento for atualizado
    fetchData();
  };

  // Fallback para dados padrão se houver erro
  const getFallbackStats = (): EquipamentoStats => ({
    total: 0,
    disponiveis: 0,
    emUso: 0,
    emManutencao: 0,
    danificados: 0
  });

  const currentStats = stats || getFallbackStats();

  if (loading && retryCount === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
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
          <div className="flex space-x-2">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
            <Button onClick={() => setError(null)} variant="outline">
              Continuar sem dados
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
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os equipamentos da empresa
          </p>
        </div>
        <EquipamentoDialog onEquipamentoCreated={handleEquipamentoCreated} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Total de equipamentos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStats.disponiveis}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para uso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentStats.emUso}</div>
            <p className="text-xs text-muted-foreground">
              Atualmente alocados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{currentStats.emManutencao}</div>
            <p className="text-xs text-muted-foreground">
              Em reparo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Busca e Filtros</CardTitle>
          <CardDescription>
            Encontre equipamentos específicos rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por descrição, marca, modelo, tipo, funcionário..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipamentos Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Equipamentos</CardTitle>
          <CardDescription>
            {searchQuery ? `Resultados para: "${searchQuery}"` : 'Todos os equipamentos da empresa'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEquipamentos.map((equipamento) => (
              <div key={equipamento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {equipamento.tipo === 'NOTEBOOK' && <Laptop className="h-5 w-5 text-blue-600" />}
                    {equipamento.tipo === 'MONITOR' && <Monitor className="h-5 w-5 text-green-600" />}
                    {equipamento.tipo === 'HEADPHONE' && <Headphones className="h-5 w-5 text-purple-600" />}
                    {equipamento.tipo === 'MOUSE' && <Mouse className="h-5 w-5 text-gray-600" />}
                    {equipamento.tipo === 'TECLADO' && <Keyboard className="h-5 w-5 text-orange-600" />}
                    {equipamento.tipo === 'DESKTOP' && <Monitor className="h-5 w-5 text-indigo-600" />}
                    {equipamento.tipo === 'OUTROS' && <Monitor className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    equipamento.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                    equipamento.status === 'EM_USO' ? 'bg-blue-100 text-blue-800' :
                    equipamento.status === 'EM_MANUTENCAO' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {equipamento.status}
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">{equipamento.descricao}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Marca:</strong> {equipamento.marca}</p>
                  <p><strong>Modelo:</strong> {equipamento.modelo}</p>
                  {equipamento.funcionario && (
                    <p><strong>Alocado para:</strong> {equipamento.funcionario.nome}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredEquipamentos.length === 0 && (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery ? 'Nenhum equipamento encontrado para esta busca' : 'Nenhum equipamento cadastrado'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `Nenhum equipamento encontrado para "${searchQuery}". Tente uma busca diferente.`
                  : 'Comece cadastrando o primeiro equipamento da empresa.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}