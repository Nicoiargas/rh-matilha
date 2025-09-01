"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  XCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { FeriasDialog } from "@/components/ferias/ferias-dialog";

interface FuncionarioEmHaver {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  anosTrabalhados: number;
  direitoTotal: number;
  diasJaTirados: number;
  diasDisponiveis: number;
}

export default function FeriasEmHaverPage() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioEmHaver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioEmHaver | null>(null);

  const fetchFuncionariosEmHaver = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [feriasResponse, funcionariosResponse] = await Promise.all([
        fetch('/api/ferias'),
        fetch('/api/funcionarios')
      ]);

      if (!feriasResponse.ok || !funcionariosResponse.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const feriasData = await feriasResponse.json();
      const funcionariosData = await funcionariosResponse.json();

      // Calcular funcionários com férias em haver
      const funcionariosComFerias = new Set(feriasData.map((f: any) => f.funcionarioId));
      
      const funcionariosEmHaver = funcionariosData
        .filter((f: any) => {
          // Verificar se o funcionário tem pelo menos 1 ano de trabalho
          const dataAdmissao = new Date(f.dataAdmissao);
          const hoje = new Date();
          const anosTrabalhados = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          
          // Tem direito se trabalhou 1+ anos E não tem férias programadas
          return anosTrabalhados >= 1 && !funcionariosComFerias.has(f.id);
        })
        .map((f: any) => {
          const dataAdmissao = new Date(f.dataAdmissao);
          const hoje = new Date();
          const anosTrabalhados = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          
          // Calcular direito a férias
          const direitoTotal = Math.floor(anosTrabalhados) * 10;
          const diasJaTirados = 0; // Não tem férias programadas
          const diasDisponiveis = direitoTotal - diasJaTirados;

          return {
            id: f.id,
            nome: f.nome,
            cargo: f.cargo,
            departamento: f.departamento,
            dataAdmissao: f.dataAdmissao,
            anosTrabalhados,
            direitoTotal,
            diasJaTirados,
            diasDisponiveis
          };
        });

      setFuncionarios(funcionariosEmHaver);
    } catch (error) {
      console.error('Erro ao buscar funcionários em haver:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuncionariosEmHaver();
  }, []);

  const handleNovaSolicitacao = (funcionario: FuncionarioEmHaver) => {
    setSelectedFuncionario(funcionario);
    setIsDialogOpen(true);
  };

  const handleSolicitacaoSuccess = () => {
    setIsDialogOpen(false);
    setSelectedFuncionario(null);
    fetchFuncionariosEmHaver();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando funcionários em haver...</span>
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
          <Button onClick={fetchFuncionariosEmHaver} variant="outline">
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
            <h1 className="text-3xl font-bold tracking-tight">Férias em Haver</h1>
            <p className="text-muted-foreground">
              Funcionários com direito mas sem programar férias ({funcionarios.length})
            </p>
          </div>
        </div>
      </div>

      {funcionarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum funcionário em haver</h3>
            <p className="text-muted-foreground text-center">
              Todos os funcionários elegíveis já programaram suas férias.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {funcionarios.map((funcionario) => (
            <Card key={funcionario.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{funcionario.nome}</h3>
                      <Badge variant="secondary">{funcionario.cargo}</Badge>
                      <Badge variant="outline">{funcionario.departamento}</Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Em Haver
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Data de Admissão:</span>
                        <p>{new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Anos Trabalhados:</span>
                        <p>{funcionario.anosTrabalhados} anos</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Direito Total:</span>
                        <p className="text-green-600 font-medium">{funcionario.direitoTotal} dias</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Dias Disponíveis:</span>
                        <p className="text-blue-600 font-medium">{funcionario.diasDisponiveis} dias</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Status:</strong> Este funcionário tem direito a {funcionario.diasDisponiveis} dias de férias 
                        mas ainda não programou nenhuma solicitação.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleNovaSolicitacao(funcionario)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Solicitação
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isDialogOpen && selectedFuncionario && (
        <FeriasDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          funcionarioId={selectedFuncionario.id}
          funcionarioNome={selectedFuncionario.nome}
          onSuccess={handleSolicitacaoSuccess}
        />
      )}
    </div>
  );
}
