"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Monitor,
  Laptop,
  Headphones,
  Mouse,
  Keyboard,
  UserPlus,
  Eye
} from "lucide-react";
import { EquipamentoViewDialog } from "@/components/equipamentos/equipamento-view-dialog";
import { AlocarEquipamentoDialog } from "@/components/equipamentos/alocar-equipamento-dialog";
import Link from "next/link";

export default function EquipamentosDisponiveisPage() {
  const [equipamentos, setEquipamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAlocarDialog, setShowAlocarDialog] = useState(false);
  const [selectedEquipamento, setSelectedEquipamento] = useState<any>(null);

  const fetchEquipamentosDisponiveis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/equipamentos');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const equipamentosData = await response.json();
      const equipamentosDisponiveis = equipamentosData.filter((e: any) => e.status === 'DISPONIVEL');
      setEquipamentos(equipamentosDisponiveis);
    } catch (error) {
      console.error('Erro ao buscar equipamentos disponíveis:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipamentosDisponiveis();
  }, []);

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
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos Disponíveis</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos Disponíveis</h1>
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
          <Button onClick={fetchEquipamentosDisponiveis} variant="outline">
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
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos Disponíveis</h1>
          <p className="text-muted-foreground">
            Equipamentos prontos para alocação
          </p>
        </div>
      </div>

      {equipamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum equipamento disponível
            </h3>
            <p className="text-muted-foreground text-center">
              Todos os equipamentos estão em uso ou com outros status.<br />
              Adicione novos equipamentos ou aguarde devoluções.
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
                <Badge className="bg-green-100 text-green-800">
                  DISPONÍVEL
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
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
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
                    onClick={() => {
                      setSelectedEquipamento(equipamento);
                      setShowAlocarDialog(true);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Alocar
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

      <AlocarEquipamentoDialog
        equipamento={selectedEquipamento}
        open={showAlocarDialog}
        onOpenChange={setShowAlocarDialog}
        onSuccess={() => {
          console.log('Equipamento alocado com sucesso!');
          fetchEquipamentosDisponiveis();
        }}
      />
    </div>
  );
}
