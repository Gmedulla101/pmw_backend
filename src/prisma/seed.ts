import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fetch existing related data
  const existingUsers = await prisma.users.findMany();

  // Insert default data into the new table using relations
  for (const user of existingUsers) {
    await prisma.userConfirmation.create({
      data: {
        userEmail: user.email,
        confirmationCode: 1234,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
