"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save, X } from "lucide-react";

interface Equipamento {
  id: string;
  tipo: string;
  descricao: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  status: string;
  observacoes?: string;
  funcionario?: any;
  dataEmprestimo?: string | null;
  dataDevolucao?: string | null;
  historicoEmprestimos?: any[];
  createdAt: string;
  updatedAt: string;
}

interface EquipamentoEditDialogProps {
  equipamento: Equipamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipamento: Equipamento) => void;
}

const tiposEquipamento = [
  { value: "NOTEBOOK", label: "Notebook" },
  { value: "MONITOR", label: "Monitor" },
  { value: "HEADPHONE", label: "Headphone" },
  { value: "MOUSE", label: "Mouse" },
  { value: "KEYBOARD", label: "Teclado" },
  { value: "WEBCAM", label: "Webcam" },
  { value: "TABLET", label: "Tablet" },
  { value: "SMARTPHONE", label: "Smartphone" },
  { value: "PROJECTOR", label: "Projetor" },
  { value: "PRINTER", label: "Impressora" },
  { value: "ROUTER", label: "Roteador" },
  { value: "OTHER", label: "Outro" },
];

const statusOptions = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EM_REPARO", label: "Em Reparo" },
  { value: "DANIFICADO", label: "Danificado" },
];

export function EquipamentoEditDialog({
  equipamento,
  open,
  onOpenChange,
  onSave,
}: EquipamentoEditDialogProps) {
  const [formData, setFormData] = useState({
    tipo: "",
    descricao: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    status: "",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualizar formData quando equipamento mudar
  useEffect(() => {
    if (equipamento) {
      setFormData({
        tipo: equipamento.tipo || "",
        descricao: equipamento.descricao || "",
        marca: equipamento.marca || "",
        modelo: equipamento.modelo || "",
        numeroSerie: equipamento.numeroSerie || "",
        status: equipamento.status || "DISPONIVEL",
        observacoes: equipamento.observacoes || "",
      });
      setError(null);
    }
  }, [equipamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipamento) return;



    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/equipamentos/${equipamento.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar equipamento");
      }

      const updatedEquipamento = await response.json();
      onSave(updatedEquipamento);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar equipamento:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!equipamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Equipamento
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do equipamento {equipamento.descricao}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange("tipo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEquipamento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Ex: MacBook Pro 16 polegadas"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange("marca", e.target.value)}
                placeholder="Ex: Apple, Dell, Sony"
                required
              />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange("modelo", e.target.value)}
                placeholder="Ex: MacBook Pro 16, P2419H"
                required
              />
            </div>
          </div>

          {/* Número de Série */}
          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Número de Série</Label>
            <Input
              id="numeroSerie"
              value={formData.numeroSerie}
              onChange={(e) => handleInputChange("numeroSerie", e.target.value)}
              placeholder="Ex: MBP001, MON001"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              placeholder="Observações adicionais sobre o equipamento"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
