"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomAvatar } from "@/components/ui/avatar-fallback";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Mail,
  Loader2,
  Users,
  AlertCircle,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Funcionario } from "@/types/rh";
import { FuncionarioDialog } from "./funcionario-dialog";
import { FuncionarioViewDialog } from "./funcionario-view-dialog";

interface FuncionariosTableProps {
  onFuncionarioUpdated: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ATIVO":
      return "bg-green-100 text-green-800";
    case "FERIAS":
      return "bg-blue-100 text-blue-800";
    case "LICENCA":
      return "bg-yellow-100 text-yellow-800";
    case "INATIVO":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function FuncionariosTable({ onFuncionarioUpdated }: FuncionariosTableProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingFuncionario, setViewingFuncionario] = useState<Funcionario | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [copiedCnpjId, setCopiedCnpjId] = useState<string | null>(null);

  const fetchFuncionarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout para evitar espera infinita
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout - A requisição demorou muito para responder')), 8000)
      );
      
      const fetchPromise = fetch('/api/funcionarios');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback: tentar novamente se for a primeira vez
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchFuncionarios(), 3000); // Tentar novamente em 3 segundos
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const handleEdit = (funcionario: Funcionario) => {
    console.log('handleEdit chamado com funcionário:', funcionario);
    console.log('Estado ANTES da atualização:', { editingFuncionario, isEditDialogOpen });
    
    setEditingFuncionario(funcionario);
    setIsEditDialogOpen(true);
    
    console.log('Estados definidos, aguardando re-render...');
  };

  const handleView = (funcionario: Funcionario) => {
    setViewingFuncionario(funcionario);
    setIsViewDialogOpen(true);
  };

  const handleCopyPix = async (pix: string, funcionarioId: string) => {
    try {
      await navigator.clipboard.writeText(pix);
      setCopiedPixId(funcionarioId);
      
      // Resetar o estado após 2 segundos
      setTimeout(() => {
        setCopiedPixId(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar PIX:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = pix;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedPixId(funcionarioId);
      setTimeout(() => {
        setCopiedPixId(null);
      }, 2000);
    }
  };

  const handleCopyCnpj = async (cnpj: string, funcionarioId: string) => {
    try {
      await navigator.clipboard.writeText(cnpj);
      setCopiedCnpjId(funcionarioId);
      
      // Resetar o estado após 2 segundos
      setTimeout(() => {
        setCopiedCnpjId(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar CNPJ:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = cnpj;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedCnpjId(funcionarioId);
      setTimeout(() => {
        setCopiedCnpjId(null);
      }, 2000);
    }
  };

  // Monitorar mudanças nos estados
  useEffect(() => {
    console.log('useEffect - Estados atualizados:', { editingFuncionario, isEditDialogOpen });
  }, [editingFuncionario, isEditDialogOpen]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingId(id);
      
      const response = await fetch(`/api/funcionarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir funcionário');
      }

      // Atualizar a lista e notificar o componente pai
      await fetchFuncionarios();
      onFuncionarioUpdated();
      
      // Mostrar mensagem de sucesso
      alert('Funcionário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      alert(`Erro ao excluir funcionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingFuncionario(null);
    fetchFuncionarios();
    onFuncionarioUpdated();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingFuncionario(null);
  };

  // Mostrar loading apenas na primeira tentativa
  if (loading && retryCount === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando funcionários...</span>
      </div>
    );
  }

  // Mostrar erro se não conseguiu carregar após tentativas
  if (error && funcionarios.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-4">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Erro ao carregar funcionários
          </h3>
          <p className="text-red-700 mb-4">
            {error}
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={fetchFuncionarios} variant="outline">
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

  // Mostrar mensagem de "nenhum funcionário" se não houver dados
  if (funcionarios.length === 0 && !loading && !error) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum funcionário cadastrado
        </h3>
        <p className="text-muted-foreground">
          Comece cadastrando o primeiro funcionário da empresa.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
                           <TableHeader>
                   <TableRow>
                     <TableHead>Funcionário</TableHead>
                     <TableHead>CNPJ</TableHead>
                     <TableHead>Cargo</TableHead>
                     <TableHead>Salário</TableHead>
                     <TableHead>PIX</TableHead>
                     <TableHead>Situação</TableHead>
                     <TableHead className="text-right">Ações</TableHead>
                   </TableRow>
                 </TableHeader>
          <TableBody>
            {funcionarios.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <CustomAvatar
                      src={`/avatars/${funcionario.id}.png`}
                      alt={funcionario.nome}
                      fallback={funcionario.nome.split(' ').map(n => n[0]).join('')}
                      className="h-8 w-8"
                    />
                    <div>
                      <div className="font-medium">{funcionario.nome}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {funcionario.emailCorporativo}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {funcionario.cnpj ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 hover:bg-blue-50"
                      onClick={() => handleCopyCnpj(funcionario.cnpj!, funcionario.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {copiedCnpjId === funcionario.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm">
                          {copiedCnpjId === funcionario.id ? 'Copiado!' : funcionario.cnpj}
                        </span>
                      </div>
                    </Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{funcionario.cargo}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(funcionario.salario)}
                </TableCell>
                <TableCell>
                  {funcionario.chavePix ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-2 hover:bg-blue-50"
                      onClick={() => handleCopyPix(funcionario.chavePix!, funcionario.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {copiedPixId === funcionario.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm">
                          {copiedPixId === funcionario.id ? 'Copiado!' : funcionario.chavePix}
                        </span>
                      </div>
                    </Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(funcionario.status)}>
                    {funcionario.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleView(funcionario)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(funcionario)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(funcionario.id)}
                      disabled={deletingId === funcionario.id}
                    >
                      {deletingId === funcionario.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de edição */}
      {editingFuncionario && isEditDialogOpen && (
        <FuncionarioDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          funcionario={editingFuncionario}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
          mode="edit"
        />
      )}

      {/* Dialog de visualização */}
      {viewingFuncionario && isViewDialogOpen && (
        <FuncionarioViewDialog
          funcionario={viewingFuncionario}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
      
      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
        <p>Debug: editingFuncionario = {editingFuncionario ? 'SIM' : 'NÃO'}</p>
        <p>Debug: isEditDialogOpen = {isEditDialogOpen ? 'SIM' : 'NÃO'}</p>
        {editingFuncionario && (
          <p>Debug: Funcionário selecionado = {editingFuncionario.nome}</p>
        )}
      </div>
    </>
  );
}
