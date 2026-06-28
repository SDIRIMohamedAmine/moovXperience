import { sendContactEmail, sendContactConfirmation } from '../services/emailService.js'

function sanitize(str) {
  if (!str) return ''
  return String(str).replace(/[<>]/g, '').trim()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function createContact(req, res) {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  if (name.length > 100 || email.length > 200 || message.length > 5000 || (subject && subject.length > 200) || (phone && phone.length > 30)) {
    return res.status(400).json({ error: 'Input too long' })
  }

  try {
    await sendContactEmail({
      name: sanitize(name),
      email: sanitize(email),
      phone: sanitize(phone),
      subject: sanitize(subject),
      message: sanitize(message)
    })
    await sendContactConfirmation({ name: sanitize(name), email: sanitize(email) })
    res.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err.message)
    res.status(500).json({ error: 'Failed to send message' })
  }
}
