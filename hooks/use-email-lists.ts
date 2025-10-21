'use client'

import { useState, useEffect } from 'react'

export interface EmailList {
  id: string
  name: string
  emails: string[]
  createdAt: Date
  updatedAt: Date
  description?: string
}

export interface UseEmailListsReturn {
  emailLists: EmailList[]
  saveEmailList: (name: string, emails: string[], description?: string) => string
  updateEmailList: (id: string, name: string, emails: string[], description?: string) => void
  deleteEmailList: (id: string) => void
  loadEmailList: (id: string) => EmailList | undefined
  getEmailListById: (id: string) => EmailList | undefined
}

export function useEmailLists(): UseEmailListsReturn {
  const [emailLists, setEmailLists] = useState<EmailList[]>([])

  // Carregar listas do localStorage na inicialização
  useEffect(() => {
    const stored = localStorage.getItem('email-lists')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Converter timestamps de volta para Date objects
        const listsWithDates = parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt)
        }))
        setEmailLists(listsWithDates)
      } catch (error) {
        console.error('Erro ao carregar listas de e-mail:', error)
      }
    }
  }, [])

  // Salvar listas no localStorage sempre que mudarem
  useEffect(() => {
    if (emailLists.length > 0) {
      localStorage.setItem('email-lists', JSON.stringify(emailLists))
    }
  }, [emailLists])

  const saveEmailList = (name: string, emails: string[], description?: string): string => {
    const newList: EmailList = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      emails: Array.from(new Set(emails)), // Remove duplicatas
      createdAt: new Date(),
      updatedAt: new Date(),
      description
    }
    
    setEmailLists(prev => [newList, ...prev])
    return newList.id
  }

  const updateEmailList = (id: string, name: string, emails: string[], description?: string) => {
    setEmailLists(prev => prev.map(list => 
      list.id === id 
        ? { 
            ...list, 
            name, 
            emails: Array.from(new Set(emails)), // Remove duplicatas
            description,
            updatedAt: new Date() 
          }
        : list
    ))
  }

  const deleteEmailList = (id: string) => {
    setEmailLists(prev => prev.filter(list => list.id !== id))
  }

  const loadEmailList = (id: string): EmailList | undefined => {
    return emailLists.find(list => list.id === id)
  }

  const getEmailListById = (id: string): EmailList | undefined => {
    return emailLists.find(list => list.id === id)
  }

  return {
    emailLists,
    saveEmailList,
    updateEmailList,
    deleteEmailList,
    loadEmailList,
    getEmailListById
  }
}
