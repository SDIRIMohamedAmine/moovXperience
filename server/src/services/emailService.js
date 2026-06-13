import { Resend } from 'resend'

function getConfig() {
  return {
    resendKey: process.env.RESEND_API_KEY,
    adminEmail: process.env.ADMIN_EMAIL || 'contact@makerskills.tn',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    fromEmail: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  }
}

function getResend() {
  const { resendKey } = getConfig()
  if (!resendKey) return null
  return new Resend(resendKey)
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function sanitizeSubject(str) {
  if (!str) return ''
  return String(str).replace(/[\r\n]/g, '').slice(0, 200)
}

function formatLocation(loc) {
  if (!loc) return ''
  if (typeof loc === 'string') return loc
  if (typeof loc === 'object') {
    if (loc.text) return loc.text
    if (loc.display_name) return loc.display_name
    if (loc.name) return loc.name
    if (loc.address) return loc.address
    const lat = loc.lat ?? loc.latitude
    const lng = loc.lng ?? loc.longitude
    if (lat != null && lng != null) {
      return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
    }
    return JSON.stringify(loc)
  }
  return String(loc)
}

async function sendEmail({ to, subject, html }) {
  const { fromEmail } = getConfig()
  const resend = getResend()

  console.log('[EMAIL] sendEmail called → to:', to, '| from:', fromEmail, '| resend configured:', !!resend)

  if (!resend) {
    console.error('[EMAIL] Resend client is NULL — RESEND_API_KEY missing in process.env')
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `MoovXperience <${fromEmail}>`,
      to: [to],
      subject: sanitizeSubject(subject),
      html,
    })

    if (error) {
      console.error('[EMAIL] RESEND ERROR →', error.message, '| to:', to)
      return null
    }

    console.log('[EMAIL] SENT OK →', data?.id, '| to:', to)
    return data
  } catch (err) {
    console.error('[EMAIL] SEND FAILED →', err.message, '| to:', to)
    return null
  }
}

