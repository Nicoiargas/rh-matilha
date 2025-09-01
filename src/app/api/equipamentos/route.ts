import { NextRequest, NextResponse } from 'next/server';

// Dados em memória para teste (sem Prisma por enquanto)
// Exportar para compartilhar com outras rotas
export let equipamentosEmMemoria: any[] = [
  {
    id: 'mem-1',
    tipo: 'NOTEBOOK',
    descricao: 'MacBook Pro',
    marca: 'Apple',
    modelo: 'MacBook Pro 16"',
    numeroSerie: 'MBP001',
    status: 'DISPONIVEL',
    observacoes: '',
    funcionarioId: null,
    dataEmprestimo: null,
    dataDevolucao: null,
    historicoEmprestimos: [
      {
        id: 'hist-1',
        funcionarioId: 'func-joao',
        dataEmprestimo: '2025-08-15T10:00:00.000Z',
        dataDevolucao: '2025-08-20T17:30:00.000Z',
        observacoes: 'Empréstimo para projeto de desenvolvimento'
      },
      {
        id: 'hist-2',
        funcionarioId: 'func-maria',
        dataEmprestimo: '2025-08-25T09:15:00.000Z',
        dataDevolucao: '2025-09-01T18:08:53.557Z',
        observacoes: 'Empréstimo para análise de sistemas'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    tipo: 'MONITOR',
    descricao: 'Monitor Dell',
    marca: 'Dell',
    modelo: 'P2419H',
    numeroSerie: 'MON001',
    status: 'DISPONIVEL',
    observacoes: '',
    funcionarioId: null,
    dataEmprestimo: null,
    dataDevolucao: null,
    historicoEmprestimos: [
      {
        id: 'hist-3',
        funcionarioId: 'func-pedro',
        dataEmprestimo: '2025-08-10T14:00:00.000Z',
        dataDevolucao: '2025-08-18T16:45:00.000Z',
        observacoes: 'Empréstimo para gerenciamento de projetos'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    tipo: 'HEADPHONE',
    descricao: 'Headphone Sony',
    marca: 'Sony',
    modelo: 'WH-1000XM4',
    numeroSerie: 'HP001',
    status: 'DISPONIVEL',
    observacoes: '',
    funcionarioId: null,
    dataEmprestimo: null,
    dataDevolucao: null,
    historicoEmprestimos: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
export let nextId = 4;
export let nextHistId = 4;

// Funções auxiliares para retornar dados de funcionários únicos
function getFuncionarioNome(funcionarioId: string): string {
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
}

function getFuncionarioCargo(funcionarioId: string): string {
  const cargos: Record<string, string> = {
    'func-joao': 'Desenvolvedor Senior',
    'func-maria': 'Analista de Sistemas',
    'func-pedro': 'Gerente de Projetos',
    'func-ana': 'Designer UX/UI',
    'func-carlos': 'DevOps Engineer',
    'func-lucia': 'Product Manager',
    'func-rafael': 'Desenvolvedor Full Stack',
    'func-julia': 'QA Engineer',
    'func-marcos': 'Tech Lead',
    'func-patricia': 'Scrum Master'
  };
  return cargos[funcionarioId] || 'Cargo Não Definido';
}

function getFuncionarioDepartamento(funcionarioId: string): string {
  const departamentos: Record<string, string> = {
    'func-joao': 'Tecnologia',
    'func-maria': 'Tecnologia',
    'func-pedro': 'Tecnologia',
    'func-ana': 'Design',
    'func-carlos': 'Tecnologia',
    'func-lucia': 'Produto',
    'func-rafael': 'Tecnologia',
    'func-julia': 'Qualidade',
    'func-marcos': 'Tecnologia',
    'func-patricia': 'Agile'
  };
  return departamentos[funcionarioId] || 'Departamento Não Definido';
}

// GET - Listar equipamentos
export async function GET() {
  try {
    console.log('✅ GET - Retornando equipamentos em memória');
    
    // Formatar dados para compatibilidade com a página
    const equipamentosFormatados = equipamentosEmMemoria.map(equip => ({
      ...equip,
      funcionario: equip.funcionarioId ? {
        id: equip.funcionarioId,
        nome: getFuncionarioNome(equip.funcionarioId),
        cargo: getFuncionarioCargo(equip.funcionarioId),
        departamento: getFuncionarioDepartamento(equip.funcionarioId)
      } : null,
      // Garantir que as datas sejam strings válidas
      dataEmprestimo: equip.dataEmprestimo || null,
      dataDevolucao: equip.dataDevolucao || null,
      createdAt: equip.createdAt || new Date().toISOString(),
      updatedAt: equip.updatedAt || new Date().toISOString()
    }));
    
    return NextResponse.json(equipamentosFormatados);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Erro ao buscar equipamentos' }, { status: 500 });
  }
}

// POST - Criar equipamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✅ POST - Body recebido:', body);
    
    // Validação básica
    if (!body.tipo || !body.descricao || !body.marca || !body.modelo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, descricao, marca, modelo' },
        { status: 400 }
      );
    }
    
    // Criar equipamento em memória
    const novoEquipamento = {
      id: `mem-${nextId++}`,
      tipo: body.tipo,
      descricao: body.descricao,
      marca: body.marca,
      modelo: body.modelo,
      numeroSerie: body.numeroSerie || null,
      status: 'DISPONIVEL',
      observacoes: body.observacoes || '',
      funcionarioId: null,
      dataEmprestimo: null,
      dataDevolucao: null,
      historicoEmprestimos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    equipamentosEmMemoria.push(novoEquipamento);
    
    console.log('✅ Equipamento criado em memória:', novoEquipamento);
    console.log('✅ Total de equipamentos:', equipamentosEmMemoria.length);
    
    return NextResponse.json(novoEquipamento, { status: 201 });
    
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Erro ao criar equipamento' }, { status: 500 });
  }
}

// PATCH - Atualizar equipamento
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✅ PATCH - Body recebido:', body);
    
    if (!body.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    // Buscar equipamento existente
    const index = equipamentosEmMemoria.findIndex(eq => eq.id === body.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    // Lógica especial para devolução: voltar para DISPONIVEL
    if (body.status === 'DEVOLVIDO' || body.devolver === true) {
      const equipamento = equipamentosEmMemoria[index];
      const dataDevolucao = new Date().toISOString();
      
      // Adicionar ao histórico se havia um empréstimo ativo
      if (equipamento.funcionarioId && equipamento.dataEmprestimo) {
        const novoHistorico = {
          id: `hist-${nextHistId++}`,
          funcionarioId: equipamento.funcionarioId,
          dataEmprestimo: equipamento.dataEmprestimo,
          dataDevolucao: dataDevolucao,
          observacoes: equipamento.observacoes || ''
        };
        
        equipamento.historicoEmprestimos = equipamento.historicoEmprestimos || [];
        equipamento.historicoEmprestimos.unshift(novoHistorico); // Adicionar no início
      }
      
      equipamentosEmMemoria[index] = {
        ...equipamento,
        status: 'DISPONIVEL',
        funcionarioId: null,
        dataEmprestimo: null,
        dataDevolucao: dataDevolucao,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Atualização normal (alocação)
      equipamentosEmMemoria[index] = {
        ...equipamentosEmMemoria[index],
        ...(body.funcionarioId && { funcionarioId: body.funcionarioId }),
        ...(body.status && { status: body.status }),
        ...(body.dataEmprestimo && { dataEmprestimo: body.dataEmprestimo }),
        ...(body.dataDevolucao && { dataDevolucao: body.dataDevolucao }),
        ...(body.observacoes && { observacoes: body.observacoes }),
        updatedAt: new Date().toISOString(),
      };
    }
    
    console.log('✅ Equipamento atualizado:', equipamentosEmMemoria[index]);
    return NextResponse.json(equipamentosEmMemoria[index]);
    
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar equipamento' }, { status: 500 });
  }
}
