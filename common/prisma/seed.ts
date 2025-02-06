import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("21780Amit", 10);
  await prisma.user.create({
    data: {
      email: "amit217@yandex.com",
      password: password,
      created_at: new Date(),
      updated_at: new Date(),
      role: "MASTER",
    },
  });
  const password2 = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      email: "test@email.com",
      password: password2,
      created_at: new Date(),
      updated_at: new Date(),
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
