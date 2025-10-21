import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

// Configure SendGrid
const apiKey = process.env.SENDGRID_API_KEY
if (!apiKey) {
  console.error('SENDGRID_API_KEY não encontrada nas variáveis de ambiente')
}

sgMail.setApiKey(apiKey!)

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DO ENVIO DE E-MAIL ===')
    
    const body = await request.json()
    console.log('Dados recebidos:', JSON.stringify(body, null, 2))
    
    const { to, subject, fromName, fromEmail, htmlContent } = body

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      console.error('Erro: Lista de destinatários vazia')
      return NextResponse.json(
        { error: 'Lista de destinatários é obrigatória' },
        { status: 400 }
      )
    }

    if (!subject || !fromName || !fromEmail || !htmlContent) {
      console.error('Erro: Campos obrigatórios faltando')
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(fromEmail)) {
      console.error('Erro: E-mail do remetente inválido:', fromEmail)
      return NextResponse.json(
        { error: 'E-mail do remetente inválido' },
        { status: 400 }
      )
    }

    // Validate and filter valid emails
    const validEmails = []
    const invalidEmails = []
    
    for (const email of to) {
      if (emailRegex.test(email)) {
        validEmails.push(email)
      } else {
        invalidEmails.push(email)
        console.warn('E-mail inválido ignorado:', email)
      }
    }

    if (validEmails.length === 0) {
      console.error('Nenhum e-mail válido encontrado')
      return NextResponse.json(
        { error: 'Nenhum e-mail válido encontrado na lista' },
        { status: 400 }
      )
    }

    console.log(`Enviando para ${validEmails.length} e-mails válidos`)
    if (invalidEmails.length > 0) {
      console.log(`Ignorando ${invalidEmails.length} e-mails inválidos:`, invalidEmails)
    }

    // Send emails individually to handle errors gracefully
    const results = {
      sent: [] as Array<{ email: string; status: string; response: any }>,
      failed: [] as Array<{ email: string; error: string; status: string }>,
      invalid: invalidEmails
    }

    for (const email of validEmails) {
      try {
        // Check if request was aborted
        if (request.signal?.aborted) {
          console.log('🚫 Envio cancelado pelo usuário')
          break
        }

        const msg = {
          to: email,
          from: {
            email: fromEmail,
            name: fromName,
          },
          subject: subject,
          html: htmlContent,
        }

        console.log(`Enviando para: ${email}`)
        const response = await sgMail.send(msg)
        results.sent.push({ email, status: 'sent', response })
        console.log(`✅ Enviado com sucesso para: ${email}`)
      } catch (error: any) {
        if (request.signal?.aborted) {
          console.log('🚫 Envio cancelado pelo usuário')
          break
        }
        console.error(`❌ Erro ao enviar para ${email}:`, error.message)
        results.failed.push({ 
          email, 
          error: error.message,
          status: 'failed'
        })
      }
    }

    console.log('Resultado final:', {
      enviados: results.sent.length,
      falharam: results.failed.length,
      inválidos: results.invalid.length
    })

    return NextResponse.json({
      success: true,
      message: `Processamento concluído: ${results.sent.length} enviados, ${results.failed.length} falharam, ${results.invalid.length} inválidos`,
      results: {
        sent: results.sent.length,
        failed: results.failed.length,
        invalid: results.invalid.length,
        details: {
          sent: results.sent.map(r => r.email),
          failed: results.failed.map(r => ({ email: r.email, error: r.error })),
          invalid: results.invalid
        }
      }
    })

  } catch (error: any) {
    console.error('=== ERRO AO ENVIAR E-MAIL ===')
    console.error('Erro completo:', error)
    
    // Handle SendGrid specific errors
    if (error.response) {
      const { body } = error.response
      console.error('Erro do SendGrid:', body)
      return NextResponse.json(
        { 
          error: 'Erro do SendGrid',
          details: body?.errors || body,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
