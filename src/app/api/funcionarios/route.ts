import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os funcionários
export async function GET() {
  try {
    // Timeout para evitar travamentos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );

    const queryPromise = prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        cpf: true,
        cnpj: true,
        emailPessoal: true,
        telefone: true,
        emailCorporativo: true,
        telefoneCorporativo: true,
        teams: true,
        cargo: true,
        departamento: true,
        salario: true,
        chavePix: true,
        status: true,
        dataAdmissao: true,
        endereco: {
          select: {
            rua: true,
            numero: true,
            complemento: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    const funcionarios = await Promise.race([queryPromise, timeoutPromise]) as any;

    return NextResponse.json(funcionarios)
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error)
    
    // Se for timeout, retornar erro específico
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Timeout - O banco de dados demorou muito para responder' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo funcionário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.nome || !body.cpf || !body.emailCorporativo || !body.telefone || !body.cargo || !body.departamento || !body.salario || !body.dataAdmissao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validar CPF único
    const cpfExistente = await prisma.funcionario.findUnique({
      where: { cpf: body.cpf }
    })

    if (cpfExistente) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    // Validar email único
    const emailExistente = await prisma.funcionario.findUnique({
      where: { emailCorporativo: body.emailCorporativo }
    })

    if (emailExistente) {
      return NextResponse.json(
        { error: 'Email corporativo já cadastrado' },
        { status: 400 }
      )
    }

    // Validar salário
    const salario = parseFloat(body.salario)
    if (isNaN(salario) || salario < 0) {
      return NextResponse.json(
        { error: 'Salário deve ser um valor válido maior que zero' },
        { status: 400 }
      )
    }

    // Validar data de admissão
    const dataAdmissao = new Date(body.dataAdmissao)
    if (isNaN(dataAdmissao.getTime())) {
      return NextResponse.json(
        { error: 'Data de admissão inválida' },
        { status: 400 }
      )
    }

    const funcionario = await prisma.funcionario.create({
      data: {
        cpf: body.cpf,
        cnpj: body.cnpj || null,
        nome: body.nome,
        emailCorporativo: body.emailCorporativo,
        emailPessoal: body.emailPessoal || null,
        telefone: body.telefone,
        telefoneCorporativo: body.telefoneCorporativo || null,
        teams: body.teams || null,
        dataAdmissao: dataAdmissao,
        cargo: body.cargo,
        departamento: body.departamento,
        salario: salario,
        chavePix: body.chavePix || null,
        observacoes: body.observacoes || null,
        status: body.status || 'ATIVO',
        endereco: body.endereco ? {
          create: {
            rua: body.endereco.rua,
            numero: body.endereco.numero,
            complemento: body.endereco.complemento || null,
            bairro: body.endereco.bairro,
            cidade: body.endereco.cidade,
            estado: body.endereco.estado,
            cep: body.endereco.cep
          }
        } : undefined
      },
      select: {
        id: true,
        nome: true,
        cpf: true,
        cnpj: true,
        emailCorporativo: true,
        telefone: true,
        cargo: true,
        departamento: true,
        salario: true,
        status: true,
        dataAdmissao: true,
        endereco: {
          select: {
            cidade: true,
            estado: true
          }
        }
      }
    })

    return NextResponse.json(funcionario, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar funcionário:', error)
    
    // Erro específico para violação de constraint único
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'CPF ou email já cadastrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