export async function sendDemandNotificationToAdmin({ productName, clientName, clientEmail, clientPhone, companyName, mode, durationDays, options, estimatedTotal, eventDate, eventLocation, notes, quoteId }) {
  const safeOptions = Array.isArray(options) ? options : []
  const optionsHtml = safeOptions.length > 0
    ? options.map(opt => `
        <tr>
          <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #FFFFFF;">
            ${escapeHtml(opt.name)}
          </td>
          <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #D23AB0; text-align: right;">
            +${Number(opt.price).toFixed(2)} TND
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding: 8px 16px; font-family: Outfit, sans-serif; font-size: 13px; color: #666;">Aucune option</td><td></td></tr>'

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0D0D0D; font-family: Outfit, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
        <div style="padding: 32px; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #D23AB0, #AE59CE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            MoovXperience
          </h1>
        </div>
        <div style="padding: 32px;">
          <div style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #D23AB0, #AE59CE); color: #FFFFFF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">
            Nouvelle demande
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; color: #FFFFFF; font-weight: 700;">
            ${escapeHtml(productName)}
          </h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            Un client a soumis une demande pour cette solution.
          </p>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <h3 style="margin: 0 0 12px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
              Informations client
            </h3>
            <p style="margin: 0 0 6px; font-size: 13px; color: #FFFFFF;">${escapeHtml(clientName)}</p>
            <p style="margin: 0 0 6px; font-size: 13px; color: #666;">${escapeHtml(clientEmail)}</p>
            ${clientPhone ? `<p style="margin: 0 0 6px; font-size: 13px; color: #666;">${escapeHtml(clientPhone)}</p>` : ''}
            ${companyName ? `<p style="margin: 0 0 6px; font-size: 13px; color: #666;">${escapeHtml(companyName)}</p>` : ''}
          </div>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <h3 style="margin: 0 0 12px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">
              Détails de la demande
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Type</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${mode === 'rental' ? 'Location' : 'Achat'}</td>
              </tr>
              ${durationDays ? `<tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Durée</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${durationDays} jours</td>
              </tr>` : ''}
              ${eventDate ? `<tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Date événement</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(eventDate)}</td>
              </tr>` : ''}
              ${eventLocation ? `<tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Lieu</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(formatLocation(eventLocation))}</td>
              </tr>` : ''}
              ${optionsHtml}
              <tr>
                <td style="padding: 12px 16px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total estimé</td>
                <td style="padding: 12px 16px 0; font-size: 16px; color: #D23AB0; text-align: right; font-weight: 700;">${Number(estimatedTotal).toFixed(2)} TND</td>
              </tr>
            </table>
          </div>

          ${notes ? `
            <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
              <h3 style="margin: 0 0 8px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Notes</h3>
              <p style="margin: 0; font-size: 13px; color: #FFFFFF; line-height: 1.6;">${escapeHtml(notes)}</p>
            </div>
          ` : ''}

          <a href="${getConfig().clientUrl}/admin/rentals" style="display: block; background: linear-gradient(135deg, #D23AB0, #AE59CE); color: #FFFFFF; text-align: center; padding: 14px 24px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.05em;">
            VOIR LA DEMANDE DANS L'ADMIN
          </a>

          <p style="margin: 24px 0 0; font-size: 11px; color: #444; text-align: center;">
            Référence : #${String(quoteId).slice(0, 8)}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: getConfig().adminEmail,
    subject: `Nouvelle demande — ${productName} — MoovXperience`,
    html,
  })
}

export async function sendDemandConfirmationToClient({ clientEmail, clientName, productName, mode, estimatedTotal, quoteId }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0D0D0D; font-family: Outfit, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
        <div style="padding: 32px; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #D23AB0, #AE59CE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            MoovXperience
          </h1>
        </div>
        <div style="padding: 32px;">
          <div style="display: inline-block; padding: 4px 12px; background: #4CAF50; color: #FFFFFF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">
            Demande reçue
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; color: #FFFFFF; font-weight: 700;">
            Merci ${escapeHtml(clientName)} !
          </h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            Votre demande pour <strong style="color: #FFFFFF;">${escapeHtml(productName)}</strong> a bien été reçue. Notre équipe va l'examiner et vous recontacter dans les plus brefs délais.
          </p>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Solution</td>
                <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(productName)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Type</td>
                <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; text-align: right;">${mode === 'rental' ? 'Location' : 'Achat'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Total estimé</td>
                <td style="padding: 8px 0; font-size: 13px; color: #D23AB0; text-align: right; font-weight: 700;">${Number(estimatedTotal).toFixed(2)} TND</td>
              </tr>
            </table>
          </div>

          <div style="background: linear-gradient(135deg, #D23AB0, #AE59CE); padding: 16px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">
              Nous vous contacterons très bientôt !
            </p>
          </div>

          <p style="margin: 0; font-size: 11px; color: #444; text-align: center;">
            Référence : #${String(quoteId).slice(0, 8)} · MoovXperience by Maker Skills
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Confirmation de votre demande — ${productName} — MoovXperience`,
    html,
  })
}

