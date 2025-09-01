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

interface EquipamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EquipamentoDialog({ open, onOpenChange, onSuccess }: EquipamentoDialogProps) {
  console.log('EquipamentoDialog renderizado, open:', open);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tipo: "",
    descricao: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    observacoes: ""
  });

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        tipo: "",
        descricao: "",
        marca: "",
        modelo: "",
        numeroSerie: "",
        observacoes: ""
      });
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.descricao || 
        !formData.marca || !formData.modelo) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/equipamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar equipamento');
      }

      // Limpar formulário
      setFormData({
        tipo: "",
        descricao: "",
        marca: "",
        modelo: "",
        numeroSerie: "",
        observacoes: ""
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
          <DialogDescription>
            Adicione um novo equipamento ao inventário (será criado como DISPONÍVEL)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Equipamento *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleInputChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTEBOOK">Notebook</SelectItem>
                <SelectItem value="DESKTOP">Desktop</SelectItem>
                <SelectItem value="MONITOR">Monitor</SelectItem>
                <SelectItem value="MOUSE">Mouse</SelectItem>
                <SelectItem value="TECLADO">Teclado</SelectItem>
                <SelectItem value="HEADPHONE">Headphone</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Ex: MacBook Pro 16 M2 Pro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Ex: Apple"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ex: MacBook Pro 16"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Número de Série</Label>
            <Input
              id="numeroSerie"
              value={formData.numeroSerie}
              onChange={(e) => handleInputChange('numeroSerie', e.target.value)}
              placeholder="Ex: MBP16-M2-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre o equipamento..."
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
                     Adicionar ao Inventário
                   </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
