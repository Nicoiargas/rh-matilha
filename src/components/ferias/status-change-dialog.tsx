"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Calendar, User, Clock, MapPin, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
}

interface Ferias {
  id: string;
  dataInicio: string;
  dataFim: string;
  diasSolicitados: number;
  status: string;
  motivo?: string;
}

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  feriasId: string;
  onConfirm: (status: 'APROVADA' | 'REJEITADA', motivo: string) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  title,
  description,
  feriasId,
  onConfirm
}: StatusChangeDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAntecipacaoModal, setShowAntecipacaoModal] = useState(false);

  useEffect(() => {
    if (open && feriasId) {
      fetchFuncionarioData();
    }
  }, [open, feriasId]);

  const fetchFuncionarioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da solicitação de férias atual
      const feriasResponse = await fetch(`/api/ferias`);
      if (!feriasResponse.ok) throw new Error('Erro ao buscar férias');
      const feriasData = await feriasResponse.json();
      
      const feriasAtual = feriasData.find((f: any) => f.id === feriasId);
      if (!feriasAtual) throw new Error('Solicitação de férias não encontrada');

      // Buscar dados do funcionário
      const funcionariosResponse = await fetch(`/api/funcionarios`);
      if (!funcionariosResponse.ok) throw new Error('Erro ao buscar funcionários');
      const funcionariosData = await funcionariosResponse.json();
      
      const funcionarioEncontrado = funcionariosData.find((f: any) => f.id === feriasAtual.funcionarioId);
      if (!funcionarioEncontrado) throw new Error('Funcionário não encontrado');

      setFuncionario(funcionarioEncontrado);
      setFerias(feriasData.filter((f: any) => f.funcionarioId === funcionarioEncontrado.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const calcularDireitoFerias = () => {
    if (!funcionario) return { temDireito: false, diasDisponiveis: 0, anosTrabalhados: 0 };

    const dataAdmissao = new Date(funcionario.dataAdmissao);
    const hoje = new Date();
    
    // Calcular anos trabalhados (considerando apenas anos completos)
    const anosTrabalhados = Math.floor((hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    
    console.log('🔍 DEBUG - Cálculo de Direito a Férias:');
    console.log('Data de Admissão:', funcionario.dataAdmissao);
    console.log('Data Atual:', hoje.toISOString());
    console.log('Anos Trabalhados:', anosTrabalhados);
    console.log('Título do Modal:', title);
    console.log('Condição para Antecipar:', title.includes('Validar') && anosTrabalhados < 1);
    console.log('Diferença em milissegundos:', hoje.getTime() - dataAdmissao.getTime());
    console.log('Diferença em dias:', (hoje.getTime() - dataAdmissao.getTime()) / (1000 * 60 * 60 * 24));
    
    // Direito a férias: 10 dias por ano após completar 1 ano
    const direitoTotal = Math.max(0, anosTrabalhados) * 10;
    
    // Calcular férias já tiradas (apenas aprovadas)
    const feriasAprovadas = ferias.filter(f => f.status === 'APROVADA');
    const diasJaTirados = feriasAprovadas.reduce((total, f) => total + f.diasSolicitados, 0);
    
    // Dias disponíveis = direito total - dias já tirados
    // Pode ser negativo se tirou mais do que tinha direito
    const diasDisponiveis = direitoTotal - diasJaTirados;
    
    // Tem direito se tem anos trabalhados E dias disponíveis (pode ser negativo para mostrar débito)
    const temDireito = anosTrabalhados >= 1;
    
    // Deve mostrar "Antecipar Férias" se:
    // 1. Tem menos de 1 ano de trabalho OU
    // 2. Está em débito de férias (diasDisponiveis < 0)
    const deveAntecipar = anosTrabalhados < 1 || diasDisponiveis < 0;

    return {
      temDireito,
      diasDisponiveis,
      anosTrabalhados,
      direitoTotal,
      diasJaTirados,
      deveAntecipar
    };
  };

  const handleSubmit = (status: 'APROVADA' | 'REJEITADA') => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo');
      return;
    }
    onConfirm(status, motivo);
    setMotivo("");
  };

  const handleAntecipacao = () => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo');
      return;
    }
    onConfirm('APROVADA', motivo);
    setMotivo("");
    setShowAntecipacaoModal(false);
  };

  const handleCancelAntecipacao = () => {
    setShowAntecipacaoModal(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando informações...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!funcionario) return null;

  const { temDireito, diasDisponiveis, anosTrabalhados, direitoTotal, diasJaTirados, deveAntecipar } = calcularDireitoFerias();
  const feriasAprovadas = ferias.filter(f => f.status === 'APROVADA');
  const feriasPendentes = ferias.filter(f => f.status === 'PENDENTE');

  // Modal de confirmação de antecipação
  if (showAntecipacaoModal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Antecipação
            </DialogTitle>
            <DialogDescription>
              {anosTrabalhados < 1 
                ? 'Este funcionário não tem direito a férias ainda. Deseja aprovar mesmo assim?'
                : 'Este funcionário está em débito de férias. Deseja aprovar mesmo assim?'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Atenção</span>
            </div>
            <p className="text-sm text-orange-700">
              {anosTrabalhados < 1 ? (
                <>
                  <strong>{funcionario.nome}</strong> ainda não completou 1 ano de trabalho 
                  ({anosTrabalhados} anos). Aprovar férias agora significa antecipar o direito.
                </>
              ) : (
                <>
                  <strong>{funcionario.nome}</strong> está em débito de <strong>{Math.abs(diasDisponiveis)} dias</strong> de férias. 
                  Aprovar férias agora aumentará ainda mais o débito.
                </>
              )}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelAntecipacao}>
              Não
            </Button>
            <Button 
              onClick={handleAntecipacao}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {anosTrabalhados < 1 ? 'Sim, Aprovar Antecipação' : 'Sim, Aprovar com Débito'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Funcionário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Nome</Label>
                  <p className="text-lg font-semibold">{funcionario.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cargo</Label>
                  <p className="text-lg">{funcionario.cargo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Departamento</Label>
                  <p className="text-lg">{funcionario.departamento}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data de Admissão</Label>
                  <p className="text-lg">{new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Direito a Férias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Análise de Direito a Férias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-blue-600">Tempo de Trabalho</Label>
                  <p className="text-2xl font-bold text-blue-800">{anosTrabalhados} anos</p>
                  <p className="text-sm text-blue-600">
                    {anosTrabalhados >= 1 ? '✅ Direito adquirido' : '⏳ Aguardando 1 ano completo'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  diasDisponiveis > 0 ? 'bg-green-50' : 
                  diasDisponiveis === 0 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <Label className={`text-sm font-medium ${
                    diasDisponiveis > 0 ? 'text-green-600' : 
                    diasDisponiveis === 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Status das Férias
                  </Label>
                  <p className={`text-2xl font-bold ${
                    diasDisponiveis > 0 ? 'text-green-800' : 
                    diasDisponiveis === 0 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {diasDisponiveis > 0 ? '✅ Pode Aprovar' : 
                     diasDisponiveis === 0 ? '⚠️ Limite Atingido' : '❌ Em Débito'}
                  </p>
                  <p className={`text-sm ${
                    diasDisponiveis > 0 ? 'text-green-600' : 
                    diasDisponiveis === 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {diasDisponiveis > 0 ? 'Funcionário tem dias disponíveis' : 
                     diasDisponiveis === 0 ? 'Funcionário atingiu o limite de férias' : 
                     'Funcionário deve dias de férias'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Label className="text-sm font-medium text-gray-600">Direito Total</Label>
                  <p className="text-xl font-bold text-gray-800">{direitoTotal} dias</p>
                  <p className="text-xs text-gray-500">10 dias × {anosTrabalhados} anos</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <Label className="text-sm font-medium text-orange-600">Já Tirados</Label>
                  <p className="text-xl font-bold text-orange-800">{diasJaTirados} dias</p>
                  <p className="text-xs text-orange-500">Férias aprovadas</p>
                </div>
                
                <div className={`p-4 rounded-lg text-center ${
                  diasDisponiveis > 0 ? 'bg-green-50' : 
                  diasDisponiveis === 0 ? 'bg-yellow-50' : 'bg-red-50'
                }`}>
                  <Label className={`text-sm font-medium ${
                    diasDisponiveis > 0 ? 'text-green-600' : 
                    diasDisponiveis === 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {diasDisponiveis > 0 ? 'Disponível' : 
                     diasDisponiveis === 0 ? 'Limite Atingido' : 'Débito'}
                  </Label>
                  <p className={`text-xl font-bold ${
                    diasDisponiveis > 0 ? 'text-green-800' : 
                    diasDisponiveis === 0 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {diasDisponiveis > 0 ? `+${diasDisponiveis}` : diasDisponiveis} dias
                  </p>
                  <p className={`text-xs ${
                    diasDisponiveis > 0 ? 'text-green-500' : 
                    diasDisponiveis === 0 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {diasDisponiveis > 0 ? 'Pode solicitar' : 
                     diasDisponiveis === 0 ? 'Sem dias restantes' : 'Devendo férias'}
                  </p>
                </div>
              </div>

              {/* Aviso de Débito */}
              {diasDisponiveis < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Atenção: Funcionário em Débito</span>
                  </div>
                  <p className="text-sm text-red-700 mt-2">
                    Este funcionário já tirou {Math.abs(diasDisponiveis)} dias de férias a mais do que tinha direito. 
                    A aprovação de novas férias aumentará ainda mais o débito.
                  </p>
                </div>
              )}

              {/* Resumo das Solicitações */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Label className="text-sm font-medium text-blue-600">Total de Solicitações</Label>
                  <p className="text-xl font-bold text-blue-800">{ferias.length}</p>
                  <p className="text-xs text-blue-500">Todas as solicitações</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <Label className="text-sm font-medium text-yellow-600">Pendentes</Label>
                  <p className="text-xl font-bold text-yellow-800">{feriasPendentes.length}</p>
                  <p className="text-xs text-yellow-500">Aguardando aprovação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Férias Aprovadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Histórico de Férias Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feriasAprovadas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma férias aprovada</p>
                  <p className="text-sm">Este funcionário ainda não teve férias aprovadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feriasAprovadas
                    .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
                    .map((feria) => (
                      <div key={feria.id} className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-green-800">
                              {new Date(feria.dataInicio).toLocaleDateString('pt-BR')} a {new Date(feria.dataFim).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-green-600">
                              {feria.diasSolicitados} dias
                            </p>
                            {feria.motivo && (
                              <p className="text-xs text-green-500 mt-1">
                                Motivo: {feria.motivo}
                              </p>
                            )}
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                            Aprovada
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campo de Motivo */}
          <Card>
            <CardHeader>
              <CardTitle>Motivo da {title.includes('Aprovar') ? 'Aprovação' : 'Recusa'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={`Informe o motivo da ${title.includes('Aprovar') ? 'aprovação' : 'recusa'}...`}
                  className="min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          
          {/* Botão Aprovar ou Antecipar */}
          {deveAntecipar ? (
            <Button 
              onClick={() => setShowAntecipacaoModal(true)}
              disabled={!motivo.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {anosTrabalhados < 1 ? 'Antecipar Férias' : 'Aprovar com Débito'}
            </Button>
          ) : (
            <Button 
              onClick={() => handleSubmit('APROVADA')}
              disabled={!motivo.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
          )}
          
          {/* Botão Recusar - sempre visível */}
          <Button 
            onClick={() => handleSubmit('REJEITADA')}
            disabled={!motivo.trim()}
            variant="destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Recusar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
