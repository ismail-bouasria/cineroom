import nodemailer from 'nodemailer';
import type { Booking } from '@/types';
import { FORMULAS, CONSUMABLES } from '@/types';

// ============================================
// CONFIGURATION NODEMAILER (Gmail SMTP - Gratuit)
// ============================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Mot de passe d'application Gmail
  },
});

const FROM_EMAIL = process.env.GMAIL_USER || 'noreply@cineroom.fr';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@cineroom.fr';

// ============================================
// TYPES
// ============================================

export type EmailNotificationType = 
  | 'booking_created' 
  | 'booking_modified' 
  | 'booking_cancelled' 
  | 'booking_deleted';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BookingEmailData {
  booking: Booking;
  userEmail: string;
  userName?: string;
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getFormula(formulaId: string) {
  return FORMULAS.find(f => f.id === formulaId);
}

function getConsumableName(consumableId: string): string {
  return CONSUMABLES.find(c => c.id === consumableId)?.name || consumableId;
}

function formatConsumables(consumables?: { consumableId: string; quantity: number }[]): string {
  if (!consumables || consumables.length === 0) return 'Aucun consommable';
  
  return consumables
    .map(c => `${getConsumableName(c.consumableId)} x${c.quantity}`)
    .join(', ');
}

// ============================================
// TEMPLATES EMAIL
// ============================================

const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header .emoji { font-size: 48px; margin-bottom: 16px; display: block; }
    .content { padding: 32px; color: #e5e5e5; }
    .booking-card { background-color: #2a2a2a; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .booking-card h3 { color: white; margin: 0 0 16px 0; font-size: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #3a3a3a; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #9ca3af; }
    .detail-value { color: white; font-weight: 600; }
    .total { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .total-label { color: rgba(255,255,255,0.8); font-size: 14px; }
    .total-value { color: white; font-size: 32px; font-weight: bold; }
    .footer { padding: 24px 32px; background-color: #0f0f0f; text-align: center; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600; }
    .status-created { background-color: #22c55e; color: white; }
    .status-modified { background-color: #f59e0b; color: white; }
    .status-cancelled { background-color: #ef4444; color: white; }
    .status-deleted { background-color: #6b7280; color: white; }
    .warning-box { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; color: #92400e; }
  </style>
`;

function createBookingCreatedEmail(data: BookingEmailData): { subject: string; html: string } {
  const { booking, userName } = data;
  const formula = getFormula(booking.formula);
  
  return {
    subject: `🎬 Votre réservation CineRoom est confirmée !`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <span class="emoji">🎬</span>
            <h1>Réservation Confirmée !</h1>
          </div>
          
          <div class="content">
            <p>Bonjour${userName ? ` ${userName}` : ''} 👋</p>
            <p>Votre réservation a été confirmée avec succès. Voici les détails de votre séance privée :</p>
            
            <div class="booking-card">
              <h3>${booking.movieTitle}</h3>
              <span class="status-badge status-created">Confirmée</span>
              
              <div style="margin-top: 20px;">
                <div class="detail-row">
                  <span class="detail-label">📅 Date</span>
                  <span class="detail-value">${formatDate(booking.date)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Heure</span>
                  <span class="detail-value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🎟️ Formule</span>
                  <span class="detail-value">${formula?.icon || ''} ${formula?.name || booking.formula} (${formula?.seats || '?'} places)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🍿 Consommables</span>
                  <span class="detail-value">${formatConsumables(booking.consumables)}</span>
                </div>
              </div>
              
              <div class="total">
                <div class="total-label">Total</div>
                <div class="total-value">${booking.totalPrice.toFixed(2)}€</div>
              </div>
            </div>
            
            <p>Numéro de réservation : <strong>#${booking.id}</strong></p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${booking.id}" class="button">
                Voir ma réservation
              </a>
            </p>
            
            <p style="margin-top: 32px; color: #9ca3af;">
              Présentez-vous 15 minutes avant le début de la séance avec cette confirmation.
            </p>
          </div>
          
          <div class="footer">
            <p>CineRoom - L'expérience cinéma privatisée</p>
            <p>Des questions ? Contactez-nous : <a href="mailto:${SUPPORT_EMAIL}" style="color: #ef4444;">${SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function createBookingModifiedEmail(data: BookingEmailData): { subject: string; html: string } {
  const { booking, userName } = data;
  const formula = getFormula(booking.formula);
  
  return {
    subject: `📝 Votre réservation CineRoom a été modifiée`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
            <span class="emoji">📝</span>
            <h1>Réservation Modifiée</h1>
          </div>
          
          <div class="content">
            <p>Bonjour${userName ? ` ${userName}` : ''} 👋</p>
            <p>Votre réservation a été modifiée avec succès. Voici les nouveaux détails :</p>
            
            <div class="booking-card">
              <h3>${booking.movieTitle}</h3>
              <span class="status-badge status-modified">Modifiée</span>
              
              <div style="margin-top: 20px;">
                <div class="detail-row">
                  <span class="detail-label">📅 Nouvelle date</span>
                  <span class="detail-value">${formatDate(booking.date)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Nouvelle heure</span>
                  <span class="detail-value">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🎟️ Formule</span>
                  <span class="detail-value">${formula?.icon || ''} ${formula?.name || booking.formula} (${formula?.seats || '?'} places)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🍿 Consommables</span>
                  <span class="detail-value">${formatConsumables(booking.consumables)}</span>
                </div>
              </div>
              
              <div class="total">
                <div class="total-label">Nouveau total</div>
                <div class="total-value">${booking.totalPrice.toFixed(2)}€</div>
              </div>
            </div>
            
            <p>Numéro de réservation : <strong>#${booking.id}</strong></p>
            
            <div class="warning-box">
              ⚠️ <strong>Important :</strong> Si vous n'êtes pas à l'origine de cette modification, veuillez nous contacter immédiatement.
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/${booking.id}" class="button">
                Voir ma réservation
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>CineRoom - L'expérience cinéma privatisée</p>
            <p>Des questions ? Contactez-nous : <a href="mailto:${SUPPORT_EMAIL}" style="color: #ef4444;">${SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function createBookingCancelledEmail(data: BookingEmailData): { subject: string; html: string } {
  const { booking, userName } = data;
  const formula = getFormula(booking.formula);
  
  return {
    subject: `❌ Votre réservation CineRoom a été annulée`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            <span class="emoji">❌</span>
            <h1>Réservation Annulée</h1>
          </div>
          
          <div class="content">
            <p>Bonjour${userName ? ` ${userName}` : ''} 👋</p>
            <p>Votre réservation a été annulée. Voici le récapitulatif de la réservation annulée :</p>
            
            <div class="booking-card" style="opacity: 0.8;">
              <h3 style="text-decoration: line-through;">${booking.movieTitle}</h3>
              <span class="status-badge status-cancelled">Annulée</span>
              
              <div style="margin-top: 20px;">
                <div class="detail-row">
                  <span class="detail-label">📅 Date prévue</span>
                  <span class="detail-value" style="text-decoration: line-through;">${formatDate(booking.date)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Heure prévue</span>
                  <span class="detail-value" style="text-decoration: line-through;">${booking.time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">🎟️ Formule</span>
                  <span class="detail-value">${formula?.icon || ''} ${formula?.name || booking.formula}</span>
                </div>
              </div>
            </div>
            
            <p>Numéro de réservation : <strong>#${booking.id}</strong></p>
            
            <p style="color: #9ca3af; margin-top: 24px;">
              Si vous avez effectué un paiement, le remboursement sera traité sous 5 à 7 jours ouvrés.
            </p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book" class="button">
                Faire une nouvelle réservation
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>CineRoom - L'expérience cinéma privatisée</p>
            <p>Des questions ? Contactez-nous : <a href="mailto:${SUPPORT_EMAIL}" style="color: #ef4444;">${SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function createBookingDeletedEmail(data: BookingEmailData): { subject: string; html: string } {
  const { booking, userName } = data;
  
  return {
    subject: `🗑️ Votre réservation CineRoom a été supprimée`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
            <span class="emoji">🗑️</span>
            <h1>Réservation Supprimée</h1>
          </div>
          
          <div class="content">
            <p>Bonjour${userName ? ` ${userName}` : ''} 👋</p>
            <p>Votre réservation pour <strong>"${booking.movieTitle}"</strong> du <strong>${formatDate(booking.date)}</strong> a été définitivement supprimée de notre système.</p>
            
            <p>Numéro de réservation supprimée : <strong>#${booking.id}</strong></p>
            
            <p style="color: #9ca3af; margin-top: 24px;">
              Cette action est irréversible. Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.
            </p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book" class="button">
                Faire une nouvelle réservation
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>CineRoom - L'expérience cinéma privatisée</p>
            <p>Des questions ? Contactez-nous : <a href="mailto:${SUPPORT_EMAIL}" style="color: #ef4444;">${SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// ============================================
// FONCTION PRINCIPALE D'ENVOI
// ============================================

export async function sendBookingEmail(
  type: EmailNotificationType,
  data: BookingEmailData
): Promise<SendEmailResult> {
  try {
    // Vérifier la configuration Gmail
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Configuration Gmail manquante - email non envoyé');
      return {
        success: false,
        error: 'Service email non configuré',
      };
    }

    let emailContent: { subject: string; html: string };
    
    switch (type) {
      case 'booking_created':
        emailContent = createBookingCreatedEmail(data);
        break;
      case 'booking_modified':
        emailContent = createBookingModifiedEmail(data);
        break;
      case 'booking_cancelled':
        emailContent = createBookingCancelledEmail(data);
        break;
      case 'booking_deleted':
        emailContent = createBookingDeletedEmail(data);
        break;
      default:
        throw new Error(`Type de notification non supporté: ${type}`);
    }

    // Envoyer l'email avec Nodemailer
    const info = await transporter.sendMail({
      from: `CineRoom <${FROM_EMAIL}>`,
      to: data.userEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('Email envoyé:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// ============================================
// FONCTIONS DE COMMODITÉ
// ============================================

export async function sendBookingCreatedEmail(data: BookingEmailData): Promise<SendEmailResult> {
  return sendBookingEmail('booking_created', data);
}

export async function sendBookingModifiedEmail(data: BookingEmailData): Promise<SendEmailResult> {
  return sendBookingEmail('booking_modified', data);
}

export async function sendBookingCancelledEmail(data: BookingEmailData): Promise<SendEmailResult> {
  return sendBookingEmail('booking_cancelled', data);
}

export async function sendBookingDeletedEmail(data: BookingEmailData): Promise<SendEmailResult> {
  return sendBookingEmail('booking_deleted', data);
}
