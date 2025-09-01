import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Timeout para evitar travamentos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 5000)
    );

    const queryPromise = prisma.funcionario.findMany({
      where: {
        status: 'ATIVO'
      },
      select: {
        id: true,
        nome: true,
        salario: true,
        cargo: true,
        departamento: true
      }
    });

    const funcionarios = await Promise.race([queryPromise, timeoutPromise]) as any;

    // Calcular estatísticas
    const salarios = funcionarios.map((f: any) => f.salario).filter((s: number) => s > 0);
    
    const stats = {
      totalFuncionarios: funcionarios.length,
      salarioMedio: salarios.length > 0 ? salarios.reduce((a: number, b: number) => a + b, 0) / salarios.length : 0,
      maiorSalario: salarios.length > 0 ? Math.max(...salarios) : 0,
      menorSalario: salarios.length > 0 ? Math.min(...salarios) : 0,
      totalFolha: salarios.reduce((a: number, b: number) => a + b, 0),
      funcionariosComSalario: salarios.length
    };

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas de salários:', error)
    
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
