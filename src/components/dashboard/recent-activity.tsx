'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, DollarSign, Monitor } from 'lucide-react'

interface Atividade {
  id: string
  tipo: 'funcionario' | 'ferias' | 'salario' | 'equipamento'
  titulo: string
  descricao: string
  data: string
  funcionario: string
}

export function RecentActivity() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAtividades = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/atividades')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar atividades')
        }
        
        const data = await response.json()
        setAtividades(data)
      } catch (err) {
        console.error('Erro ao buscar atividades:', err)
        setError('Erro ao carregar atividades')
      } finally {
        setLoading(false)
      }
    }

    fetchAtividades()
  }, [])

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'funcionario':
        return <Users className="h-4 w-4" />
      case 'ferias':
        return <Calendar className="h-4 w-4" />
      case 'salario':
        return <DollarSign className="h-4 w-4" />
      case 'equipamento':
        return <Monitor className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'funcionario':
        return 'default'
      case 'ferias':
        return 'secondary'
      case 'salario':
        return 'destructive'
      case 'equipamento':
        return 'outline'
      default:
        return 'default'
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - data.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Erro ao carregar atividades</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline mt-2"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (atividades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma atividade recente</p>
            <p className="text-sm">As atividades aparecerão aqui conforme você usar o sistema</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {atividades.map((atividade) => (
            <div key={atividade.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getIcone(atividade.tipo)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {atividade.titulo}
                  </p>
                  <Badge variant={getBadgeVariant(atividade.tipo)} className="text-xs">
                    {atividade.tipo}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {atividade.descricao}
                </p>
                <p className="text-xs text-gray-400">
                  {formatarData(atividade.data)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
