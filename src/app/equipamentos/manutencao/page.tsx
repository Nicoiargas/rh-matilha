"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Monitor,
  Laptop,
  Headphones,
  Mouse,
  Keyboard,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { EquipamentoViewDialog } from "@/components/equipamentos/equipamento-view-dialog";
import { EquipamentoEditDialog } from "@/components/equipamentos/equipamento-edit-dialog";
import Link from "next/link";

export default function EquipamentosManutencaoPage() {
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<any>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const fetchEquipamentosManutencao = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/equipamentos');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const equipamentosData = await response.json();
      const equipamentosManutencao = equipamentosData.filter((e: any) => 
        e.status === 'EM_REPARO' || e.status === 'DANIFICADO'
      );
      setEquipamentos(equipamentosManutencao);
    } catch (error) {
      console.error('Erro ao buscar equipamentos em manutenção:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipamentosManutencao();
  }, []);

  const handleEditEquipamento = (equipamento: any) => {
    setSelectedEquipamento(equipamento);
    setShowEditDialog(true);
  };

  const handleSaveEquipamento = (updatedEquipamento: any) => {
    setEquipamentos(prev => 
      prev.map(eq => 
        eq.id === updatedEquipamento.id ? updatedEquipamento : eq
      )
    );
    setShowEditDialog(false);
    setSelectedEquipamento(null);
  };

  const handleExcluirEquipamento = async (equipamento: any) => {
    if (!confirm(`Tem certeza que deseja excluir o equipamento "${equipamento.descricao}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setExcluindoId(equipamento.id);
    setError(null);

    try {
      const response = await fetch(`/api/equipamentos/${equipamento.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          alert(`❌ ${errorData.error}\n\nPara excluir este equipamento, primeiro devolva-o ou mude seu status.`);
          return;
        }
        throw new Error(errorData.error || 'Erro ao excluir equipamento');
      }

      setEquipamentos(prev => prev.filter(eq => eq.id !== equipamento.id));
      alert(`✅ Equipamento "${equipamento.descricao}" excluído com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setExcluindoId(null);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "NOTEBOOK":
        return <Laptop className="h-5 w-5" />;
      case "MONITOR":
        return <Monitor className="h-5 w-5" />;
      case "HEADPHONE":
        return <Headphones className="h-5 w-5" />;
      case "MOUSE":
        return <Mouse className="h-5 w-5" />;
      case "KEYBOARD":
        return <Keyboard className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EM_REPARO":
        return "bg-yellow-100 text-yellow-800";
      case "DANIFICADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "EM_REPARO":
        return "EM REPARO";
      case "DANIFICADO":
        return "DANIFICADO";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/equipamentos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos em Manutenção</h1>
            <p className="text-muted-foreground">
              Carregando dados...
            </p>
          </div>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/equipamentos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos em Manutenção</h1>
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
          <Button onClick={fetchEquipamentosManutencao} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link href="/equipamentos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos em Manutenção</h1>
          <p className="text-muted-foreground">
            Equipamentos em reparo ou danificados
          </p>
        </div>
      </div>

      {equipamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum equipamento em manutenção
            </h3>
            <p className="text-muted-foreground text-center">
              Todos os equipamentos estão funcionando normalmente.<br />
              Equipamentos em reparo ou danificados aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipamentos.map((equipamento) => (
            <Card key={equipamento.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTipoIcon(equipamento.tipo)}
                  </div>
                  <span>{equipamento.descricao}</span>
                </CardTitle>
                <Badge className={getStatusColor(equipamento.status)}>
                  {getStatusText(equipamento.status)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <strong>Marca:</strong> {equipamento.marca}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Modelo:</strong> {equipamento.modelo}
                  </div>
                  {equipamento.numeroSerie && (
                    <div className="text-sm text-muted-foreground">
                      <strong>S/N:</strong> {equipamento.numeroSerie}
                    </div>
                  )}
                  {equipamento.observacoes && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Observações:</strong> {equipamento.observacoes}
                    </div>
                  )}
                  
                  {equipamento.dataDevolucao && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-800">
                        <strong>Devolvido em:</strong> {new Date(equipamento.dataDevolucao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 mt-4">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedEquipamento(equipamento);
                        setShowViewDialog(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600 flex-1"
                      onClick={() => handleEditEquipamento(equipamento)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 w-full"
                    onClick={() => handleExcluirEquipamento(equipamento)}
                    disabled={excluindoId === equipamento.id}
                  >
                    {excluindoId === equipamento.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <EquipamentoViewDialog
        equipamento={selectedEquipamento}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />

      <EquipamentoEditDialog
        equipamento={selectedEquipamento}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveEquipamento}
      />
    </div>
  );
}
