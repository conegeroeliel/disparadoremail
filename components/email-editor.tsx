'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Eye, Code, Download, Upload } from 'lucide-react'

interface EmailEditorProps {
  htmlContent: string
  onHtmlChange: (html: string) => void
}

export function EmailEditor({ htmlContent, onHtmlChange }: EmailEditorProps) {
  const [activeTab, setActiveTab] = useState('editor')

  const defaultTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-mail Marketing</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e1e5e9;
            border-top: none;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e1e5e9;
            border-top: none;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bem-vindo!</h1>
        <p>Este é um exemplo de e-mail HTML</p>
    </div>
    <div class="content">
        <h2>Conteúdo Principal</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <a href="#" class="button">Clique Aqui</a>
    </div>
    <div class="footer">
        <p>&copy; 2024 Sua Empresa. Todos os direitos reservados.</p>
    </div>
</body>
</html>`

  const handleTemplateLoad = () => {
    onHtmlChange(defaultTemplate)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Editor de E-mail
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTemplateLoad}
            >
              <Upload className="h-4 w-4 mr-2" />
              Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([htmlContent], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'email-template.html'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 mx-6 mt-6">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="h-[calc(100vh-200px)] m-6 mt-0">
            <textarea
              value={htmlContent}
              onChange={(e) => onHtmlChange(e.target.value)}
              className="w-full h-full p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu HTML aqui..."
            />
          </TabsContent>
          
          <TabsContent value="preview" className="h-[calc(100vh-200px)] m-6 mt-0">
            <div className="h-full border rounded-lg overflow-hidden">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                title="Preview do E-mail"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}






