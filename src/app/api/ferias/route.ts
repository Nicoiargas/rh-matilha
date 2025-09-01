import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as solicitações de férias
export async function GET(request: NextRequest) {
  try {
    const ferias = await prisma.ferias.findMany({
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
      orderBy: {
        dataInicio: 'desc',
      },
    });

    return NextResponse.json(ferias);
  } catch (error) {
    console.error('Erro ao buscar férias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova solicitação de férias
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { funcionarioId, dataInicio, dataFim, dias, motivo, observacoes } = body;

    // Validações básicas
    if (!funcionarioId || !dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Criar a solicitação de férias
    const ferias = await prisma.ferias.create({
      data: {
        funcionarioId,
        ano: new Date(dataInicio).getFullYear(),
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        diasSolicitados: parseInt(dias),
        diasDisponiveis: 30, // Valor padrão, pode ser ajustado
        motivo: motivo,
        status: 'PENDENTE',
        observacoes: observacoes || '',
      },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    return NextResponse.json(ferias, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar solicitação de férias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status das férias
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, motivo, aprovadoPor } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a solicitação existe
    const ferias = await prisma.ferias.findUnique({
      where: { id },
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    if (!ferias) {
      return NextResponse.json(
        { error: 'Solicitação de férias não encontrada' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = { status };

    if (status === 'APROVADA') {
      updateData.dataAprovacao = new Date();
      updateData.aprovadoPor = aprovadoPor || 'Sistema';
      updateData.motivo = motivo; // Salvar motivo da aprovação
    } else if (status === 'REJEITADA') {
      updateData.dataRecusa = new Date();
      updateData.recusadoPor = aprovadoPor || 'Sistema';
      updateData.motivoRecusa = motivo;
    }

    // Atualizar o status
    const feriasAtualizada = await prisma.ferias.update({
      where: { id },
      data: updateData,
      include: {
        funcionario: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    return NextResponse.json(feriasAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar status das férias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
