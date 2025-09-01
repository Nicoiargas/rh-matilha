import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar equipamentos
export async function GET() {
  try {
    console.log('✅ GET - Buscando equipamentos do banco de dados');
    
    const equipamentos = await prisma.equipamento.findMany({
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
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Encontrados ${equipamentos.length} equipamentos`);
    
    return NextResponse.json(equipamentos);
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
    
    // Criar equipamento no banco
    const novoEquipamento = await prisma.equipamento.create({
      data: {
        tipo: body.tipo,
        descricao: body.descricao,
        marca: body.marca,
        modelo: body.modelo,
        numeroSerie: body.numeroSerie || null,
        status: 'DISPONIVEL',
        observacoes: body.observacoes || '',
        funcionarioId: null
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
    
    console.log('✅ Equipamento criado no banco:', novoEquipamento);
    
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
    const equipamentoExistente = await prisma.equipamento.findUnique({
      where: { id: body.id }
    });
    
    if (!equipamentoExistente) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    // Lógica especial para devolução: voltar para DISPONIVEL
    if (body.status === 'DEVOLVIDO' || body.devolver === true) {
      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: body.id },
        data: {
          status: 'DISPONIVEL',
          funcionarioId: null,
          dataEmprestimo: null,
          dataDevolucao: new Date()
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
      
      console.log('✅ Equipamento devolvido:', equipamentoAtualizado);
      return NextResponse.json(equipamentoAtualizado);
    } else {
      // Atualização normal (alocação)
      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: body.id },
        data: {
          ...(body.funcionarioId && { funcionarioId: body.funcionarioId }),
          ...(body.status && { status: body.status }),
          ...(body.dataEmprestimo && { dataEmprestimo: new Date(body.dataEmprestimo) }),
          ...(body.dataDevolucao && { dataDevolucao: new Date(body.dataDevolucao) }),
          ...(body.observacoes && { observacoes: body.observacoes })
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
      
      console.log('✅ Equipamento atualizado:', equipamentoAtualizado);
      return NextResponse.json(equipamentoAtualizado);
    }
    
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar equipamento' }, { status: 500 });
  }
}

// DELETE - Remover equipamento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    await prisma.equipamento.delete({
      where: { id }
    });
    
    console.log('✅ Equipamento removido:', id);
    return NextResponse.json({ message: 'Equipamento removido com sucesso' });
    
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Erro ao remover equipamento' }, { status: 500 });
  }
}
