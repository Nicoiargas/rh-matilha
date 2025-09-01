"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  RefreshCw,
  CheckSquare
} from "lucide-react";
import { StatusChangeDialog } from "@/components/ferias/status-change-dialog";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FeriasPendentesPage() {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    status: 'APROVADA' | 'REJEITADA';
    feriasId: string;
    title: string;
    description: string;
  } | null>(null);

  const fetchFeriasPendentes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ferias');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const feriasData = await response.json();
      const feriasPendentes = feriasData.filter((f: any) => f.status === 'PENDENTE');
      setFerias(feriasPendentes);
    } catch (error) {
      console.error('Erro ao buscar férias pendentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeriasPendentes();
  }, []);

  const handleStatusChange = (feriaId: string) => {
    setStatusChangeDialog({
      open: true,
      status: 'APROVADA', // This is no longer used, but kept for compatibility
      feriasId: feriaId,
      title: 'Validar Solicitação de Férias',
      description: 'Analise a solicitação e escolha uma ação. Informe o motivo da sua decisão.'
    });
  };

  const handleStatusConfirm = async (status: 'APROVADA' | 'REJEITADA', motivo: string) => {
    if (!statusChangeDialog) return;

    try {
      const response = await fetch('/api/ferias', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: statusChangeDialog.feriasId, 
          status: status,
          motivo: motivo,
          aprovadoPor: 'Usuário RH'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status das férias');
      }

      // Fechar diálogo e recarregar dados
      setStatusChangeDialog(null);
      fetchFeriasPendentes();
    } catch (error) {
      console.error('Erro ao alterar status das férias:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando férias pendentes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            <span className="text-red-800 font-medium">Erro ao carregar dados</span>
          </h2>
          <p className="text-red-700 mt-2 mb-4">
            {error}
          </p>
          <Button onClick={fetchFeriasPendentes} variant="outline">
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
        <div className="flex items-center space-x-4">
          <Link href="/ferias">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Férias Pendentes</h1>
            <p className="text-muted-foreground">
              Solicitações aguardando aprovação ({ferias.length})
            </p>
          </div>
        </div>
      </div>

      {ferias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação pendente</h3>
            <p className="text-muted-foreground text-center">
              Todas as solicitações de férias foram processadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ferias.map((feria) => (
            <Card key={feria.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{feria.funcionario?.nome}</h3>
                      <Badge variant="secondary">{feria.funcionario?.cargo}</Badge>
                      <Badge variant="outline">{feria.funcionario?.departamento}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Data Início:</span>
                        <p>{new Date(feria.dataInicio).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Data Fim:</span>
                        <p>{new Date(feria.dataFim).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Duração:</span>
                        <p>{feria.diasSolicitados} dias</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Solicitado em:</span>
                        <p>{new Date(feria.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {feria.motivo && (
                      <div>
                        <span className="font-medium text-muted-foreground">Motivo:</span>
                        <p className="text-sm bg-muted p-2 rounded-md mt-1">{feria.motivo}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleStatusChange(feria.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Validar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {statusChangeDialog && (
        <StatusChangeDialog
          open={statusChangeDialog.open}
          onOpenChange={(open) => !open && setStatusChangeDialog(null)}
          title={statusChangeDialog.title}
          description={statusChangeDialog.description}
          feriasId={statusChangeDialog.feriasId}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
}
