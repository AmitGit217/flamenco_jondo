import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'amit217@yandex.com',
      password: '21780Amit',
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
