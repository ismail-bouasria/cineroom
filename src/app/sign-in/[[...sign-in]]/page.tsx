import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Film } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Partie gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-950 to-[#0a0a0a] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
            <Film className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black text-white">
            Cine<span className="text-red-500">Room</span>
          </span>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-black text-white leading-tight">
            Votre cinéma privé
            <br />
            <span className="text-red-500">à portée de clic</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Réservez une salle de cinéma privée pour vos soirées entre amis, 
            en famille ou en couple. Une expérience unique vous attend.
          </p>
          
          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-gray-500 text-sm">Formules</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-gray-500 text-sm">Films disponibles</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white">2-8</p>
              <p className="text-gray-500 text-sm">Places / salle</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          © 2026 CineRoom. Tous droits réservés.
        </p>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white">
                Cine<span className="text-red-500">Room</span>
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Connexion</h2>
            <p className="text-gray-400">
              Connectez-vous avec votre email pour accéder à votre espace
            </p>
          </div>

          {/* Clerk SignIn avec appearance personnalisée */}
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                socialButtonsBlockButtonText: 'text-white',
                dividerLine: 'bg-white/20',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-300',
                formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-gray-500',
                formButtonPrimary: 'bg-red-600 hover:bg-red-700',
                footerActionLink: 'text-red-400 hover:text-red-300',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-red-400',
                formFieldInputShowPasswordButton: 'text-gray-400',
                alertText: 'text-gray-300',
                formResendCodeLink: 'text-red-400',
              },
              variables: {
                colorPrimary: '#dc2626',
                colorBackground: 'transparent',
                colorText: '#ffffff',
                colorTextSecondary: '#9ca3af',
                colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                colorInputText: '#ffffff',
                borderRadius: '0.75rem',
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />

          <p className="text-center text-gray-500 text-sm mt-8">
            Pas encore de compte ?{' '}
            <Link href="/sign-up" className="text-red-400 hover:text-red-300">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
