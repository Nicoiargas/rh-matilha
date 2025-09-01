"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Laptop, 
  Monitor, 
  Headphones, 
  Mouse, 
  Keyboard,
  Calendar,
  User,
  Building,
  FileText,
  Hash
} from "lucide-react";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
}

interface HistoricoEmprestimo {
  id: string;
  funcionarioId: string;
  dataEmprestimo: string;
  dataDevolucao: string;
  observacoes?: string;
}

interface Equipamento {
  id: string;
  tipo: string;
  descricao: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  dataEmprestimo?: string | null;
  dataDevolucao?: string | null;
  status: string;
  observacoes?: string;
  funcionario?: Funcionario | null;
  historicoEmprestimos?: HistoricoEmprestimo[];
  createdAt: string;
  updatedAt: string;
}

interface EquipamentoViewDialogProps {
  equipamento: Equipamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipamentoViewDialog({ equipamento, open, onOpenChange }: EquipamentoViewDialogProps) {
  if (!equipamento) return null;

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
      case "TECLADO":
        return <Keyboard className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EM_USO":
        return "bg-blue-100 text-blue-800";
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
      case "EM_USO":
        return "EM USO";
      case "EM_REPARO":
        return "EM REPARO";
      case "DANIFICADO":
        return "DANIFICADO";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFuncionarioNome = (funcionarioId: string): string => {
    const funcionarios: Record<string, string> = {
      'func-joao': 'João Silva',
      'func-maria': 'Maria Santos',
      'func-pedro': 'Pedro Oliveira',
      'func-ana': 'Ana Costa',
      'func-carlos': 'Carlos Ferreira',
      'func-lucia': 'Lúcia Almeida',
      'func-rafael': 'Rafael Souza',
      'func-julia': 'Julia Rodrigues',
      'func-marcos': 'Marcos Lima',
      'func-patricia': 'Patrícia Gomes'
    };
    return funcionarios[funcionarioId] || 'Funcionário Desconhecido';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTipoIcon(equipamento.tipo)}
            Detalhes do Equipamento
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o equipamento selecionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com informações principais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{equipamento.descricao}</h3>
              <Badge className={getStatusColor(equipamento.status)}>
                {getStatusText(equipamento.status)}
              </Badge>
            </div>
            <p className="text-gray-600">
              {equipamento.marca} • {equipamento.modelo}
            </p>
          </div>

          {/* Informações do equipamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Informações do Equipamento
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    {getTipoIcon(equipamento.tipo)}
                    {equipamento.tipo}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p className="text-sm text-gray-900">{equipamento.marca}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Modelo</label>
                  <p className="text-sm text-gray-900">{equipamento.modelo}</p>
                </div>

                {equipamento.numeroSerie && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Série</label>
                    <p className="text-sm text-gray-900 font-mono">{equipamento.numeroSerie}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Funcionário Responsável
              </h4>
              
              {equipamento.funcionario ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome</label>
                    <p className="text-sm text-gray-900">{equipamento.funcionario.nome}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo</label>
                    <p className="text-sm text-gray-900">{equipamento.funcionario.cargo}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Departamento</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {equipamento.funcionario.departamento}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum funcionário alocado</p>
              )}
            </div>
          </div>

          {/* Datas e observações */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas e Observações
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Data do Empréstimo</label>
                <p className="text-sm text-gray-900">{formatDate(equipamento.dataEmprestimo)}</p>
              </div>

              {equipamento.dataDevolucao && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Data da Devolução</label>
                  <p className="text-sm text-gray-900">{formatDate(equipamento.dataDevolucao)}</p>
                </div>
              )}
            </div>

            {equipamento.observacoes && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observações
                </label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-md">
                  {equipamento.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* Histórico de Empréstimos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Empréstimos
            </h3>
            
            {equipamento.historicoEmprestimos && equipamento.historicoEmprestimos.length > 0 ? (
              <div className="space-y-3">
                {equipamento.historicoEmprestimos.map((emprestimo) => (
                  <div key={emprestimo.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Funcionário
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {getFuncionarioNome(emprestimo.funcionarioId)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data de Empréstimo
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(emprestimo.dataEmprestimo)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Data de Devolução
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(emprestimo.dataDevolucao)}
                        </p>
                      </div>
                      
                      {emprestimo.observacoes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Observações
                          </label>
                          <p className="text-sm text-gray-900 mt-1">
                            {emprestimo.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum empréstimo registrado</p>
                <p className="text-sm">O histórico de empréstimos aparecerá aqui</p>
              </div>
            )}
          </div>

          {/* Informações do sistema */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <label className="font-medium">Criado em:</label>
                <p>{formatDate(equipamento.createdAt)}</p>
              </div>
              <div>
                <label className="font-medium">Última atualização:</label>
                <p>{formatDate(equipamento.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
