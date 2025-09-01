import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departamentos = await prisma.funcionario.groupBy({
      by: ['departamento'],
      _count: {
        departamento: true
      },
      orderBy: {
        _count: {
          departamento: 'desc'
        }
      }
    })

    const data = departamentos.map(dept => ({
      name: dept.departamento,
      value: dept._count.departamento,
      color: getRandomColor()
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getRandomColor() {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
