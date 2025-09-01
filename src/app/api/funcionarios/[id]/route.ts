import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do funcionário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      include: {
        endereco: true,
        beneficios: true,
        equipamentos: true,
        projetos: true,
        ferias: true,
        alteracoesSalariais: true,
        contratos: true,
      }
    })

    if (!funcionario) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Excluir o funcionário (o Prisma vai excluir automaticamente os relacionamentos devido ao onDelete: Cascade)
    await prisma.funcionario.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Funcionário excluído com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID do funcionário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o funcionário existe
    const funcionarioExistente = await prisma.funcionario.findUnique({
      where: { id }
    })

    if (!funcionarioExistente) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    // Validar dados obrigatórios
    const {
      nome,
      cpf,
      emailCorporativo,
      telefone,
      dataAdmissao,
      cargo,
      departamento,
      salario,
      status
    } = body

    if (!nome || !cpf || !emailCorporativo || !telefone || !dataAdmissao || !cargo || !departamento || !salario || !status) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se CPF já existe em outro funcionário
    if (cpf !== funcionarioExistente.cpf) {
      const cpfExistente = await prisma.funcionario.findUnique({
        where: { cpf }
      })
      if (cpfExistente) {
        return NextResponse.json(
          { error: 'CPF já cadastrado para outro funcionário' },
          { status: 400 }
        )
      }
    }

    // Verificar se email já existe em outro funcionário
    if (emailCorporativo !== funcionarioExistente.emailCorporativo) {
      const emailExistente = await prisma.funcionario.findUnique({
        where: { emailCorporativo }
      })
      if (emailExistente) {
        return NextResponse.json(
          { error: 'Email corporativo já cadastrado para outro funcionário' },
          { status: 400 }
        )
      }
    }

    // Validar salário
    if (salario <= 0) {
      return NextResponse.json(
        { error: 'Salário deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Atualizar funcionário
    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id },
      data: {
        nome,
        cpf,
        cnpj: body.cnpj || null,
        emailCorporativo,
        emailPessoal: body.emailPessoal || null,
        telefone,
        telefoneCorporativo: body.telefoneCorporativo || null,
        teams: body.teams || null,
        dataAdmissao: new Date(dataAdmissao),
        dataDemissao: body.dataDemissao ? new Date(body.dataDemissao) : null,
        cargo,
        departamento,
        salario: parseFloat(salario),
        chavePix: body.chavePix || null,
        status,
        observacoes: body.observacoes || null,
      }
    })

    return NextResponse.json(funcionarioAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
