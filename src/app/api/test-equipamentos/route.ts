import { NextRequest, NextResponse } from 'next/server';

// API de teste simples - sem Prisma por enquanto
export async function GET() {
  return NextResponse.json({ message: 'API de teste funcionando!' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test API - Body recebido:', body);
    
    // Simular sucesso
    return NextResponse.json({
      id: 'test-' + Date.now(),
      tipo: body.tipo,
      descricao: body.descricao,
      marca: body.marca,
      modelo: body.modelo,
      status: 'DISPONIVEL',
      message: 'Equipamento criado com sucesso (teste)'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Test API - Erro:', error);
    return NextResponse.json({ error: 'Erro na API de teste' }, { status: 500 });
  }
}
