'use client'

import { Mail, Send, Settings, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Dispatcher
              </h1>
              <p className="text-sm text-gray-500">Plataforma de Envio de E-mails</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <Send className="h-4 w-4 mr-2" />
                Enviar E-mail
              </Button>
            </Link>
            <Link href="/whatsapp">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </Link>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}






