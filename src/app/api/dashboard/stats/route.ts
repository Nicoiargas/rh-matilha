import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Buscar dados reais do banco
    const [
      totalFuncionarios,
      funcionariosAtivos,
      funcionariosFerias,
      funcionariosLicenca,
      equipamentosEmUso,
      feriasPendentes,
      funcionariosComSalario
    ] = await Promise.all([
      prisma.funcionario.count(),
      prisma.funcionario.count({ where: { status: 'ATIVO' } }),
      prisma.funcionario.count({ where: { status: 'FERIAS' } }),
      prisma.funcionario.count({ where: { status: 'LICENCA' } }),
      prisma.equipamento.count({ where: { status: 'EM_USO' } }),
      prisma.ferias.count({ where: { status: 'PENDENTE' } }),
      prisma.funcionario.findMany({
        where: { 
          status: 'ATIVO',
          salario: { gt: 0 }
        },
        select: { salario: true }
      })
    ])

    // Calcular média salarial
    const mediaSalarial = funcionariosComSalario.length > 0
      ? funcionariosComSalario.reduce((acc, f) => acc + (f.salario || 0), 0) / funcionariosComSalario.length
      : 0

    const stats = {
      totalFuncionarios,
      funcionariosAtivos,
      funcionariosFerias,
      funcionariosLicenca,
      equipamentosEmUso,
      projetosAtivos: 0, // TODO: Implementar quando tivermos tabela de projetos
      feriasPendentes,
      mediaSalarial
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
