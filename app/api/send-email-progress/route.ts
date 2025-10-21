import { NextRequest } from 'next/server'
import sgMail from '@sendgrid/mail'

// Configure SendGrid
const apiKey = process.env.SENDGRID_API_KEY
if (!apiKey) {
  console.error('SENDGRID_API_KEY não encontrada nas variáveis de ambiente')
}

sgMail.setApiKey(apiKey!)

export async function POST(request: NextRequest) {
  const { to, subject, fromName, fromEmail, htmlContent } = await request.json()

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      const sendProgress = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Validate and filter valid emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const validEmails = to.filter((email: string) => emailRegex.test(email))
        const invalidEmails = to.filter((email: string) => !emailRegex.test(email))

        sendProgress({
          type: 'start',
          total: validEmails.length,
          invalid: invalidEmails.length
        })

        const results = {
          sent: [] as Array<{ email: string; status: string; response: any }>,
          failed: [] as Array<{ email: string; error: string; status: string }>,
          invalid: invalidEmails
        }

        for (let i = 0; i < validEmails.length; i++) {
          const email = validEmails[i]
          
          // Check if request was aborted
          if (request.signal?.aborted) {
            sendProgress({
              type: 'cancelled',
              sent: results.sent.length,
              total: validEmails.length
            })
            break
          }

          try {
            sendProgress({
              type: 'progress',
              current: email,
              sent: results.sent.length,
              total: validEmails.length,
              index: i + 1
            })

            const msg = {
              to: email,
              from: {
                email: fromEmail,
                name: fromName,
              },
              subject: subject,
              html: htmlContent,
            }

            const response = await sgMail.send(msg)
            results.sent.push({ email, status: 'sent', response })
            
            sendProgress({
              type: 'sent',
              email: email,
              sent: results.sent.length,
              total: validEmails.length
            })
          } catch (error: any) {
            if (request.signal?.aborted) {
              sendProgress({
                type: 'cancelled',
                sent: results.sent.length,
                total: validEmails.length
              })
              break
            }
            
            results.failed.push({ 
              email, 
              error: error.message,
              status: 'failed'
            })
            
            sendProgress({
              type: 'failed',
              email: email,
              error: error.message,
              sent: results.sent.length,
              total: validEmails.length
            })
          }
        }

        sendProgress({
          type: 'complete',
          results: {
            sent: results.sent.length,
            failed: results.failed.length,
            invalid: results.invalid.length,
            details: {
              sent: results.sent.map((r: any) => r.email),
              failed: results.failed.map((r: any) => ({ email: r.email, error: r.error })),
              invalid: results.invalid
            }
          }
        })

      } catch (error: any) {
        sendProgress({
          type: 'error',
          error: error.message
        })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}






