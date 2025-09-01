"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomAvatar } from "@/components/ui/avatar-fallback";
import { User, Building2, MapPin, Calendar, Mail, Phone, CreditCard, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Funcionario } from "@/types/rh";

interface FuncionarioViewDialogProps {
  funcionario: Funcionario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function FuncionarioViewDialog({ funcionario, open, onOpenChange }: FuncionarioViewDialogProps) {
  if (!funcionario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Visualizar Funcionário
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do funcionário {funcionario.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cabeçalho com Avatar e Informações Principais */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <CustomAvatar
              src={`/avatars/${funcionario.id}.png`}
              alt={funcionario.nome}
              fallback={funcionario.nome.split(' ').map(n => n[0]).join('')}
              className="h-20 w-20"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{funcionario.nome}</h2>
              <p className="text-lg text-gray-600">{funcionario.cargo}</p>
              <p className="text-gray-500">{funcionario.departamento}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(funcionario.status)}>
                  {funcionario.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  Admitido em {format(new Date(funcionario.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(funcionario.salario)}
              </p>
              {funcionario.chavePix && (
                <p className="text-sm text-gray-500 mt-1">
                  PIX: {funcionario.chavePix}
                </p>
              )}
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">CPF</label>
                <p className="text-gray-900 font-mono">{funcionario.cpf}</p>
              </div>
              
              {funcionario.cnpj && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CNPJ</label>
                  <p className="text-gray-900 font-mono">{funcionario.cnpj}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Data de Admissão</label>
                <p className="text-gray-900">
                  {format(new Date(funcionario.dataAdmissao), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              
              {funcionario.dataDemissao && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Data de Demissão</label>
                  <p className="text-gray-900">
                    {format(new Date(funcionario.dataDemissao), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              <span>Contato</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Telefone Pessoal</label>
                <p className="text-gray-900">{funcionario.telefone}</p>
              </div>
              
              {funcionario.telefoneCorporativo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Telefone Corporativo</label>
                  <p className="text-gray-900">{funcionario.telefoneCorporativo}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Corporativo</label>
                <p className="text-gray-900">{funcionario.emailCorporativo}</p>
              </div>
              
              {funcionario.emailPessoal && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Pessoal</label>
                  <p className="text-gray-900">{funcionario.emailPessoal}</p>
                </div>
              )}
              
              {funcionario.teams && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Teams</label>
                  <p className="text-gray-900">{funcionario.teams}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" />
              <span>Informações Profissionais</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cargo</label>
                <p className="text-gray-900">{funcionario.cargo}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Departamento</label>
                <p className="text-gray-900">{funcionario.departamento}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Salário</label>
                <p className="text-gray-900 font-semibold">{formatCurrency(funcionario.salario)}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          {funcionario.endereco && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                <span>Endereço</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CEP</label>
                  <p className="text-gray-900">{funcionario.endereco.cep}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Rua</label>
                  <p className="text-gray-900">{funcionario.endereco.rua}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Número</label>
                  <p className="text-gray-900">{funcionario.endereco.numero}</p>
                </div>
                
                {funcionario.endereco.complemento && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Complemento</label>
                    <p className="text-gray-900">{funcionario.endereco.complemento}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bairro</label>
                  <p className="text-gray-900">{funcionario.endereco.bairro}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cidade</label>
                  <p className="text-gray-900">{funcionario.endereco.cidade}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <p className="text-gray-900">{funcionario.endereco.estado}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {funcionario.observacoes && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                <span>Observações</span>
              </div>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {funcionario.observacoes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
