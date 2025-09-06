import { PrismaClient, GameModeType, UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../src/shared/utils/hashing.util';

const prisma = new PrismaClient();

async function main() {
  const timeModes = [15, 30, 60, 120, 180, 300].map((seconds) => ({
    type: GameModeType.BY_TIME,
    value: seconds,
  }));

  const wordModes = [10, 25, 30, 50, 100].map((words) => ({
    type: GameModeType.BY_WORD,
    value: words,
  }));

  const existingGameModes = await prisma.gameMode.findMany();

  if (existingGameModes.length === 0) {
    await prisma.gameMode.createMany({
      data: [...timeModes, ...wordModes],
    });
    console.log('✅ Game modes seeded successfully');
  } else {
    console.log('✅ Game modes already exist, skipping seed');
  }

  const adminEmail = 'admin@tezyoz.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('iamsure');

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Admin user created successfully');
  } else {
    console.log('✅ Admin user already exists, skipping creation');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });