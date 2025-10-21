'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFailureLogs, FailureLog } from '@/hooks/use-failure-logs'
import { Trash2, AlertTriangle, X, Copy, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FailureLogsProps {
  onRemoveFromList?: (emails: string[]) => void
}

export function FailureLogs({ onRemoveFromList }: FailureLogsProps) {
  const { failureLogs, removeFailureLog, clearAllLogs, getFailedEmails } = useFailureLogs()
  const { toast } = useToast()
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const handleSelectLog = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLogs.length === failureLogs.length) {
      setSelectedLogs([])
    } else {
      setSelectedLogs(failureLogs.map(log => log.id))
    }
  }

  const handleRemoveSelected = () => {
    const emailsToRemove = failureLogs
      .filter(log => selectedLogs.includes(log.id))
      .map(log => log.email)
    
    selectedLogs.forEach(logId => removeFailureLog(logId))
    setSelectedLogs([])
    
    if (onRemoveFromList && emailsToRemove.length > 0) {
      onRemoveFromList(emailsToRemove)
    }
    
    toast({
      title: "E-mails removidos",
      description: `${emailsToRemove.length} e-mails foram removidos da lista de falhas.`,
    })
  }

  const handleClearAll = () => {
    clearAllLogs()
    setSelectedLogs([])
    toast({
      title: "Logs limpos",
      description: "Todos os logs de falhas foram removidos.",
    })
  }

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 2000)
      toast({
        title: "E-mail copiado",
        description: `${email} foi copiado para a área de transferência.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o e-mail.",
        variant: "destructive",
      })
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  const getErrorType = (error: string) => {
    if (error.includes('bounced') || error.includes('bounce')) return 'Bounce'
    if (error.includes('invalid') || error.includes('invalid email')) return 'E-mail inválido'
    if (error.includes('blocked') || error.includes('block')) return 'Bloqueado'
    if (error.includes('spam') || error.includes('spam')) return 'Spam'
    if (error.includes('quota') || error.includes('limit')) return 'Limite excedido'
    return 'Erro desconhecido'
  }

  if (failureLogs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Nenhum log de falha encontrado
        </h3>
        <p className="text-gray-500">
          Os e-mails que falharem aparecerão aqui para análise.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">
            Logs de Falhas ({failureLogs.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const testEmail = `teste-${Date.now()}@exemplo.com`
              const testError = 'Erro de teste - e-mail inválido'
              addFailureLog(testEmail, testError, 'Teste Manual')
              toast({
                title: "Log de teste adicionado",
                description: "Um log de teste foi criado para verificar o funcionamento.",
              })
            }}
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            🧪 Teste
          </Button>
          {selectedLogs.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remover Selecionados ({selectedLogs.length})
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedLogs.length === failureLogs.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700"
          >
            Limpar Todos
          </Button>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {failureLogs.map((log) => (
          <Card 
            key={log.id} 
            className={`p-4 transition-colors ${
              selectedLogs.includes(log.id) 
                ? 'bg-red-50 border-red-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedLogs.includes(log.id)}
                  onChange={() => handleSelectLog(log.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {log.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyEmail(log.email)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedEmail === log.email ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getErrorType(log.error) === 'Bounce' ? 'bg-red-100 text-red-700' :
                      getErrorType(log.error) === 'E-mail inválido' ? 'bg-yellow-100 text-yellow-700' :
                      getErrorType(log.error) === 'Bloqueado' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getErrorType(log.error)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 break-words">
                    {log.error}
                  </p>
                  
                  {log.campaign && (
                    <p className="text-xs text-gray-500 mt-1">
                      Campanha: {log.campaign}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFailureLog(log.id)}
                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total de falhas: <strong>{failureLogs.length}</strong>
          </span>
          <span className="text-gray-600">
            Selecionados: <strong>{selectedLogs.length}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
