import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Buscar atividades recentes do banco de dados
    const [
      funcionariosRecentes,
      feriasRecentes,
      alteracoesSalariais,
      equipamentosRecentes
    ] = await Promise.all([
      // Funcionários contratados recentemente (últimos 30 dias)
      prisma.funcionario.findMany({
        where: {
          dataAdmissao: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          nome: true,
          cargo: true,
          departamento: true,
          dataAdmissao: true
        },
        orderBy: { dataAdmissao: 'desc' },
        take: 5
      }),
      
      // Férias aprovadas recentemente
      prisma.ferias.findMany({
        where: {
          status: 'APROVADA',
          dataAprovacao: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          funcionario: {
            select: {
              nome: true
            }
          }
        },
        orderBy: { dataAprovacao: 'desc' },
        take: 5
      }),
      
      // Alterações salariais recentes
      prisma.alteracaoSalarial.findMany({
        orderBy: { dataAlteracao: 'desc' },
        take: 5,
        include: {
          funcionario: {
            select: {
              nome: true
            }
          }
        }
      }),
      
      // Equipamentos alocados recentemente
      prisma.equipamento.findMany({
        where: {
          status: 'EM_USO',
          dataEmprestimo: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          funcionario: {
            select: {
              nome: true
            }
          }
        },
        orderBy: { dataEmprestimo: 'desc' },
        take: 5
      })
    ])

    // Combinar e formatar todas as atividades
    const atividades = [
      // Funcionários contratados
      ...funcionariosRecentes.map(f => ({
        id: `func-${f.id}`,
        tipo: 'funcionario',
        titulo: 'Novo funcionário contratado',
        descricao: `${f.nome} foi contratado para ${f.cargo} em ${f.departamento}`,
        data: f.dataAdmissao.toISOString(),
        funcionario: f.nome,
        categoria: 'contratacao'
      })),
      
      // Férias aprovadas
      ...feriasRecentes.map(f => ({
        id: `ferias-${f.id}`,
        tipo: 'ferias',
        titulo: 'Férias aprovadas',
        descricao: `Férias de ${f.funcionario.nome} foram aprovadas`,
        data: f.dataAprovacao!.toISOString(),
        funcionario: f.funcionario.nome,
        categoria: 'ferias'
      })),
      
      // Alterações salariais
      ...alteracoesSalariais.map(a => ({
        id: `salario-${a.id}`,
        tipo: 'salario',
        titulo: 'Alteração salarial',
        descricao: `Salário de ${a.funcionario.nome} foi alterado`,
        data: a.dataAlteracao.toISOString(),
        funcionario: a.funcionario.nome,
        categoria: 'salario'
      })),
      
      // Equipamentos alocados
      ...equipamentosRecentes.map(e => ({
        id: `equip-${e.id}`,
        tipo: 'equipamento',
        titulo: 'Equipamento alocado',
        descricao: `${e.descricao} foi alocado para ${e.funcionario?.nome || 'N/A'}`,
        data: e.dataEmprestimo!.toISOString(),
        funcionario: e.funcionario?.nome || 'N/A',
        categoria: 'equipamento'
      }))
    ]

    // Ordenar por data (mais recentes primeiro) e limitar a 10 atividades
    const atividadesOrdenadas = atividades
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 10)

    return NextResponse.json(atividadesOrdenadas)
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
