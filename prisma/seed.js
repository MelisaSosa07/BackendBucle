import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/prisma.js";

async function main() {
  // borra lo que este
  await prisma.canje.deleteMany();
  await prisma.recompensa.deleteMany();
  await prisma.anotacion.deleteMany();
  await prisma.voluntariado.deleteMany();

  await prisma.voluntariado.createMany({
    data: [
      {
        emoji: "🌳",
        titulo: "Limpieza en Parque Rodó",
        descripcion:
          "Juntamos residuos y separamos materiales reciclables. Materiales provistos. Apto para toda la familia.",
        fecha: new Date("2026-05-31"),
        hora: "9:00",
        bucles: 80,
        direccion: "Parque Rodó, Montevideo",
        lat: -34.9135,
        lng: -56.1577,
        fijo: true,
      },
      {
        emoji: "♻️",
        titulo: "Punto verde en La Feria",
        descripcion:
          "Ayudamos a los feriantes a separar sus residuos correctamente y educamos a los visitantes.",
        fecha: new Date("2026-06-01"),
        hora: "10:00",
        bucles: 60,
        direccion: "Tristán Narvaja, Montevideo",
        lat: -34.9011,
        lng: -56.1645,
        fijo: true,
      },
      {
        emoji: "🏫",
        titulo: "Taller de reciclaje escolar",
        descripcion:
          "Damos talleres de educación ambiental en escuelas primarias de Montevideo.",
        fecha: new Date("2026-06-05"),
        hora: "14:00",
        bucles: 100,
        direccion: "Cordón, Montevideo",
        lat: -34.8941,
        lng: -56.1675,
        fijo: true,
      },
    ],
  });

  console.log("✅ Voluntariados de ejemplo creados");

  //publica las recompensas de ejemplo de la tienda
  const passwordHasheada = await bcrypt.hash("bucle-sistema-2026", 10);

  const usuarioSistema = await prisma.usuario.upsert({
    where: { email: "tienda@bucle.app" },
    update: {},
    create: {
      nombre: "Bucle",
      email: "tienda@bucle.app",
      password: passwordHasheada,
      avatar: "🌿",
    },
  });

  await prisma.recompensa.createMany({
    data: [
      {
        emoji: "🛒",
        titulo: "Cupón 20% off en compras",
        categoria: "Supermercado",
        descripcion: "Válido en cadenas adheridas a Bucle.",
        bucles: 200,
        bgColor: "verde",
        ecoTag: true,
        creadorId: usuarioSistema.id,
        fijo: true,
      },
      {
        emoji: "🧴",
        titulo: "Kit de limpieza ecológica",
        categoria: "Productos sustentables",
        descripcion: "Productos biodegradables para el hogar.",
        bucles: 150,
        bgColor: "marron",
        creadorId: usuarioSistema.id,
        fijo: true,
      },
      {
        emoji: "☕",
        titulo: "Café gratis en comercios adheridos",
        categoria: "Gastronomía",
        descripcion: "Un café de cortesía en locales participantes.",
        bucles: 50,
        bgColor: "mix",
        ecoTag: true,
        creadorId: usuarioSistema.id,
        fijo: true,
      },
      {
        emoji: "🛍️",
        titulo: "Tote bag reutilizable Bucle",
        categoria: "Accesorios",
        descripcion: "Bolsa de tela para reemplazar las bolsas plásticas.",
        bucles: 280,
        bgColor: "marron",
        creadorId: usuarioSistema.id,
        fijo: true,
      },
    ],
  });

  console.log("✅ Recompensas de ejemplo creadas");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
