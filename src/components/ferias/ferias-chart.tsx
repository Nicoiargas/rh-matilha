"use client";

import { useEffect, useState } from "react";

export function FeriasChart() {
  const [ferias, setFerias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const response = await fetch('/api/ferias');
        if (response.ok) {
          const data = await response.json();
          setFerias(data);
        }
      } catch (error) {
        console.error('Erro ao buscar férias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFerias();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center text-gray-500">
          Carregando dados...
        </div>
      </div>
    );
  }

  // Filtrar apenas férias aprovadas
  const feriasAprovadas = ferias.filter(f => f.status === 'APROVADA');
  
  // Obter data atual
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Criar array com os próximos 12 meses
  const proximos12Meses: Array<{
    mes: string;
    ano: number;
    mesNumero: number;
    quantidade: number;
    funcionarios: Array<{
      nome: string;
      dias: number;
      periodo: string;
    }>;
  }> = [];
  for (let i = 0; i < 12; i++) {
    const mes = (mesAtual + i) % 12;
    const ano = mesAtual + i >= 12 ? anoAtual + 1 : anoAtual;
    const nomeMes = new Date(ano, mes, 1).toLocaleString('pt-BR', { month: 'short' });
    
    proximos12Meses.push({
      mes: nomeMes,
      ano: ano,
      mesNumero: mes,
      quantidade: 0,
      funcionarios: []
    });
  }
  
  // Preencher dados das férias aprovadas
  feriasAprovadas.forEach(feria => {
    const dataInicio = new Date(feria.dataInicio);
    const mes = dataInicio.getMonth();
    const ano = dataInicio.getFullYear();
    
    const mesEncontrado = proximos12Meses.find(item => 
      item.mesNumero === mes && item.ano === ano
    );
    
    if (mesEncontrado) {
      mesEncontrado.quantidade += 1;
      mesEncontrado.funcionarios.push({
        nome: feria.funcionario.nome,
        dias: feria.diasSolicitados,
        periodo: `${new Date(feria.dataInicio).toLocaleDateString('pt-BR')} a ${new Date(feria.dataFim).toLocaleDateString('pt-BR')}`
      });
    }
  });
  
  // Encontrar o valor máximo para normalizar as barras
  const maxQuantidade = Math.max(...proximos12Meses.map(m => m.quantidade), 1);
  
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Distribuição de Férias - Próximos 12 Meses</h3>
        <p className="text-sm text-gray-600">Passe o mouse sobre as barras para ver os detalhes</p>
      </div>
      
      {/* Gráfico de Barras */}
      <div className="h-80 flex items-end justify-between space-x-2 px-4">
        {proximos12Meses.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group relative">
            {/* Barra */}
            <div 
              className="w-full bg-green-500 rounded-t-sm transition-all duration-200 hover:bg-green-600 cursor-pointer"
              style={{ 
                height: `${(item.quantidade / maxQuantidade) * 200}px`,
                minHeight: item.quantidade > 0 ? '20px' : '0px'
              }}
            />
            
            {/* Tooltip */}
            {item.quantidade > 0 && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg max-w-xs">
                  <div className="font-semibold mb-2">{item.quantidade} funcionário(s)</div>
                  <div className="space-y-1">
                    {item.funcionarios.map((f: any, fIndex: number) => (
                      <div key={fIndex} className="text-gray-200">
                        • {f.nome}: {f.dias} dias
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
            
            {/* Label do mês */}
            <div className="mt-2 text-xs text-gray-600 font-medium text-center">
              {item.mes}
              <br />
              <span className="text-gray-400">{item.ano}</span>
            </div>
            
            {/* Valor */}
            <div className="mt-1 text-xs font-bold text-green-600">
              {item.quantidade}
            </div>
          </div>
        ))}
      </div>
      
      {/* Estatísticas resumidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {feriasAprovadas.length}
          </div>
          <div className="text-sm text-green-700">Total de Férias Aprovadas</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {proximos12Meses.filter(d => d.quantidade > 0).length}
          </div>
          <div className="text-sm text-blue-700">Meses com Férias</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {feriasAprovadas.reduce((total, f) => total + f.diasSolicitados, 0)}
          </div>
          <div className="text-sm text-purple-700">Total de Dias</div>
        </div>
      </div>
    </div>
  );
}