export async function sendRentalConfirmation({ clientEmail, clientName, rental, items }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #FFFFFF;">
        ${escapeHtml(item.products?.name || 'Produit')}
      </td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #FFFFFF; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #D23AB0; text-align: right;">
        ${Number(item.subtotal).toFixed(2)} TND
      </td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0D0D0D; font-family: Outfit, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
        <div style="padding: 32px; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #D23AB0, #AE59CE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            MoovXperience
          </h1>
        </div>
        <div style="padding: 32px;">
          <div style="display: inline-block; padding: 4px 12px; background: #4CAF50; color: #FFFFFF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">
            Confirmation
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; color: #FFFFFF; font-weight: 700;">
            ${escapeHtml(clientName)}, votre réservation est confirmée !
          </h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            Nous avons bien reçu votre réservation. Voici le récapitulatif.
          </p>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Référence</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">#${String(rental.id).slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Du</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${rental.start_date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Au</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${rental.end_date}</td>
              </tr>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 12px 16px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total</td>
                <td style="padding: 12px 16px 0; font-size: 16px; color: #D23AB0; text-align: right; font-weight: 700;">${Number(rental.total_price).toFixed(2)} TND</td>
              </tr>
            </table>
          </div>

          ${rental.notes ? `
            <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
              <h3 style="margin: 0 0 8px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Notes</h3>
              <p style="margin: 0; font-size: 13px; color: #FFFFFF; line-height: 1.6;">${escapeHtml(rental.notes)}</p>
            </div>
          ` : ''}

          <p style="margin: 0; font-size: 11px; color: #444; text-align: center;">
            ${getConfig().clientUrl}/profile
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Confirmation de réservation — MoovXperience`,
    html,
  })
}

export async function sendRentalNotification({ clientName, rental, items }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #FFFFFF;">
        ${escapeHtml(item.products?.name || 'Produit')}
      </td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #FFFFFF; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-family: Outfit, sans-serif; font-size: 13px; color: #D23AB0; text-align: right;">
        ${Number(item.subtotal).toFixed(2)} TND
      </td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0D0D0D; font-family: Outfit, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
        <div style="padding: 32px; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #D23AB0, #AE59CE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            MoovXperience
          </h1>
        </div>
        <div style="padding: 32px;">
          <div style="display: inline-block; padding: 4px 12px; background: #FF9800; color: #FFFFFF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">
            Nouvelle location
          </div>
          <h2 style="margin: 0 0 24px; font-size: 22px; color: #FFFFFF; font-weight: 700;">
            ${escapeHtml(clientName)} a créé une location
          </h2>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Référence</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">#${String(rental.id).slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Du</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${rental.start_date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Au</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${rental.end_date}</td>
              </tr>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 12px 16px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Total</td>
                <td style="padding: 12px 16px 0; font-size: 16px; color: #D23AB0; text-align: right; font-weight: 700;">${Number(rental.total_price).toFixed(2)} TND</td>
              </tr>
            </table>
          </div>

          ${rental.notes ? `
            <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
              <h3 style="margin: 0 0 8px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Notes</h3>
              <p style="margin: 0; font-size: 13px; color: #FFFFFF; line-height: 1.6;">${escapeHtml(rental.notes)}</p>
            </div>
          ` : ''}

          <a href="${getConfig().clientUrl}/admin/rentals" style="display: block; background: linear-gradient(135deg, #D23AB0, #AE59CE); color: #FFFFFF; text-align: center; padding: 14px 24px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.05em;">
            VOIR DANS L'ADMIN
          </a>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: getConfig().adminEmail,
    subject: `Nouvelle location de ${clientName} — MoovXperience`,
    html,
  })
}

export async function sendRentalStatusUpdateToClient({ clientEmail, clientName, rentalId, status, startDate, endDate, totalPrice }) {
  const statusLabels = {
    confirmed: { label: 'Confirmée', color: '#4CAF50', message: 'Votre demande a été confirmée par notre équipe !' },
    cancelled: { label: 'Annulée', color: '#FF6B6B', message: 'Votre demande a été annulée.' },
    delivered: { label: 'Livrée', color: '#7B61FF', message: 'Votre commande a été livrée.' },
    returned: { label: 'Retournée', color: '#AE59CE', message: 'Votre commande a été retournée.' },
    completed: { label: 'Terminée', color: '#4CAF50', message: 'Votre commande est terminée. Merci pour votre confiance !' },
  }

  const info = statusLabels[status] || { label: status, color: '#666', message: `Statut mis à jour : ${status}` }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0D0D0D; font-family: Outfit, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
        <div style="padding: 32px; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #D23AB0, #AE59CE); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            MoovXperience
          </h1>
        </div>
        <div style="padding: 32px;">
          <div style="display: inline-block; padding: 4px 12px; background: ${info.color}; color: #FFFFFF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 16px;">
            ${info.label}
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; color: #FFFFFF; font-weight: 700;">
            Mise à jour de votre demande
          </h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
            ${escapeHtml(clientName)}, ${info.message}
          </p>

          <div style="background-color: #0D0D0D; padding: 20px; margin-bottom: 24px; border: 1px solid #222;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Référence</td>
                <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; text-align: right;">#${String(rentalId).slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Période</td>
                <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; text-align: right;">${startDate} → ${endDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Total</td>
                <td style="padding: 8px 0; font-size: 13px; color: #D23AB0; text-align: right; font-weight: 700;">${Number(totalPrice).toFixed(2)} TND</td>
              </tr>
            </table>
          </div>

          <p style="margin: 0; font-size: 11px; color: #444; text-align: center;">
            MoovXperience by Maker Skills
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: `Mise à jour de votre demande — ${info.label} — MoovXperience`,
    html,
  })
}
