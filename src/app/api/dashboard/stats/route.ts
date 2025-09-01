import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Dados mockados para teste
    const stats = {
      totalFuncionarios: 15,
      funcionariosAtivos: 12,
      funcionariosFerias: 2,
      funcionariosLicenca: 1,
      equipamentosEmUso: 8,
      projetosAtivos: 5,
      feriasPendentes: 3,
      beneficiosAtivos: 25,
      mediaSalarial: 8500.00
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
