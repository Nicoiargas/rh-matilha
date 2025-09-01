import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Buscar atividades reais do banco
    const [
      funcionariosRecentes,
      feriasRecentes,
      alteracoesSalariaisRecentes
    ] = await Promise.all([
      prisma.funcionario.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          cargo: true,
          departamento: true,
          createdAt: true
        }
      }),
      prisma.ferias.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          funcionario: {
            select: {
              nome: true,
              cargo: true,
              departamento: true
            }
          }
        }
      }),
      prisma.alteracaoSalarial.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          funcionario: {
            select: {
              nome: true,
              cargo: true,
              departamento: true
            }
          }
        }
      })
    ])

    // Formatar atividades
    const atividades = []

    // Adicionar funcionários recentes
    funcionariosRecentes.forEach(funcionario => {
      atividades.push({
        id: `func-${funcionario.id}`,
        tipo: 'funcionario',
        titulo: 'Novo funcionário contratado',
        descricao: `${funcionario.nome} foi contratado para ${funcionario.departamento}`,
        data: funcionario.createdAt.toISOString(),
        funcionario: funcionario.nome,
      })
    })

    // Adicionar férias recentes
    feriasRecentes.forEach(ferias => {
      atividades.push({
        id: `ferias-${ferias.id}`,
        tipo: 'ferias',
        titulo: 'Solicitação de férias',
        descricao: `${ferias.funcionario.nome} solicitou férias de ${ferias.dataInicio.toLocaleDateString('pt-BR')} a ${ferias.dataFim.toLocaleDateString('pt-BR')}`,
        data: ferias.createdAt.toISOString(),
        funcionario: ferias.funcionario.nome,
      })
    })

    // Adicionar alterações salariais recentes
    alteracoesSalariaisRecentes.forEach(alteracao => {
      atividades.push({
        id: `salario-${alteracao.id}`,
        tipo: 'salario',
        titulo: 'Alteração salarial',
        descricao: `${alteracao.funcionario.nome} teve alteração salarial de R$ ${alteracao.salarioAnterior.toLocaleString('pt-BR')} para R$ ${alteracao.novoSalario.toLocaleString('pt-BR')}`,
        data: alteracao.createdAt.toISOString(),
        funcionario: alteracao.funcionario.nome,
      })
    })

    // Ordenar por data (mais recente primeiro)
    atividades.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

    // Retornar apenas as 10 mais recentes
    return NextResponse.json(atividades.slice(0, 10))
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
