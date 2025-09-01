import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Verificar se já existem dados
  const funcionariosExistentes = await prisma.funcionario.count()
  if (funcionariosExistentes > 0) {
    console.log('⚠️  Dados já existem no banco. Pulando criação...')
    console.log('✅ Seed concluído com sucesso!')
    return
  }

  // Limpar dados existentes
  await prisma.alteracaoSalarial.deleteMany()
  await prisma.ferias.deleteMany()
  await prisma.equipamento.deleteMany()
  await prisma.funcionario.deleteMany()
  await prisma.empresa.deleteMany()

  // Criar empresa
  const empresa = await prisma.empresa.create({
    data: {
      nomeFantasia: 'Matilha',
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Matilha Tecnologia Ltda',
      email: 'contato@matilha.com.br',
      telefone: '(11) 99999-9999',
      site: 'https://matilha.com.br',
      responsavelRH: 'Administrador RH',
      endereco: {
        create: {
          cep: '01234-567',
          rua: 'Rua das Flores',
          numero: '123',
          complemento: 'Sala 1001',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
        }
      }
    }
  })

  console.log('🏢 Empresa criada:', empresa.nomeFantasia)

  // Criar funcionários
  const nicolas = await prisma.funcionario.create({
    data: {
      nome: 'Nicolas Iargas',
      cpf: '123.456.789-00',
      emailCorporativo: 'nicolas@matilha.com.br',
      emailPessoal: 'nicolas.pessoal@gmail.com',
      telefone: '(11) 98888-8888',
      telefoneCorporativo: '(11) 3333-8888',
      teams: 'nicolas.iargas@matilha.com.br',
      salario: 8500.00,
      dataAdmissao: new Date('2024-01-15'),
      departamento: 'Desenvolvimento',
      cargo: 'Desenvolvedor Full Stack',
      status: 'ATIVO',
      endereco: {
        create: {
          cep: '04567-890',
          rua: 'Av. Paulista',
          numero: '1000',
          complemento: 'Apto 1501',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
        }
      }
    }
  })

  const guilherme = await prisma.funcionario.create({
    data: {
      nome: 'Guilherme Utko',
      cpf: '987.654.321-00',
      cnpj: '98.765.432/0001-10',
      emailCorporativo: 'guilherme@matilha.com.br',
      emailPessoal: 'guilherme.pessoal@gmail.com',
      telefone: '(11) 97777-7777',
      telefoneCorporativo: '(11) 3333-7777',
      teams: 'guilherme.utko@matilha.com.br',
      salario: 7200.00,
      chavePix: 'guilherme@matilha.com.br',
      dataAdmissao: new Date('2024-02-01'),
      departamento: 'Desenvolvimento',
      cargo: 'Desenvolvedor Frontend',
      status: 'ATIVO',
      endereco: {
        create: {
          cep: '01234-567',
          rua: 'Rua Augusta',
          numero: '500',
          complemento: 'Apto 2001',
          bairro: 'Consolação',
          cidade: 'São Paulo',
          estado: 'SP',
        }
      }
    }
  })

  console.log('👥 Funcionários criados:', nicolas.nome, 'e', guilherme.nome)

  // Criar alterações salariais
  await prisma.alteracaoSalarial.create({
    data: {
      funcionarioId: nicolas.id,
      salarioAnterior: 8000.00,
      novoSalario: 8500.00,
      percentualAumento: 6.25,
      dataAlteracao: new Date('2024-06-01'),
      motivo: 'Promoção e aumento de responsabilidades',
      aprovadoPor: 'RH',
      observacoes: 'Promoção para desenvolvedor sênior'
    }
  })

  await prisma.alteracaoSalarial.create({
    data: {
      funcionarioId: guilherme.id,
      salarioAnterior: 6800.00,
      novoSalario: 7200.00,
      percentualAumento: 5.88,
      dataAlteracao: new Date('2024-05-15'),
      motivo: 'Ajuste anual',
      aprovadoPor: 'RH',
      observacoes: 'Ajuste anual de salário'
    }
  })

  console.log('💰 Alterações salariais criadas')

  // Criar férias
  await prisma.ferias.create({
    data: {
      funcionarioId: nicolas.id,
      ano: 2024,
      dataInicio: new Date('2024-07-01'),
      dataFim: new Date('2024-07-15'),
      diasSolicitados: 15,
      diasDisponiveis: 30,
      status: 'APROVADA',
      observacoes: 'Férias de verão'
    }
  })

  await prisma.ferias.create({
    data: {
      funcionarioId: guilherme.id,
      ano: 2024,
      dataInicio: new Date('2024-08-01'),
      dataFim: new Date('2024-08-10'),
      diasSolicitados: 10,
      diasDisponiveis: 30,
      status: 'APROVADA',
      observacoes: 'Férias de inverno'
    }
  })

  console.log('🏖️ Férias criadas')

  // Criar equipamentos
  await prisma.equipamento.create({
    data: {
      tipo: 'NOTEBOOK',
      descricao: 'MacBook Pro 16" M2',
      marca: 'Apple',
      modelo: 'MacBook Pro 16" M2',
      numeroSerie: 'MBP16-M2-001',
      dataEmprestimo: new Date('2024-01-15'),
      status: 'EM_USO',
      funcionarioId: nicolas.id,
      observacoes: 'Notebook para desenvolvimento'
    }
  })

  await prisma.equipamento.create({
    data: {
      tipo: 'MONITOR',
      descricao: 'Monitor Dell 27" 4K',
      marca: 'Dell',
      modelo: 'UltraSharp 27" 4K',
      numeroSerie: 'DELL-27-4K-001',
      dataEmprestimo: new Date('2024-02-01'),
      status: 'EM_USO',
      funcionarioId: guilherme.id,
      observacoes: 'Monitor para desenvolvimento frontend'
    }
  })

  console.log('💻 Equipamentos criados')

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
