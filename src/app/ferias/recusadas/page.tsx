"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  XCircle, 
  Loader2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function FeriasRecusadasPage() {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeriasRecusadas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ferias');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const feriasData = await response.json();
      const feriasRecusadas = feriasData.filter((f: any) => f.status === 'REJEITADA');
      setFerias(feriasRecusadas);
    } catch (error) {
      console.error('Erro ao buscar férias recusadas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeriasRecusadas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando férias recusadas...</span>
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
          <Button onClick={fetchFeriasRecusadas} variant="outline">
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
            <h1 className="text-3xl font-bold tracking-tight">Férias Recusadas</h1>
            <p className="text-muted-foreground">
              Solicitações recusadas este mês ({ferias.length})
            </p>
          </div>
        </div>
      </div>

      {ferias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma férias recusada</h3>
            <p className="text-muted-foreground text-center">
              Não há solicitações recusadas este mês.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ferias.map((feria) => (
            <Card key={feria.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{feria.funcionario?.nome}</h3>
                    <Badge variant="secondary">{feria.funcionario?.cargo}</Badge>
                    <Badge variant="outline">{feria.funcionario?.departamento}</Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="mr-1 h-3 w-3" />
                      Recusada
                    </Badge>
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
                      <p>{feria.duracao} dias</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Recusada em:</span>
                      <p>{feria.dataRecusa ? new Date(feria.dataRecusa).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Motivo da Solicitação:</span>
                      <p className="text-sm bg-muted p-2 rounded-md mt-1">{feria.motivo || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Motivo da Recusa:</span>
                      <p className="text-sm bg-red-50 p-2 rounded-md mt-1 border border-red-200">{feria.motivoRecusa || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Recusado por:</span>
                      <p className="text-sm bg-muted p-2 rounded-md mt-1">{feria.recusadoPor || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
