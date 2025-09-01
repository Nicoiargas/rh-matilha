"use client";

import { useEffect, useState } from "react";

interface DepartamentoData {
  name: string;
  value: number;
  color: string;
}

export function DashboardChart() {
  const [data, setData] = useState<DepartamentoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch('/api/dashboard/departamentos');
      const departamentos = await response.json();
      setData(departamentos);
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      // Dados padrão caso a API falhe
      setData([
        { name: "Sem dados", value: 1, color: "#6B7280" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Nenhum funcionário cadastrado</div>
      </div>
    );
  }

  // Calcular total para porcentagens
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-[300px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Gráfico de pizza simplificado */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {data.map((entry, index) => {
              const percentage = (entry.value / total) * 100;
              const rotation = data
                .slice(0, index)
                .reduce((sum, item) => sum + (item.value / total) * 360, 0);
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: entry.color,
                    transform: `rotate(${rotation}deg)`,
                    clipPath: `polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)`
                  }}
                />
              );
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legenda */}
        <div className="flex flex-col justify-center space-y-3">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-700">{entry.name}</div>
                <div className="text-sm text-gray-500">
                  {entry.value} funcionários ({(entry.value / total * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
