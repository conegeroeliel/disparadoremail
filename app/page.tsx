'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { EmailComposer } from '@/components/email-composer'
import { FailureLogs } from '@/components/failure-logs'
import { EmailListsManager } from '@/components/email-lists-manager'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { useFailureLogs } from '@/hooks/use-failure-logs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [progress, setProgress] = useState({ sent: 0, total: 0, current: '' })
  const [loadEmailList, setLoadEmailList] = useState<string[] | null>(null)
  const { toast } = useToast()
  const { addFailureLog } = useFailureLogs()

  const handleLoadEmailList = (emails: string[]) => {
    setLoadEmailList(emails)
    // Limpar a lista após carregar para evitar recarregamento
    setTimeout(() => setLoadEmailList(null), 100)
  }

  const handleCancel = () => {
    if (abortController) {
      setIsCancelling(true)
      abortController.abort()
      toast({
        title: "Cancelando envio...",
        description: "O envio será interrompido em alguns segundos.",
      })
    }
  }

  const handleSend = async (data: {
    to: string[]
    subject: string
    fromName: string
    fromEmail: string
    htmlContent: string
  }) => {
    const controller = new AbortController()
    setAbortController(controller)
    setIsLoading(true)
    setIsCancelling(false)
    setProgress({ sent: 0, total: data.to.length, current: '' })
    
    try {
      const response = await fetch('/api/send-email-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Erro ao iniciar o envio')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Erro ao ler a resposta')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6))
              
              switch (eventData.type) {
                case 'start':
                  setProgress({ sent: 0, total: eventData.total, current: '' })
                  break
                  
                case 'progress':
                  setProgress(prev => ({
                    ...prev,
                    current: eventData.current,
                    sent: eventData.sent
                  }))
                  break
                  
                case 'sent':
                  setProgress(prev => ({
                    ...prev,
                    sent: eventData.sent
                  }))
                  break
                  
                case 'failed':
                  setProgress(prev => ({
                    ...prev,
                    sent: eventData.sent
                  }))
                  // Adicionar falha aos logs
                  addFailureLog(eventData.email, eventData.error, data.subject)
                  break
                  
                case 'complete':
                  const { results } = eventData
                  
                  if (results.failed > 0 || results.invalid > 0) {
                    toast({
                      title: "Envio concluído com avisos",
                      description: `✅ ${results.sent} enviados | ❌ ${results.failed} falharam | ⚠️ ${results.invalid} inválidos`,
                    })
                  } else {
                    toast({
                      title: "Todos os e-mails enviados com sucesso!",
                      description: `${results.sent} e-mails foram enviados.`,
                    })
                  }
                  break
                  
                case 'cancelled':
                  toast({
                    title: "Envio cancelado",
                    description: `Enviados ${eventData.sent} de ${eventData.total} e-mails antes de cancelar.`,
                  })
                  break
                  
                case 'error':
                  throw new Error(eventData.error)
              }
            } catch (parseError) {
              console.error('Erro ao processar evento:', parseError)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Envio cancelado",
          description: `Enviados ${progress.sent} de ${progress.total} e-mails antes de cancelar.`,
        })
      } else {
        toast({
          title: "Erro ao enviar e-mails",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      setIsCancelling(false)
      setAbortController(null)
      setProgress({ sent: 0, total: 0, current: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="compose" className="h-[calc(100vh-120px)]">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="compose">Criar e Enviar E-mail</TabsTrigger>
            <TabsTrigger value="lists">Gerenciar Listas</TabsTrigger>
            <TabsTrigger value="logs">Logs de Falhas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="h-full">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Criar e Enviar E-mail
                </h2>
                <p className="text-gray-600">
                  Editor HTML • Preview • Configurações de Envio
                </p>
              </div>
              <EmailComposer 
                onSend={handleSend}
                onCancel={handleCancel}
                isLoading={isLoading}
                isCancelling={isCancelling}
                progress={progress}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="lists" className="h-full">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Gerenciar Listas
                </h2>
                <p className="text-gray-600">
                  Salve e gerencie suas listas de e-mails para reutilização
                </p>
              </div>
              <EmailListsManager onLoadList={handleLoadEmailList} />
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="h-full">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Logs de Falhas
                </h2>
                <p className="text-gray-600">
                  Visualize e gerencie e-mails que falharam no envio
                </p>
              </div>
              <FailureLogs />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
