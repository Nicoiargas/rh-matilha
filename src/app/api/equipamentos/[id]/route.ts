import { NextRequest, NextResponse } from 'next/server';
import { equipamentosEmMemoria } from '../route';

// Função para gerar ID único de histórico
let localNextHistId = 1000;
function getNextHistId() {
  return `hist-${localNextHistId++}`;
}

// GET - Buscar equipamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('✅ GET - Buscando equipamento:', id);
    
    // Em uma aplicação real, buscar do banco de dados
    const equipamento = equipamentosEmMemoria.find(eq => eq.id === id);
    
    if (!equipamento) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(equipamento);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Erro ao buscar equipamento' }, { status: 500 });
  }
}

// PUT - Atualizar equipamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('✅ PUT - Atualizando equipamento:', id, body);
    
    // Validação básica
    if (!body.tipo || !body.descricao || !body.marca || !body.modelo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: tipo, descricao, marca, modelo' },
        { status: 400 }
      );
    }
    
    // Buscar equipamento existente
    const index = equipamentosEmMemoria.findIndex(eq => eq.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    

    
    const equipamento = equipamentosEmMemoria[index];
    const novoStatus = body.status || equipamento.status;
    
    // Lógica especial: se mudando para EM_REPARO ou DANIFICADO, devolver automaticamente
    if ((novoStatus === 'EM_REPARO' || novoStatus === 'DANIFICADO') && equipamento.funcionarioId) {
      const dataDevolucao = new Date().toISOString();
      
      // Adicionar ao histórico se havia um empréstimo ativo
      if (equipamento.dataEmprestimo) {
        const novoHistorico = {
          id: getNextHistId(),
          funcionarioId: equipamento.funcionarioId,
          dataEmprestimo: equipamento.dataEmprestimo,
          dataDevolucao: dataDevolucao,
          observacoes: `Devolução automática - Equipamento ${novoStatus === 'EM_REPARO' ? 'em reparo' : 'danificado'}`
        };
        
        equipamento.historicoEmprestimos = equipamento.historicoEmprestimos || [];
        equipamento.historicoEmprestimos.unshift(novoHistorico);
      }
      
      // Atualizar equipamento com devolução automática
      equipamentosEmMemoria[index] = {
        ...equipamento,
        tipo: body.tipo,
        descricao: body.descricao,
        marca: body.marca,
        modelo: body.modelo,
        numeroSerie: body.numeroSerie || null,
        status: novoStatus,
        observacoes: body.observacoes || '',
        funcionarioId: null, // Devolver automaticamente
        dataEmprestimo: null, // Limpar data de empréstimo
        dataDevolucao: dataDevolucao, // Registrar data de devolução
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Atualização normal
      equipamentosEmMemoria[index] = {
        ...equipamento,
        tipo: body.tipo,
        descricao: body.descricao,
        marca: body.marca,
        modelo: body.modelo,
        numeroSerie: body.numeroSerie || null,
        status: novoStatus,
        observacoes: body.observacoes || '',
        updatedAt: new Date().toISOString(),
      };
    }
    
    console.log('✅ Equipamento atualizado:', equipamentosEmMemoria[index]);
    return NextResponse.json(equipamentosEmMemoria[index]);
    
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar equipamento' }, { status: 500 });
  }
}

// DELETE - Deletar equipamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('✅ DELETE - Deletando equipamento:', id);
    
    // Buscar equipamento existente
    const index = equipamentosEmMemoria.findIndex(eq => eq.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
    }
    
    // Verificar se equipamento está em uso
    if (equipamentosEmMemoria[index].status === 'EM_USO') {
      return NextResponse.json(
        { error: 'Não é possível deletar equipamento em uso' },
        { status: 400 }
      );
    }
    
    // Remover equipamento
    const equipamentoRemovido = equipamentosEmMemoria.splice(index, 1)[0];
    
    console.log('✅ Equipamento removido:', equipamentoRemovido);
    return NextResponse.json({ message: 'Equipamento removido com sucesso' });
    
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Erro ao deletar equipamento' }, { status: 500 });
  }
}
