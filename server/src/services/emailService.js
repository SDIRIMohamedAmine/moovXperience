import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@moovxperience.tn'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

let resend = null

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

function getClient() {
  if (!resend && RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY)
  }
  return resend
}

function buildItemRows(items) {
  return items.map(item => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E3E6; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841;">
        ${escapeHtml(item.products?.name) || 'Produit'}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E3E6; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841; text-align: center;">
        ${Number(item.quantity)}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #E0E3E6; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841; text-align: right;">
        ${Number(item.subtotal).toFixed(2)} TND
      </td>
    </tr>
  `).join('')
}

function emailHeader() {
  return `
    <div style="background-color: #303841; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-family: Cormorant Garamond, Georgia, serif; font-size: 28px; color: #FFFFFF; font-weight: 500;">
        Moov<span style="color: #76ABAE;">Xperience</span>
      </h1>
    </div>`
}

function emailFooter() {
  return `
    <div style="background-color: #303841; padding: 16px; text-align: center;">
      <p style="margin: 0; font-family: DM Sans, sans-serif; font-size: 12px; color: #8A939B;">
        © ${new Date().getFullYear()} MoovXperience — Solutions interactives par Maker Skills
      </p>
    </div>`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Send rental notification email to supplier
 */
export async function sendRentalNotification({ supplierEmail, supplierName, clientName, rental, items }) {
  const client = getClient()
  if (!client) {
    console.warn('Resend not configured — skipping email notification')
    return null
  }

  const safeSupplier = escapeHtml(supplierName) || 'Fournisseur'
  const safeClient = escapeHtml(clientName) || 'Client'
  const safeNotes = rental.notes ? escapeHtml(rental.notes) : null
  const itemsHtml = buildItemRows(items)

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #F5F5F5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader()}

        <div style="background-color: #FFFFFF; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-family: Cormorant Garamond, Georgia, serif; font-size: 22px; color: #303841; font-weight: 600;">
            Nouvelle commande reçue
          </h2>

          <p style="margin: 0 0 24px; font-family: DM Sans, sans-serif; font-size: 14px; color: #5A6570; line-height: 1.6;">
            Bonjour ${safeSupplier},<br><br>
            <strong>${safeClient}</strong> a passé une commande pour les articles suivants.
          </p>

          <div style="margin-bottom: 24px; padding: 16px; background-color: #F5F5F5; border-radius: 4px;">
            <p style="margin: 0 0 8px; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A939B;">
              Période de location
            </p>
            <p style="margin: 0; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841;">
              ${formatDate(rental.start_date)} — ${formatDate(rental.end_date)}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #F5F5F5;">
                <th style="padding: 8px 12px; text-align: left; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Article</th>
                <th style="padding: 8px 12px; text-align: center; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Qté</th>
                <th style="padding: 8px 12px; text-align: right; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Sous-total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; margin-bottom: 24px;">
            <span style="font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A939B;">Total</span><br>
            <span style="font-family: DM Sans, sans-serif; font-size: 24px; font-weight: 700; color: #FF5722;">
              ${Number(rental.total_price).toFixed(2)} TND
            </span>
          </div>

          ${safeNotes ? `
          <div style="margin-bottom: 24px; padding: 16px; background-color: #FFF8E1; border-left: 3px solid #FF9800;">
            <p style="margin: 0 0 4px; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A939B;">Instructions</p>
            <p style="margin: 0; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841;">${safeNotes}</p>
          </div>
          ` : ''}

          <a href="${CLIENT_URL}/supplier/orders"
            style="display: inline-block; padding: 12px 32px; background-color: #FF5722; color: #FFFFFF; font-family: DM Sans, sans-serif; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
            Voir la commande
          </a>
        </div>

        ${emailFooter()}
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: supplierEmail,
      subject: sanitizeSubject(`Nouvelle commande — ${safeClient}`),
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err.message)
    return null
  }
}

/**
 * Send rental confirmation email to client
 */
export async function sendRentalConfirmation({ clientEmail, clientName, rental, items }) {
  const client = getClient()
  if (!client) return null

  const safeClient = escapeHtml(clientName) || 'Client'
  const itemsHtml = buildItemRows(items)

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #F5F5F5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        ${emailHeader()}

        <div style="background-color: #FFFFFF; padding: 32px;">
          <h2 style="margin: 0 0 16px; font-family: Cormorant Garamond, Georgia, serif; font-size: 22px; color: #303841; font-weight: 600;">
            Confirmation de réservation
          </h2>

          <p style="margin: 0 0 24px; font-family: DM Sans, sans-serif; font-size: 14px; color: #5A6570; line-height: 1.6;">
            Bonjour ${safeClient},<br><br>
            Votre réservation a bien été enregistrée. Le fournisseur va confirmer votre commande prochainement.
          </p>

          <div style="margin-bottom: 24px; padding: 16px; background-color: #F5F5F5; border-radius: 4px;">
            <p style="margin: 0 0 8px; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A939B;">
              Période de location
            </p>
            <p style="margin: 0; font-family: DM Sans, sans-serif; font-size: 14px; color: #303841;">
              ${formatDate(rental.start_date)} — ${formatDate(rental.end_date)}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #F5F5F5;">
                <th style="padding: 8px 12px; text-align: left; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Article</th>
                <th style="padding: 8px 12px; text-align: center; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Qté</th>
                <th style="padding: 8px 12px; text-align: right; font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A939B;">Sous-total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="text-align: right; margin-bottom: 24px;">
            <span style="font-family: DM Sans, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8A939B;">Total</span><br>
            <span style="font-family: DM Sans, sans-serif; font-size: 24px; font-weight: 700; color: #FF5722;">
              ${Number(rental.total_price).toFixed(2)} TND
            </span>
          </div>

          <a href="${CLIENT_URL}/my-rentals"
            style="display: inline-block; padding: 12px 32px; background-color: #76ABAE; color: #FFFFFF; font-family: DM Sans, sans-serif; font-size: 14px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
            Voir ma réservation
          </a>
        </div>

        ${emailFooter()}
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: 'Confirmation de réservation — MoovXperience',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err.message)
    return null
  }
}

export async function sendQuoteNotification({ productName, clientName, clientEmail, mode, durationDays, options, estimatedTotal, eventDate, quoteId }) {
  const client = getClient()
  if (!client) {
    console.warn('Resend not configured, skipping quote email')
    return null
  }

  const optionsHtml = options.length > 0
    ? options.map(opt => `
        <tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-family: DM Sans, sans-serif; font-size: 13px; color: #303841;">
            ${escapeHtml(opt.name)}
          </td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-family: DM Sans, sans-serif; font-size: 13px; color: #303841; text-align: right;">
            +${Number(opt.price).toFixed(2)} TND
          </td>
        </tr>
      `).join('')
    : '<tr><td style="padding: 6px 12px; font-family: DM Sans, sans-serif; font-size: 13px; color: #8A939B;">Aucune option</td><td></td></tr>'

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #F5F5F5; font-family: DM Sans, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        ${emailHeader()}
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 16px; font-family: Cormorant Garamond, serif; font-size: 22px; color: #303841; font-weight: 500;">
            Nouvelle demande de devis
          </h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #5A6570; line-height: 1.6;">
            Un client a soumis une demande de devis pour <strong>${escapeHtml(productName)}</strong>.
          </p>

          <div style="background-color: #F5F5F5; padding: 16px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #303841; font-weight: 600;">Informations client</h3>
            <p style="margin: 0 0 4px; font-size: 13px; color: #5A6570;">Nom : ${escapeHtml(clientName)}</p>
            <p style="margin: 0 0 4px; font-size: 13px; color: #5A6570;">Email : ${escapeHtml(clientEmail)}</p>
            ${eventDate ? `<p style="margin: 0; font-size: 13px; color: #5A6570;">Date événement : ${escapeHtml(eventDate)}</p>` : ''}
          </div>

          <h3 style="margin: 0 0 12px; font-size: 14px; color: #303841; font-weight: 600;">Détails du devis</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-size: 13px; color: #8A939B;">Mode</td>
              <td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-size: 13px; color: #303841; text-align: right;">${mode === 'rental' ? 'Location' : 'Achat'}</td>
            </tr>
            ${durationDays ? `<tr><td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-size: 13px; color: #8A939B;">Durée</td><td style="padding: 6px 12px; border-bottom: 1px solid #E0E3E6; font-size: 13px; color: #303841; text-align: right;">${durationDays} jours</td></tr>` : ''}
          </table>

          <h3 style="margin: 0 0 8px; font-size: 14px; color: #303841; font-weight: 600;">Options</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${optionsHtml}
          </table>

          <div style="background-color: #76ABAE; padding: 16px; text-align: center;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.1em;">Total estimé</p>
            <p style="margin: 0; font-size: 28px; color: #FFFFFF; font-family: Cormorant Garamond, serif; font-weight: 600;">
              ${Number(estimatedTotal).toFixed(2)} TND
            </p>
          </div>

          <p style="margin: 24px 0 0; font-size: 12px; color: #8A939B; text-align: center;">
            Référence devis : #${String(quoteId).slice(0, 8)}
          </p>
        </div>
        ${emailFooter()}
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: 'contact@makerskills.tn',
      subject: sanitizeSubject(`Nouveau devis — ${productName} — MoovXperience`),
      html,
      reply_to: clientEmail,
    })

    if (error) {
      console.error('Resend error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err.message)
    return null
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@moovxperience.tn'

export async function sendDemandNotificationToAdmin({ productName, clientName, clientEmail, clientPhone, companyName, mode, durationDays, options, estimatedTotal, eventDate, eventLocation, notes, quoteId }) {
  const client = getClient()
  if (!client) {
    console.warn('Resend not configured, skipping admin demand email')
    return null
  }

  const optionsHtml = options.length > 0
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
            ${companyName ? `<p style="margin: 0; font-size: 13px; color: #666;">${escapeHtml(companyName)}</p>` : ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Mode</td>
              <td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${mode === 'rental' ? 'Location' : 'Achat'}</td>
            </tr>
            ${durationDays ? `<tr><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Durée</td><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${durationDays} jours</td></tr>` : ''}
            ${eventDate ? `<tr><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Date</td><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(eventDate)}</td></tr>` : ''}
            ${eventLocation ? `<tr><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Lieu</td><td style="padding: 8px 16px; border-bottom: 1px solid #222; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(eventLocation)}</td></tr>` : ''}
          </table>

          ${options.length > 0 ? `
          <h3 style="margin: 0 0 8px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Options</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${optionsHtml}
          </table>` : ''}

          ${notes ? `
          <div style="background-color: #0D0D0D; padding: 16px; margin-bottom: 24px; border: 1px solid #222;">
            <h3 style="margin: 0 0 8px; font-size: 12px; color: #D23AB0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Notes</h3>
            <p style="margin: 0; font-size: 13px; color: #FFFFFF; white-space: pre-wrap;">${escapeHtml(notes)}</p>
          </div>` : ''}

          <div style="background: linear-gradient(135deg, #D23AB0, #AE59CE); padding: 20px; text-align: center;">
            <p style="margin: 0 0 4px; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600;">Total estimé</p>
            <p style="margin: 0; font-size: 32px; color: #FFFFFF; font-weight: 800;">
              ${Number(estimatedTotal).toFixed(2)} TND
            </p>
          </div>

          <p style="margin: 24px 0 0; font-size: 11px; color: #444; text-align: center;">
            Référence : #${String(quoteId).slice(0, 8)}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: sanitizeSubject(`Nouvelle demande — ${productName} — MoovXperience`),
      html,
      reply_to: clientEmail,
    })

    if (error) {
      console.error('Resend error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err.message)
    return null
  }
}

export async function sendDemandConfirmationToClient({ clientEmail, clientName, productName, mode, estimatedTotal, quoteId }) {
  const client = getClient()
  if (!client) {
    console.warn('Resend not configured, skipping client confirmation email')
    return null
  }

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

  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: sanitizeSubject(`Confirmation de votre demande — ${productName} — MoovXperience`),
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err.message)
    return null
  }
}
