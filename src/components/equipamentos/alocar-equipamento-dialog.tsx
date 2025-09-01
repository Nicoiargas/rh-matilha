"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
}

interface Equipamento {
  id: string;
  tipo: string;
  descricao: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  status: string;
  funcionario?: Funcionario;
}

interface AlocarEquipamentoDialogProps {
  equipamento: Equipamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AlocarEquipamentoDialog({ equipamento, open, onOpenChange, onSuccess }: AlocarEquipamentoDialogProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    funcionarioId: "",
    dataEmprestimo: "",
    observacoes: ""
  });

  useEffect(() => {
    if (open) {
      fetchFuncionarios();
      // Set current date as default
      setFormData({
        funcionarioId: "",
        dataEmprestimo: new Date().toISOString().split('T')[0],
        observacoes: ""
      });
      setError(null);
    }
  }, [open]);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('/api/funcionarios');
      if (!response.ok) {
        throw new Error('Erro ao buscar funcionários');
      }
      const data = await response.json();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError('Erro ao carregar funcionários');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.funcionarioId || !formData.dataEmprestimo) {
      setError('Funcionário e data de empréstimo são obrigatórios');
      return;
    }

    if (!equipamento) {
      setError('Equipamento não encontrado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/equipamentos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: equipamento.id,
          funcionarioId: formData.funcionarioId,
          status: 'EM_USO',
          dataEmprestimo: formData.dataEmprestimo,
          observacoes: formData.observacoes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao alocar equipamento');
      }

      // Limpar formulário
      setFormData({
        funcionarioId: "",
        dataEmprestimo: new Date().toISOString().split('T')[0],
        observacoes: ""
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao alocar equipamento:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!equipamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alocar Equipamento</DialogTitle>
          <DialogDescription>
            Alocar equipamento "{equipamento.descricao}" para um funcionário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Equipamento Selecionado:</h4>
            <p className="text-sm text-gray-600">
              {equipamento.marca} {equipamento.modelo} - {equipamento.tipo}
            </p>
            {equipamento.numeroSerie && (
              <p className="text-xs text-gray-500 mt-1">
                S/N: {equipamento.numeroSerie}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário *</Label>
            <Select
              value={formData.funcionarioId}
              onValueChange={(value) => handleInputChange('funcionarioId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome} - {funcionario.cargo} ({funcionario.departamento})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataEmprestimo">Data do Empréstimo *</Label>
            <Input
              id="dataEmprestimo"
              type="date"
              value={formData.dataEmprestimo}
              onChange={(e) => handleInputChange('dataEmprestimo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre a alocação..."
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alocar Equipamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
