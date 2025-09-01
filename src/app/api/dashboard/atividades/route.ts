import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Por enquanto, retornar dados mockados para evitar problemas de build
    const atividades = [
      {
        id: '1',
        tipo: 'funcionario',
        titulo: 'Novo funcionário contratado',
        descricao: 'Nicolas Iargas foi contratado para Desenvolvimento',
        data: new Date().toISOString(),
        funcionario: 'Nicolas Iargas',
      },
      {
        id: '2',
        tipo: 'funcionario',
        titulo: 'Novo funcionário contratado',
        descricao: 'Guilherme Utko foi contratado para Marketing',
        data: new Date().toISOString(),
        funcionario: 'Guilherme Utko',
      }
    ]

    return NextResponse.json(atividades)
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
