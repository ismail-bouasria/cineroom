// Script pour initialiser les consommables dans la base de données
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  { id: "menu-premium", name: "Menu Premium", description: "Popcorn XL + Nachos + 2 Sodas L", price: 25, category: "menus", isAvailable: true }
];

async function main() {
  console.log('🍿 Initialisation des consommables...');

  for (const consumable of CONSUMABLES) {
    await prisma.consumable.upsert({
      where: { id: consumable.id },
      update: {
        name: consumable.name,
        description: consumable.description,
        price: consumable.price,
        category: consumable.category,
        isAvailable: consumable.isAvailable,
      },
      create: {
        id: consumable.id,
        name: consumable.name,
        description: consumable.description,
        price: consumable.price,
        category: consumable.category,
        isAvailable: consumable.isAvailable,
      },
    });
    console.log(`  ✓ ${consumable.name}`);
  }

  console.log('\n✅ Tous les consommables ont été initialisés !');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
