'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, Upload, Users, Mail, User, X, AlertTriangle, Save, FolderOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useFailureLogs } from '@/hooks/use-failure-logs'
import { useEmailLists } from '@/hooks/use-email-lists'

interface EmailFormProps {
  onSend: (data: {
    to: string[]
    subject: string
    fromName: string
    fromEmail: string
    htmlContent: string
  }) => void
  onCancel: () => void
  htmlContent: string
  isLoading?: boolean
  isCancelling?: boolean
  progress?: {
    sent: number
    total: number
    current: string
  }
  preloadedEmails?: string[] | null
}

export function EmailForm({ onSend, onCancel, htmlContent, isLoading = false, isCancelling = false, progress, preloadedEmails }: EmailFormProps) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [emailList, setEmailList] = useState<string[]>([])
  const { toast } = useToast()
  const { getFailedEmails, addFailureLog } = useFailureLogs()
  const { saveEmailList } = useEmailLists()
  const [showSaveList, setShowSaveList] = useState(false)
  const [listName, setListName] = useState('')
  const [listDescription, setListDescription] = useState('')

  // Carregar e-mails que falharam anteriormente
  useEffect(() => {
    const failedEmails = getFailedEmails()
    if (failedEmails.length > 0) {
      toast({
        title: "E-mails com falha anterior detectados",
        description: `${failedEmails.length} e-mails que falharam anteriormente estão na lista.`,
        variant: "destructive",
      })
    }
  }, [])

  // Carregar e-mails pré-carregados
  useEffect(() => {
    if (preloadedEmails && preloadedEmails.length > 0) {
      setEmailList(preloadedEmails)
      toast({
        title: "Lista carregada",
        description: `${preloadedEmails.length} e-mails foram carregados da lista salva.`,
      })
    }
  }, [preloadedEmails])

  const handleRemoveFailedEmails = () => {
    const failedEmails = getFailedEmails()
    const filteredList = emailList.filter(email => !failedEmails.includes(email))
    const removedCount = emailList.length - filteredList.length
    
    setEmailList(filteredList)
    
    if (removedCount > 0) {
      toast({
        title: "E-mails removidos",
        description: `${removedCount} e-mails que falharam anteriormente foram removidos da lista.`,
      })
    }
  }

  const handleSaveList = () => {
    if (!listName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a lista.",
        variant: "destructive",
      })
      return
    }

    if (emailList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos um e-mail antes de salvar.",
        variant: "destructive",
      })
      return
    }

    saveEmailList(listName, emailList, listDescription)
    
    toast({
      title: "Lista salva",
      description: `${listName} foi salva com ${emailList.length} e-mails.`,
    })

    setShowSaveList(false)
    setListName('')
    setListDescription('')
  }

  const handleLoadList = (emails: string[]) => {
    setEmailList(emails)
    toast({
      title: "Lista carregada",
      description: `${emails.length} e-mails foram carregados.`,
    })
  }

  const handleAddEmail = () => {
    if (to.trim() && to.includes('@')) {
      if (!emailList.includes(to.trim())) {
        setEmailList([...emailList, to.trim()])
        setTo('')
        toast({
          title: "E-mail adicionado",
          description: `${to.trim()} foi adicionado à lista.`,
        })
      } else {
        toast({
          title: "E-mail já existe",
          description: "Este e-mail já está na lista de destinatários.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(email => email !== emailToRemove))
    toast({
      title: "E-mail removido",
      description: `${emailToRemove} foi removido da lista.`,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const emails = text.split('\n').map(email => email.trim()).filter(email => email.includes('@'))
        setEmailList([...emailList, ...emails])
        toast({
          title: "Lista carregada",
          description: `${emails.length} e-mails foram adicionados à lista.`,
        })
      }
      reader.readAsText(file)
    }
  }

  const handleSend = () => {
    if (emailList.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos um destinatário.",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Assunto obrigatório",
        description: "Por favor, insira um assunto para o e-mail.",
        variant: "destructive",
      })
      return
    }

    if (!fromName.trim() || !fromEmail.trim()) {
      toast({
        title: "Remetente obrigatório",
        description: "Por favor, preencha os dados do remetente.",
        variant: "destructive",
      })
      return
    }

    if (!htmlContent.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Por favor, adicione conteúdo HTML ao e-mail.",
        variant: "destructive",
      })
      return
    }

    onSend({
      to: emailList,
      subject,
      fromName,
      fromEmail,
      htmlContent,
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Configurações de Envio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Remetente */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Remetente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">Nome do Remetente</Label>
              <Input
                id="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Sua Empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">E-mail do Remetente</Label>
              <Input
                id="fromEmail"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="contato@suaempresa.com"
              />
            </div>
          </div>
        </div>

        {/* Assunto */}
        <div className="space-y-2">
          <Label htmlFor="subject">Assunto do E-mail</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Digite o assunto do e-mail"
          />
        </div>

        {/* Destinatários */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Destinatários
          </h3>
          
          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload de Lista de E-mails</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Carregar
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Formatos aceitos: .txt, .csv (um e-mail por linha)
            </p>
          </div>

          {/* Adicionar e-mail individual */}
          <div className="space-y-2">
            <Label htmlFor="to">Adicionar E-mail Individual</Label>
            <div className="flex gap-2">
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="exemplo@email.com"
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de e-mails */}
          {emailList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lista de Destinatários ({emailList.length})</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveList(true)}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Salvar Lista
                  </Button>
                  {getFailedEmails().some(email => emailList.includes(email)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFailedEmails}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Remover Falhas
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                {emailList.map((email, index) => {
                  const isFailed = getFailedEmails().includes(email)
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded ${
                        isFailed 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isFailed && <AlertTriangle className="h-3 w-3 text-red-500" />}
                        <span className={`text-sm ${isFailed ? 'text-red-700' : ''}`}>
                          {email}
                        </span>
                        {isFailed && (
                          <span className="text-xs text-red-500 font-medium">
                            (Falhou anteriormente)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && progress && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                Enviando e-mails...
              </span>
              <span className="text-sm text-blue-600">
                {progress.sent} de {progress.total}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.sent / progress.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            {/* Current Email */}
            {progress.current && (
              <div className="text-xs text-blue-600 truncate">
                Enviando para: {progress.current}
              </div>
            )}
            
            {/* Percentage */}
            <div className="text-center text-sm font-medium text-blue-700">
              {progress.total > 0 ? Math.round((progress.sent / progress.total) * 100) : 0}% concluído
            </div>
          </div>
        )}

        {/* Botões de envio/cancelar */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                disabled={isCancelling}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Parar Envio
                  </>
                )}
              </Button>
              <Button
                disabled
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                size="lg"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleSend}
              disabled={emailList.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar E-mail ({emailList.length} destinatários)
            </Button>
          )}
        </div>
      </CardContent>

      {/* Modal para salvar lista */}
      {showSaveList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Salvar Lista de E-mails</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveList(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saveListName">Nome da Lista</Label>
                  <Input
                    id="saveListName"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="Ex: Clientes VIP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saveListDescription">Descrição (opcional)</Label>
                  <Input
                    id="saveListDescription"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    placeholder="Ex: Lista de clientes premium"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>{emailList.length}</strong> e-mails serão salvos nesta lista.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveList}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Lista
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveList(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}
