import "dotenv/config";
import prisma from "../src/prisma.js";

async function main() {
  await prisma.canje.deleteMany();
  await prisma.recompensa.deleteMany();
  await prisma.anotacion.deleteMany();
  await prisma.voluntariado.deleteMany();

  let sistemaUser = await prisma.usuario.findUnique({
    where: { email: "sistema@bucle.uy" },
  });
  if (!sistemaUser) {
    const bcrypt = await import("bcryptjs");
    sistemaUser = await prisma.usuario.create({
      data: {
        nombre: "Bucle",
        email: "sistema@bucle.uy",
        password: await bcrypt.default.hash("sistema123", 10),
        bucles: 0,
      },
    });
  }

  await prisma.voluntariado.createMany({
    data: [
      {
        emoji: "🌳",
        titulo: "Limpieza en Parque Rodó",
        descripcion:
          "Juntamos residuos y separamos materiales reciclables. Materiales provistos. Apto para toda la familia.",
        fecha: new Date("2026-07-05"),
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
        fecha: new Date("2026-07-12"),
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
        fecha: new Date("2026-07-19"),
        hora: "14:00",
        bucles: 100,
        direccion: "Cordón, Montevideo",
        lat: -34.8941,
        lng: -56.1675,
        fijo: true,
      },
    ],
  });

  await prisma.recompensa.createMany({
    data: [
      {
        emoji: "💧",
        titulo: "Botella Ecológica",
        categoria: "Productos sustentables",
        descripcion: "Botella reutilizable de acero inoxidable 500ml.",
        bucles: 300,
        bgColor: "verde",
        ecoTag: true,
        creadorId: sistemaUser.id,
      },
      {
        emoji: "🛍️",
        titulo: "Tote Bag",
        categoria: "Accesorios",
        descripcion: "Bolsa de tela reutilizable, resistente y lavable.",
        bucles: 280,
        bgColor: "marron",
        ecoTag: false,
        creadorId: sistemaUser.id,
      },
      {
        emoji: "🛒",
        titulo: "Cupón 20% off en supermercado",
        categoria: "Supermercado",
        descripcion: "Descuento válido en cualquier compra de más de $500.",
        bucles: 200,
        bgColor: "verde",
        ecoTag: true,
        creadorId: sistemaUser.id,
      },
      {
        emoji: "🧴",
        titulo: "Kit limpieza ecológica",
        categoria: "Hogar",
        descripcion: "Productos de limpieza biodegradables para el hogar.",
        bucles: 150,
        bgColor: "mix",
        ecoTag: false,
        creadorId: sistemaUser.id,
      },
      {
        emoji: "☕",
        titulo: "Café gratis en Café Verde",
        categoria: "Gastronomía",
        descripcion: "Un café de especialidad para vos.",
        bucles: 120,
        bgColor: "marron",
        ecoTag: true,
        creadorId: sistemaUser.id,
      },
      {
        emoji: "🌱",
        titulo: "Plántula de árbol nativo",
        categoria: "Naturaleza",
        descripcion:
          "Una plántula de árbol nativo uruguayo para plantar en casa.",
        bucles: 80,
        bgColor: "verde",
        ecoTag: true,
        creadorId: sistemaUser.id,
      },
    ],
  });

  console.log(
    "✅ Seed completo: voluntariados + recompensas de ejemplo creados",
  );
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
