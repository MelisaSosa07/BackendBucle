import "dotenv/config";
import prisma from "../src/prisma.js";

async function main() {
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
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
