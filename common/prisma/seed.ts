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
  const masterUser = await prisma.user.create({
    data: {
      email: "amit217@yandex.com",
      password: password1,
      created_at: new Date(),
      updated_at: new Date(),
      role: "MASTER",
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: "test@email.com",
      password: password2,
      created_at: new Date(),
      updated_at: new Date(),
      role: "USER",
    },
  });

  // Create some palos
  const solea = await prisma.palo.create({
    data: {
      name: "Soleá",
      origin: "Andalucía, Spain",
      origin_date: new Date("1700-01-01"),
      user_create_id: masterUser.id,
    },
  });

  const bulerias = await prisma.palo.create({
    data: {
      name: "Bulerías",
      origin: "Jerez de la Frontera",
      origin_date: new Date("1800-01-01"),
      user_create_id: masterUser.id,
    },
  });

  // Create estilos
  const soleaEstilo = await prisma.estilo.create({
    data: {
      name: "Soleá por Bulerías",
      tonality: "FRIGIO",
      key: "A",
      origin: "Spain",
      origin_date: new Date("1750-01-01"),
      user_create_id: masterUser.id,
    },
  });

  const buleriasEstilo = await prisma.estilo.create({
    data: {
      name: "Bulerías",
      tonality: "FRIGIO",
      key: "E",
      origin: "Spain",
      origin_date: new Date("1800-01-01"),
      user_create_id: masterUser.id,
    },
  });

  // Create letras
  await prisma.letra.create({
    data: {
      estilo_id: soleaEstilo.id,
      name: "Soleá Verse 1",
      verses: [
        "Por tu calle yo pasé",
        "y me encontré tu ventana",
        "cerrada de par en par,",
        "como si no pasara nada.",
      ],
      rhyme_scheme: [1, 2, 3, 4],
      repetition_pattern: [1, 1, 2, 2],
      structure: "ABAB",
      user_create_id: masterUser.id,
    },
  });

  await prisma.letra.create({
    data: {
      estilo_id: buleriasEstilo.id,
      name: "Bulerías Verse 1",
      verses: [
        "A la orilla del río",
        "un lucero se miraba",
        "quiso tocar su reflejo",
        "y en el agua se quedaba.",
      ],
      rhyme_scheme: [1, 2, 3, 4],
      repetition_pattern: [1, 1, 2, 2],
      structure: "ABAB",
      user_create_id: masterUser.id,
    },
  });

  // Create compas
  const soleaCompas = await prisma.compas.create({
    data: {
      name: "Soleá Compás",
      beats: 12,
      accents: [3, 6, 8, 10, 12],
      time_signatures: ["6/8", "3/4"],
      bpm: 60,
      user_create_id: masterUser.id,
    },
  });

  const buleriasCompas = await prisma.compas.create({
    data: {
      name: "Bulerías Compás",
      beats: 12,
      accents: [12, 3, 6, 8, 10],
      time_signatures: ["6/8", "3/4"],
      bpm: 120,
      user_create_id: masterUser.id,
    },
  });

  // Create artist
  const pacoDeLucia = await prisma.artist.create({
    data: {
      name: "Paco de Lucía",
      birth_year: 1947,
      death_year: 2014,
      origin: "Algeciras, Spain",
      type: "GUITARRA",
      user_create_id: masterUser.id,
    },
  });

  const camarón = await prisma.artist.create({
    data: {
      name: "Camarón de la Isla",
      birth_year: 1950,
      death_year: 1992,
      origin: "San Fernando, Spain",
      type: "CANTE",
      user_create_id: masterUser.id,
    },
  });

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
