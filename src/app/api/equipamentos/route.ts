import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    
    // Formatar dados para compatibilidade com a página
    const equipamentosFormatados = equipamentos.map(equip => ({
      id: equip.id,
      tipo: equip.tipo,
      descricao: equip.descricao,
      marca: equip.marca,
      modelo: equip.modelo,
      numeroSerie: equip.numeroSerie,
      status: equip.status,
      observacoes: equip.observacoes,
      funcionarioId: equip.funcionarioId,
      funcionario: equip.funcionario || null,
      dataEmprestimo: equip.dataEmprestimo?.toISOString() || null,
      dataDevolucao: equip.dataDevolucao?.toISOString() || null,
      historicoEmprestimos: [], // TODO: Implementar histórico quando necessário
      createdAt: equip.createdAt.toISOString(),
      updatedAt: equip.updatedAt.toISOString()
    }));
    
    console.log(`✅ ${equipamentosFormatados.length} equipamentos encontrados`);
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
    
    // Criar equipamento no banco
    const novoEquipamento = await prisma.equipamento.create({
      data: {
        tipo: body.tipo as any,
        descricao: body.descricao,
        marca: body.marca,
        modelo: body.modelo,
        numeroSerie: body.numeroSerie || null,
        status: 'DISPONIVEL' as any,
        observacoes: body.observacoes || '',
        dataEmprestimo: new Date(),
        dataDevolucao: new Date()
      } as any
    });
    
    console.log('✅ Equipamento criado no banco:', novoEquipamento.id);
    
    // Formatar resposta
    const equipamentoFormatado = {
      id: novoEquipamento.id,
      tipo: novoEquipamento.tipo,
      descricao: novoEquipamento.descricao,
      marca: novoEquipamento.marca,
      modelo: novoEquipamento.modelo,
      numeroSerie: novoEquipamento.numeroSerie,
      status: novoEquipamento.status,
      observacoes: novoEquipamento.observacoes,
      funcionarioId: novoEquipamento.funcionarioId,
      funcionario: null,
      dataEmprestimo: novoEquipamento.dataEmprestimo?.toISOString() || null,
      dataDevolucao: novoEquipamento.dataDevolucao?.toISOString() || null,
      historicoEmprestimos: [],
      createdAt: novoEquipamento.createdAt.toISOString(),
      updatedAt: novoEquipamento.updatedAt.toISOString()
    };
    
    return NextResponse.json(equipamentoFormatado, { status: 201 });
    
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
      where: { id: body.id },
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
    
    if (!equipamentoExistente) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    // Lógica especial para devolução: voltar para DISPONIVEL
    if (body.status === 'DEVOLVIDO' || body.devolver === true) {
      const dataDevolucao = new Date();
      
      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: body.id },
        data: {
          status: 'DISPONIVEL' as any,
          funcionarioId: undefined,
          dataEmprestimo: undefined,
          dataDevolucao: dataDevolucao,
          observacoes: body.observacoes || equipamentoExistente.observacoes
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
      
      console.log('✅ Equipamento devolvido:', equipamentoAtualizado.id);
      
      // Formatar resposta
      const equipamentoFormatado = {
        id: equipamentoAtualizado.id,
        tipo: equipamentoAtualizado.tipo,
        descricao: equipamentoAtualizado.descricao,
        marca: equipamentoAtualizado.marca,
        modelo: equipamentoAtualizado.modelo,
        numeroSerie: equipamentoAtualizado.numeroSerie,
        status: equipamentoAtualizado.status,
        observacoes: equipamentoAtualizado.observacoes,
        funcionarioId: equipamentoAtualizado.funcionarioId,
        funcionario: equipamentoAtualizado.funcionario || null,
        dataEmprestimo: equipamentoAtualizado.dataEmprestimo?.toISOString() || null,
        dataDevolucao: equipamentoAtualizado.dataDevolucao?.toISOString() || null,
        historicoEmprestimos: [],
        createdAt: equipamentoAtualizado.createdAt.toISOString(),
        updatedAt: equipamentoAtualizado.updatedAt.toISOString()
      };
      
      return NextResponse.json(equipamentoFormatado);
    } else {
      // Atualização normal (alocação ou mudança de status)
      const dadosAtualizacao: any = {
        observacoes: body.observacoes || equipamentoExistente.observacoes
      };
      
      if (body.funcionarioId !== undefined) {
        dadosAtualizacao.funcionarioId = body.funcionarioId;
      }
      
      if (body.status) {
        dadosAtualizacao.status = body.status;
      }
      
      if (body.dataEmprestimo) {
        dadosAtualizacao.dataEmprestimo = new Date(body.dataEmprestimo);
      }
      
      if (body.dataDevolucao) {
        dadosAtualizacao.dataDevolucao = new Date(body.dataDevolucao);
      }
      
      const equipamentoAtualizado = await prisma.equipamento.update({
        where: { id: body.id },
        data: dadosAtualizacao,
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
      
      console.log('✅ Equipamento atualizado:', equipamentoAtualizado.id);
      
      // Formatar resposta
      const equipamentoFormatado = {
        id: equipamentoAtualizado.id,
        tipo: equipamentoAtualizado.tipo,
        descricao: equipamentoAtualizado.descricao,
        marca: equipamentoAtualizado.marca,
        modelo: equipamentoAtualizado.modelo,
        numeroSerie: equipamentoAtualizado.numeroSerie,
        status: equipamentoAtualizado.status,
        observacoes: equipamentoAtualizado.observacoes,
        funcionarioId: equipamentoAtualizado.funcionarioId,
        funcionario: equipamentoAtualizado.funcionario || null,
        dataEmprestimo: equipamentoAtualizado.dataEmprestimo?.toISOString() || null,
        dataDevolucao: equipamentoAtualizado.dataDevolucao?.toISOString() || null,
        historicoEmprestimos: [],
        createdAt: equipamentoAtualizado.createdAt.toISOString(),
        updatedAt: equipamentoAtualizado.updatedAt.toISOString()
      };
      
      return NextResponse.json(equipamentoFormatado);
    }
    
  } catch (error) {
    console.error('❌ PATCH Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar equipamento' }, { status: 500 });
  }
}

// DELETE - Deletar equipamento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    // Verificar se equipamento existe
    const equipamento = await prisma.equipamento.findUnique({
      where: { id }
    });
    
    if (!equipamento) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    // Deletar equipamento
    await prisma.equipamento.delete({
      where: { id }
    });
    
    console.log('✅ Equipamento deletado:', id);
    return NextResponse.json({ message: 'Equipamento deletado com sucesso' });
    
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Erro ao deletar equipamento' }, { status: 500 });
  }
}