import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar dados reais do banco
    const [
      totalFuncionarios,
      funcionariosAtivos,
      funcionariosFerias,
      funcionariosLicenca,
      equipamentosEmUso,
      projetosAtivos,
      feriasPendentes,
      beneficiosAtivos,
      mediaSalarial
    ] = await Promise.all([
      // Total de funcionários
      prisma.funcionario.count(),
      
      // Funcionários ativos
      prisma.funcionario.count({
        where: { status: 'ATIVO' }
      }),
      
      // Funcionários em férias
      prisma.funcionario.count({
        where: { status: 'FERIAS' }
      }),
      
      // Funcionários em licença
      prisma.funcionario.count({
        where: { status: 'LICENCA' }
      }),
      
      // Equipamentos em uso
      prisma.equipamento.count({
        where: { status: 'EM_USO' }
      }),
      
      // Projetos ativos
      prisma.projeto.count({
        where: { status: 'ATIVO' }
      }),
      
      // Férias pendentes
      prisma.ferias.count({
        where: { status: 'PENDENTE' }
      }),
      
      // Benefícios ativos
      prisma.beneficio.count({
        where: { ativo: true }
      }),
      
      // Média salarial
      prisma.funcionario.aggregate({
        where: { status: 'ATIVO' },
        _avg: { salario: true }
      })
    ])

    const stats = {
      totalFuncionarios,
      funcionariosAtivos,
      funcionariosFerias,
      funcionariosLicenca,
      equipamentosEmUso,
      projetosAtivos,
      feriasPendentes,
      beneficiosAtivos,
      mediaSalarial: mediaSalarial._avg.salario || 0
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
