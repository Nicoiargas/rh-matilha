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

interface FeriasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionarioId?: string;
  funcionarioNome?: string;
  onSuccess: () => void;
}

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
}

export function FeriasDialog({ open, onOpenChange, funcionarioId, funcionarioNome, onSuccess }: FeriasDialogProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [dias, setDias] = useState<number>(0);
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Buscar funcionários disponíveis
  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const response = await fetch('/api/funcionarios');
        if (response.ok) {
          const data = await response.json();
          setFuncionarios(data);
        }
      } catch (error) {
        console.error('Erro ao buscar funcionários:', error);
      }
    };

    if (open) {
      fetchFuncionarios();
    }
  }, [open]);

  // Definir funcionário selecionado quando as propriedades são fornecidas
  useEffect(() => {
    if (funcionarioId && funcionarioNome) {
      setSelectedFuncionario(funcionarioId);
    }
  }, [funcionarioId, funcionarioNome]);

  // Calcular dias quando as datas mudarem
  useEffect(() => {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      if (inicio && fim && inicio < fim) {
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDias(diffDays);
      } else {
        setDias(0);
      }
    }
  }, [dataInicio, dataFim]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFuncionario || !dataInicio || !dataFim || !motivo.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (dataInicio >= dataFim) {
      alert('A data de início deve ser anterior à data de fim');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/ferias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funcionarioId: selectedFuncionario,
          dataInicio: dataInicio,
          dataFim: dataFim,
          dias,
          motivo,
          observacoes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar solicitação');
      }

      const data = await response.json();
      alert('Solicitação de férias criada com sucesso!');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar solicitação de férias');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFuncionario("");
    setDataInicio("");
    setDataFim("");
    setDias(0);
    setMotivo("");
    setObservacoes("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Férias</DialogTitle>
          <DialogDescription>
            Preencha os dados para solicitar férias para um funcionário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funcionario">Funcionário *</Label>
              <Select value={selectedFuncionario} onValueChange={setSelectedFuncionario}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarios.map((funcionario) => (
                    <SelectItem key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome} - {funcionario.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dias de Férias</Label>
              <Input
                value={dias}
                readOnly
                className="bg-gray-50"
                placeholder="Calculado automaticamente"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Férias anuais, Férias programadas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre a solicitação"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Solicitação'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
