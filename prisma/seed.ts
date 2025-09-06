import { PrismaClient, GameModeType } from '@prisma/client';

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
