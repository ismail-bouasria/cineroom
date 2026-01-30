// ============================================
// PRISMA SEED - CineRoom
// Script pour initialiser la base de données
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Consommables par défaut
const CONSUMABLES = [
  // Popcorn
  { id: "pop-s", name: "Popcorn S", price: 4.5, category: "popcorn", isAvailable: true },
  { id: "pop-m", name: "Popcorn M", price: 6, category: "popcorn", isAvailable: true },
  { id: "pop-l", name: "Popcorn L", price: 8, category: "popcorn", isAvailable: true },
  { id: "pop-caramel", name: "Popcorn Caramel", price: 7, category: "popcorn", isAvailable: true },
  // Boissons
  { id: "soda-s", name: "Soda S", price: 3.5, category: "boissons", isAvailable: true },
  { id: "soda-m", name: "Soda M", price: 4.5, category: "boissons", isAvailable: true },
  { id: "soda-l", name: "Soda L", price: 5.5, category: "boissons", isAvailable: true },
  { id: "water", name: "Eau Minérale", price: 2.5, category: "boissons", isAvailable: true },
  { id: "ice-tea", name: "Ice Tea", price: 4, category: "boissons", isAvailable: true },
  // Snacks
  { id: "nachos", name: "Nachos", price: 6.5, category: "snacks", isAvailable: true },
  { id: "churros", name: "Churros", price: 5, category: "snacks", isAvailable: true },
  { id: "candy", name: "Bonbons", price: 3, category: "snacks", isAvailable: true },
  { id: "ice-cream", name: "Glace", price: 4, category: "snacks", isAvailable: true },
  // Menus
  { id: "menu-duo", name: "Menu Duo", description: "2 Popcorn M + 2 Sodas M", price: 18, category: "menus", isAvailable: true },
  { id: "menu-team", name: "Menu Team", description: "2 Popcorn L + 4 Sodas M", price: 32, category: "menus", isAvailable: true },
  { id: "menu-premium", name: "Menu Premium", description: "Popcorn XL + Nachos + 2 Sodas L", price: 25, category: "menus", isAvailable: true },
];

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Créer les consommables
  console.log('📦 Création des consommables...');
  for (const consumable of CONSUMABLES) {
    await prisma.consumable.upsert({
      where: { id: consumable.id },
      update: consumable,
      create: consumable,
    });
  }
  console.log(`✅ ${CONSUMABLES.length} consommables créés/mis à jour`);

  // Créer un utilisateur admin de démonstration
  // IMPORTANT: Remplacez ces valeurs par votre compte Clerk réel
  const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (ADMIN_CLERK_ID && ADMIN_EMAIL) {
    console.log('👤 Création du compte admin...');
    await prisma.user.upsert({
      where: { clerkId: ADMIN_CLERK_ID },
      update: { role: 'admin' },
      create: {
        clerkId: ADMIN_CLERK_ID,
        email: ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'CineRoom',
        role: 'admin',
      },
    });
    console.log(`✅ Compte admin créé: ${ADMIN_EMAIL}`);
  } else {
    console.log('⚠️  Variables ADMIN_CLERK_ID et ADMIN_EMAIL non définies.');
    console.log('   Pour créer un admin, ajoutez ces variables dans .env.local');
    console.log('   puis relancez: npx prisma db seed');
  }

  // Créer quelques réservations de démonstration (optionnel)
  const existingUsers = await prisma.user.findMany({ take: 1 });
  
  if (existingUsers.length > 0) {
    console.log('🎬 Création de réservations de démonstration...');
    
    const demoBookings = [
      {
        userId: existingUsers[0].id,
        movieId: 693134,
        movieTitle: "Dune: Deuxième Partie",
        moviePoster: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
        formula: "cine-team",
        date: "2026-02-05",
        time: "19:00",
        totalPrice: 106,
        status: "active",
      },
      {
        userId: existingUsers[0].id,
        movieId: 872585,
        movieTitle: "Oppenheimer",
        moviePoster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        formula: "cine-duo",
        date: "2026-02-10",
        time: "20:00",
        totalPrice: 53,
        status: "active",
      },
    ];

    for (const booking of demoBookings) {
      await prisma.booking.create({
        data: booking,
      });
    }
    console.log(`✅ ${demoBookings.length} réservations de démonstration créées`);
  }

  console.log('');
  console.log('🎉 Seed terminé avec succès!');
  console.log('');
  console.log('📋 Prochaines étapes:');
  console.log('   1. Ajoutez vos credentials Clerk dans .env.local');
  console.log('   2. Définissez ADMIN_CLERK_ID et ADMIN_EMAIL pour créer un admin');
  console.log('   3. Lancez: npm run dev');
  console.log('   4. Accédez à http://localhost:3000/api/graphql pour tester GraphQL');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
