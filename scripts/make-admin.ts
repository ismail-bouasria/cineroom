#!/usr/bin/env npx tsx
// ============================================
// SCRIPT: Promouvoir un utilisateur en admin
// Usage: npx tsx scripts/make-admin.ts <email>
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  console.log(`\n🔐 Promotion de ${email} en administrateur...\n`);

  try {
    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utilisateur avec l'email "${email}" introuvable.`);
      console.log('\n📋 Utilisateurs existants:');
      
      const users = await prisma.user.findMany({
        select: { email: true, role: true, clerkId: true },
      });
      
      if (users.length === 0) {
        console.log('   Aucun utilisateur dans la base de données.');
        console.log('   Connectez-vous d\'abord sur le site pour créer votre compte.');
      } else {
        users.forEach(u => {
          console.log(`   - ${u.email} (${u.role})`);
        });
      }
      return;
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  ${email} est déjà administrateur.`);
      return;
    }

    // Promouvoir en admin
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    console.log(`✅ ${email} est maintenant administrateur!`);
    console.log('\n📋 Vous pouvez maintenant accéder à:');
    console.log('   - /admin - Dashboard administrateur');
    console.log('   - /admin/resources - Gestion des ressources');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments
const email = process.argv[2];

if (!email) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Script de promotion administrateur               ║
╠═══════════════════════════════════════════════════════════╣
║  Usage: npx tsx scripts/make-admin.ts <email>             ║
║                                                           ║
║  Exemple:                                                 ║
║    npx tsx scripts/make-admin.ts admin@example.com        ║
║                                                           ║
║  Note: L'utilisateur doit d'abord s'être connecté         ║
║        au moins une fois sur le site.                     ║
╚═══════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

makeAdmin(email);
