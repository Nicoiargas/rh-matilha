export interface Funcionario {
  id: string;
  cpf: string;
  cnpj?: string | null;
  nome: string;
  emailCorporativo: string;
  emailPessoal?: string;
  telefone: string;
  telefoneCorporativo?: string;
  teams?: string;
  endereco: Endereco;
  dataAdmissao: Date;
  dataDemissao?: Date;
  status: 'ATIVO' | 'INATIVO' | 'FERIAS' | 'LICENCA';
  cargo: string;
  departamento: string;
  salario: number;
  chavePix?: string | null;
  observacoes?: string | null;
  beneficios: Beneficio[];
  equipamentos: Equipamento[];
  projetos: Projeto[];
  ferias: Ferias[];
  alteracoesSalariais: AlteracaoSalarial[];
  contratos: Contrato[];
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Beneficio {
  id: string;
  tipo: 'PLANO_SAUDE' | 'PLANO_ODONTOLOGICO' | 'VALE_REFEICAO' | 'VALE_TRANSPORTE' | 'GYMPASS' | 'OUTROS';
  descricao: string;
  valor: number;
  ativo: boolean;
  dataInicio: Date;
  dataFim?: Date;
}

export interface Equipamento {
  id: string;
  tipo: 'NOTEBOOK' | 'DESKTOP' | 'MONITOR' | 'MOUSE' | 'TECLADO' | 'HEADPHONE' | 'OUTROS';
  descricao: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  dataEmprestimo: Date;
  dataDevolucao?: Date;
  status: 'EM_USO' | 'EM_REPARO' | 'DANIFICADO';
  observacoes?: string;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  cliente?: string;
  dataInicio: Date;
  dataFim?: Date;
  status: 'ATIVO' | 'CONCLUIDO' | 'PAUSADO' | 'CANCELADO';
  papel: string;
  responsabilidades: string[];
}

export interface Ferias {
  id: string;
  ano: number;
  dataInicio: Date;
  dataFim: Date;
  diasSolicitados: number;
  diasDisponiveis: number;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  observacoes?: string;
}

export interface AlteracaoSalarial {
  id: string;
  dataAlteracao: Date;
  salarioAnterior: number;
  novoSalario: number;
  percentualAumento: number;
  motivo: string;
  aprovadoPor?: string;
  observacoes?: string;
}

export interface Contrato {
  id: string;
  tipo: 'CLT' | 'PJ' | 'ESTAGIO' | 'TRAINEE' | 'OUTROS';
  dataInicio: Date;
  dataFim?: Date;
  salario: number;
  beneficios: string[];
  clausulas: string[];
  arquivo?: string;
  status: 'ATIVO' | 'INATIVO' | 'RENOVADO';
}

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: Endereco;
  telefone: string;
  email: string;
  site?: string;
  responsavelRH: string;
}

export interface DashboardData {
  totalFuncionarios: number;
  funcionariosAtivos: number;
  funcionariosFerias: number;
  funcionariosLicenca: number;
  equipamentosEmUso: number;
  projetosAtivos: number;
  feriasPendentes: number;
  beneficiosAtivos: number;
}
