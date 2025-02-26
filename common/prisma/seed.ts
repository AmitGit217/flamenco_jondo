import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasourceUrl:
    "postgresql://flamenco_jondo_user:flamenco_jondo_password@localhost:5432/flamenco_jondo_db",
});

async function main() {
  // Hash passwords
  const password1 = await bcrypt.hash("21780Amit", 10);
  const password2 = await bcrypt.hash("123456", 10);

  // Create users
  await prisma.user.create({
    data: {
      email: "amit217@yandex.com",
      password: password1,
      created_at: new Date(),
      updated_at: new Date(),
      role: "MASTER",
    },
  });

  await prisma.user.create({
    data: {
      email: "test@email.com",
      password: password2,
      created_at: new Date(),
      updated_at: new Date(),
      role: "USER",
    },
  });

  // Create some palos
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
