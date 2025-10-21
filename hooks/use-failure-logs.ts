'use client'

import { useState, useEffect } from 'react'

export interface FailureLog {
  id: string
  email: string
  error: string
  timestamp: Date
  campaign?: string
}

export interface UseFailureLogsReturn {
  failureLogs: FailureLog[]
  addFailureLog: (email: string, error: string, campaign?: string) => void
  removeFailureLog: (id: string) => void
  clearAllLogs: () => void
  getFailedEmails: () => string[]
}

export function useFailureLogs(): UseFailureLogsReturn {
  const [failureLogs, setFailureLogs] = useState<FailureLog[]>([])

  // Carregar logs do localStorage na inicialização
  useEffect(() => {
    const stored = localStorage.getItem('email-failure-logs')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Converter timestamps de volta para Date objects
        const logsWithDates = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
        setFailureLogs(logsWithDates)
      } catch (error) {
        console.error('Erro ao carregar logs de falha:', error)
      }
    }
  }, [])

  // Salvar logs no localStorage sempre que mudarem
  useEffect(() => {
    if (failureLogs.length > 0) {
      localStorage.setItem('email-failure-logs', JSON.stringify(failureLogs))
    }
  }, [failureLogs])

  const addFailureLog = (email: string, error: string, campaign?: string) => {
    const newLog: FailureLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      error,
      timestamp: new Date(),
      campaign
    }
    
    setFailureLogs(prev => [newLog, ...prev])
  }

  const removeFailureLog = (id: string) => {
    setFailureLogs(prev => prev.filter(log => log.id !== id))
  }

  const clearAllLogs = () => {
    setFailureLogs([])
    localStorage.removeItem('email-failure-logs')
  }

  const getFailedEmails = () => {
    return failureLogs.map(log => log.email)
  }

  return {
    failureLogs,
    addFailureLog,
    removeFailureLog,
    clearAllLogs,
    getFailedEmails
  }
}
