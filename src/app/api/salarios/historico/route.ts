import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar histórico de alterações salariais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const funcionarioId = searchParams.get('funcionarioId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Timeout para evitar travamentos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );

    const whereClause = funcionarioId ? { funcionarioId } : {};

    const queryPromise = prisma.alteracaoSalarial.findMany({
      where: whereClause,
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true
          }
        }
      },
      orderBy: {
        dataAlteracao: 'desc'
      },
      take: limit,
      skip: offset
    });

    const historico = await Promise.race([queryPromise, timeoutPromise]) as any;

    return NextResponse.json(historico)
  } catch (error) {
    console.error('Erro ao buscar histórico de alterações salariais:', error)
    
    // Se for timeout, retornar erro específico
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Timeout - O banco de dados demorou muito para responder' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova alteração salarial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.funcionarioId || !body.novoSalario || !body.motivo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validar salário
    const novoSalario = parseFloat(body.novoSalario)
    if (isNaN(novoSalario) || novoSalario < 0) {
      return NextResponse.json(
        { error: 'Salário deve ser um valor válido maior que zero' },
        { status: 400 }
      )
    }

    // Buscar funcionário para obter salário atual
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: body.funcionarioId },
      select: { salario: true }
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Calcular percentual de aumento
    const percentualAumento = funcionario.salario > 0 
      ? ((novoSalario - funcionario.salario) / funcionario.salario) * 100
      : 0;

    // Criar alteração salarial
    const alteracao = await prisma.alteracaoSalarial.create({
      data: {
        funcionarioId: body.funcionarioId,
        salarioAnterior: funcionario.salario,
        novoSalario: novoSalario,
        percentualAumento: percentualAumento,
        motivo: body.motivo,
        dataAlteracao: new Date(),
        aprovadoPor: body.aprovadoPor || 'Sistema'
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true
          }
        }
      }
    });

    // Atualizar salário do funcionário
    await prisma.funcionario.update({
      where: { id: body.funcionarioId },
      data: { salario: novoSalario }
    });

    return NextResponse.json(alteracao, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar alteração salarial:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
