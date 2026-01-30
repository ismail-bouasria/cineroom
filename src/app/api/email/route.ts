import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { 
  sendBookingEmail, 
  EmailNotificationType, 
  BookingEmailData 
} from '@/lib/email';
import { BookingSchema } from '@/types';
import { z } from 'zod';

// ============================================
// SCHEMA DE VALIDATION
// ============================================

const EmailRequestSchema = z.object({
  type: z.enum(['booking_created', 'booking_modified', 'booking_cancelled', 'booking_deleted']),
  booking: BookingSchema,
  // Email et nom optionnels - récupérés depuis Clerk si non fournis
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
});

// ============================================
// ROUTE API POST
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté via Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    
    const body = await request.json();
    
    // Valider les données d'entrée
    const validationResult = EmailRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { type, booking } = validationResult.data;

    // Récupérer l'email depuis Clerk (priorité) ou depuis le body
    const userEmail = user?.primaryEmailAddress?.emailAddress || validationResult.data.userEmail;
    const userName = user?.firstName || user?.fullName || validationResult.data.userName;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email utilisateur non trouvé' },
        { status: 400 }
      );
    }

    // Vérifier que Gmail est configuré
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Configuration Gmail manquante - email non envoyé');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service email non configuré' 
        },
        { status: 503 }
      );
    }

    // Envoyer l'email
    const emailData: BookingEmailData = {
      booking,
      userEmail,
      userName: userName || undefined,
    };

    const result = await sendBookingEmail(type as EmailNotificationType, emailData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Erreur API email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur' 
      },
      { status: 500 }
    );
  }
}

// ============================================
// ROUTE API OPTIONS (CORS)
// ============================================

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
