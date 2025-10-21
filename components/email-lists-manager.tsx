'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEmailLists, EmailList } from '@/hooks/use-email-lists'
import { 
  Save, 
  Trash2, 
  Edit, 
  Copy, 
  Users, 
  Calendar, 
  FileText,
  Plus,
  X,
  Check,
  Upload,
  FileSpreadsheet
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EmailListsManagerProps {
  onLoadList?: (emails: string[]) => void
}

export function EmailListsManager({ onLoadList }: EmailListsManagerProps) {
  const { 
    emailLists, 
    saveEmailList, 
    updateEmailList, 
    deleteEmailList 
  } = useEmailLists()
  
  const { toast } = useToast()
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [newListEmails, setNewListEmails] = useState('')
  const [copiedListId, setCopiedListId] = useState<string | null>(null)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<string[]>([])
  const [csvProcessing, setCsvProcessing] = useState(false)

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a lista.",
        variant: "destructive",
      })
      return
    }

    const emails = newListEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.includes('@'))

    if (emails.length === 0) {
      toast({
        title: "E-mails obrigatórios",
        description: "Por favor, insira pelo menos um e-mail válido.",
        variant: "destructive",
      })
      return
    }

    saveEmailList(newListName, emails, newListDescription)
    
    toast({
      title: "Lista salva",
      description: `${newListName} foi salva com ${emails.length} e-mails.`,
    })

    // Limpar formulário
    setNewListName('')
    setNewListDescription('')
    setNewListEmails('')
    setIsCreating(false)
  }

  const handleEditList = (list: EmailList) => {
    setEditingId(list.id)
    setNewListName(list.name)
    setNewListDescription(list.description || '')
    setNewListEmails(list.emails.join('\n'))
  }

  const handleUpdateList = () => {
    if (!editingId || !newListName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a lista.",
        variant: "destructive",
      })
      return
    }

    const emails = newListEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.includes('@'))

    if (emails.length === 0) {
      toast({
        title: "E-mails obrigatórios",
        description: "Por favor, insira pelo menos um e-mail válido.",
        variant: "destructive",
      })
      return
    }

    updateEmailList(editingId, newListName, emails, newListDescription)
    
    toast({
      title: "Lista atualizada",
      description: `${newListName} foi atualizada com ${emails.length} e-mails.`,
    })

    // Limpar formulário
    setEditingId(null)
    setNewListName('')
    setNewListDescription('')
    setNewListEmails('')
  }

  const handleDeleteList = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a lista "${name}"?`)) {
      deleteEmailList(id)
      toast({
        title: "Lista excluída",
        description: `${name} foi excluída permanentemente.`,
      })
    }
  }

  const handleLoadList = (list: EmailList) => {
    if (onLoadList) {
      onLoadList(list.emails)
      toast({
        title: "Lista carregada",
        description: `${list.name} foi carregada com ${list.emails.length} e-mails.`,
      })
    }
  }

  const handleCopyEmails = async (emails: string[]) => {
    try {
      await navigator.clipboard.writeText(emails.join('\n'))
      toast({
        title: "E-mails copiados",
        description: `${emails.length} e-mails foram copiados para a área de transferência.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os e-mails.",
        variant: "destructive",
      })
    }
  }

  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCsvFile(file)
      processCsvFile(file)
    }
  }

  const processCsvFile = async (file: File) => {
    setCsvProcessing(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const emails: string[] = []
      
      // Processar cada linha do CSV
      for (const line of lines) {
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''))
        
        // Procurar por e-mails em qualquer coluna
        for (const column of columns) {
          if (column.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(column)) {
            emails.push(column)
          }
        }
      }
      
      // Remover duplicatas
      const uniqueEmails = Array.from(new Set(emails))
      setCsvPreview(uniqueEmails)
      
      if (uniqueEmails.length === 0) {
        toast({
          title: "Nenhum e-mail encontrado",
          description: "O arquivo CSV não contém e-mails válidos.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "CSV processado",
          description: `${uniqueEmails.length} e-mails encontrados no arquivo.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao processar CSV",
        description: "Não foi possível ler o arquivo CSV.",
        variant: "destructive",
      })
    } finally {
      setCsvProcessing(false)
    }
  }

  const handleCreateFromCsv = () => {
    if (!newListName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a lista.",
        variant: "destructive",
      })
      return
    }

    if (csvPreview.length === 0) {
      toast({
        title: "Nenhum e-mail",
        description: "Nenhum e-mail válido foi encontrado no CSV.",
        variant: "destructive",
      })
      return
    }

    saveEmailList(newListName, csvPreview, newListDescription)
    
    toast({
      title: "Lista criada",
      description: `${newListName} foi criada com ${csvPreview.length} e-mails do CSV.`,
    })

    // Limpar formulário
    setNewListName('')
    setNewListDescription('')
    setCsvFile(null)
    setCsvPreview([])
    setShowCsvUpload(false)
  }

  const handleCancelCsvUpload = () => {
    setShowCsvUpload(false)
    setCsvFile(null)
    setCsvPreview([])
    setNewListName('')
    setNewListDescription('')
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewListName('')
    setNewListDescription('')
    setNewListEmails('')
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">
            Listas de E-mails ({emailLists.length})
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCsvUpload(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Upload CSV
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Lista
          </Button>
        </div>
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                {editingId ? 'Editar Lista' : 'Nova Lista'}
              </h4>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listName">Nome da Lista</Label>
                <Input
                  id="listName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Clientes VIP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="listDescription">Descrição (opcional)</Label>
                <Input
                  id="listDescription"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Ex: Lista de clientes premium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listEmails">E-mails (um por linha)</Label>
              <Textarea
                id="listEmails"
                value={newListEmails}
                onChange={(e) => setNewListEmails(e.target.value)}
                placeholder="cliente1@email.com&#10;cliente2@email.com&#10;cliente3@email.com"
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdateList : handleCreateList}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de listas salvas */}
      {emailLists.length === 0 ? (
        <Card className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma lista salva
          </h3>
          <p className="text-gray-500">
            Crie sua primeira lista de e-mails para reutilizar.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emailLists.map((list) => (
            <Card key={list.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {list.name}
                    </h4>
                    {list.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {list.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditList(list)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteList(list.id, list.name)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {list.emails.length} e-mails
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(list.updatedAt)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleLoadList(list)}
                    className="flex-1"
                  >
                    Carregar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyEmails(list.emails)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para upload de CSV */}
      {showCsvUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Criar Lista a partir de CSV
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelCsvUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Upload do arquivo */}
                <div className="space-y-2">
                  <Label htmlFor="csv-upload">Selecionar arquivo CSV</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileSelect}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('csv-upload')?.click()}
                      disabled={csvProcessing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {csvProcessing ? 'Processando...' : 'Selecionar'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Formatos aceitos: .csv. O sistema detectará automaticamente e-mails em qualquer coluna.
                  </p>
                </div>

                {/* Preview dos e-mails encontrados */}
                {csvPreview.length > 0 && (
                  <div className="space-y-2">
                    <Label>E-mails encontrados ({csvPreview.length})</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {csvPreview.slice(0, 20).map((email, index) => (
                          <div key={index} className="text-sm text-gray-700 truncate">
                            {email}
                          </div>
                        ))}
                        {csvPreview.length > 20 && (
                          <div className="text-sm text-gray-500 col-span-2">
                            ... e mais {csvPreview.length - 20} e-mails
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações da lista */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="csvListName">Nome da Lista</Label>
                    <Input
                      id="csvListName"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Ex: Clientes do CSV"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="csvListDescription">Descrição (opcional)</Label>
                    <Input
                      id="csvListDescription"
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="Ex: Lista importada do CSV"
                    />
                  </div>
                </div>

                {csvPreview.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>{csvPreview.length}</strong> e-mails serão adicionados à nova lista.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateFromCsv}
                  disabled={csvPreview.length === 0 || !newListName.trim()}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Criar Lista
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelCsvUpload}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
