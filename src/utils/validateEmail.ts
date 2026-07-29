// Validación de correo para formularios públicos (sin login) donde alguien
// podría poner cualquier cosa: valida formato, estructura y filtra dominios
// de correo temporal/desechable conocidos, para evitar registros con correos falsos.

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmailo.com', 'tempmail.dev',
  'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'trashmail.me', 'trash-mail.com',
  'fakeinbox.com', 'fakemailgenerator.com', 'fakemail.net',
  'getnada.com', 'inboxbear.com', 'mailnesia.com', 'maildrop.cc',
  'mytemp.email', 'moakt.com', 'dispostable.com', 'discard.email', 'discardmail.com',
  'sharklasers.com', 'spamgourmet.com', 'mintemail.com', 'emailondeck.com',
  'mohmal.com', 'tempinbox.com', 'crazymailing.com', 'anonbox.net',
  'burnermail.io', 'mailcatch.com', 'spam4.me', 'tempr.email', 'einrot.com',
  'correotemporal.org', 'correotemporal.com', 'emailtemporal.org', 'emailtemporal.net',
  'example.com', 'example.org', 'example.net', 'test.com', 'localhost.com',
])

// Formato general RFC 5322-ish: parte local + @ + dominio válido (labels alfanuméricos
// separados por puntos, sin empezar/terminar en guion, TLD final de solo letras).
const EMAIL_FORMAT_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

export interface EmailValidationResult {
  valid: boolean
  reason?: string
}

export function validateEmail(rawEmail: string): EmailValidationResult {
  const email = rawEmail.trim().toLowerCase()

  if (!email) return { valid: false, reason: 'Ingresa tu correo.' }
  if (email.length > 254) return { valid: false, reason: 'Ese correo es demasiado largo.' }
  if (/\s/.test(email)) return { valid: false, reason: 'El correo no puede tener espacios.' }
  if ((email.match(/@/g) || []).length !== 1) return { valid: false, reason: 'El correo debe tener un solo @.' }

  const [localPart, domain] = email.split('@')

  if (!localPart || localPart.length > 64) return { valid: false, reason: 'Correo inválido.' }
  if (localPart.startsWith('.') || localPart.endsWith('.')) return { valid: false, reason: 'Correo inválido.' }
  if (/\.\./.test(email)) return { valid: false, reason: 'Correo inválido.' }
  if (!domain || !domain.includes('.')) return { valid: false, reason: 'Al correo le falta el dominio (ej. gmail.com).' }
  if (domain.startsWith('-') || domain.endsWith('-')) return { valid: false, reason: 'Correo inválido.' }

  if (!EMAIL_FORMAT_RE.test(email)) return { valid: false, reason: 'El formato del correo no es válido.' }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Usa tu correo real, no uno temporal o desechable.' }
  }

  return { valid: true }
}
