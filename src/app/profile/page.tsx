"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, Button, Alert, Spinner } from "@/components/ui";
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Bell,
  Globe,
  Moon,
  CreditCard,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Alert variant="error" title="Non authentifié">
          Vous devez être connecté pour accéder à cette page.
        </Alert>
      </DashboardLayout>
    );
  }

  const formatJoinDate = (date: Date | null) => {
    if (!date) return "Non disponible";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
          <p className="text-slate-400 mt-1">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "Photo de profil"}
                    className="w-24 h-24 rounded-full mx-auto"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-violet-600 to-purple-700 flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mt-4">
                {user.fullName || "Utilisateur"}
              </h2>
              <p className="text-slate-400">
                {user.emailAddresses[0]?.emailAddress}
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Membre depuis</p>
                    <p className="text-sm text-white">
                      {formatJoinDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Rôle</p>
                    <p className="text-sm text-white">Utilisateur</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                fullWidth
                className="mt-6"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={() => signOut()}
              >
                Se déconnecter
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader
                title="Informations du compte"
                icon={<User className="w-5 h-5 text-violet-400" />}
              />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Prénom</label>
                    <p className="text-white bg-slate-800 rounded-lg px-4 py-3">
                      {user.firstName || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nom</label>
                    <p className="text-white bg-slate-800 rounded-lg px-4 py-3">
                      {user.lastName || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <div className="flex items-center gap-2 text-white bg-slate-800 rounded-lg px-4 py-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline">Modifier les informations</Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader
                title="Préférences"
                icon={<Bell className="w-5 h-5 text-violet-400" />}
              />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">Notifications par email</p>
                        <p className="text-sm text-slate-400">
                          Recevez des rappels pour vos réservations
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">Langue</p>
                        <p className="text-sm text-slate-400">
                          Choisissez votre langue préférée
                        </p>
                      </div>
                    </div>
                    <select className="bg-slate-700 border-none rounded-lg px-3 py-2 text-white text-sm">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">Thème sombre</p>
                        <p className="text-sm text-slate-400">
                          Toujours utiliser le mode sombre
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader
                title="Moyens de paiement"
                icon={<CreditCard className="w-5 h-5 text-violet-400" />}
              />
              <CardContent>
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                    <CreditCard className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Aucun moyen de paiement
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Ajoutez une carte pour faciliter vos réservations
                  </p>
                  <Button variant="outline">Ajouter une carte</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
