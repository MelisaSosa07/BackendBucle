/*
  Warnings:

  - Added the required column `codigoRetiro` to the `Canasta` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Canasta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foto" TEXT,
    "descripcion" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "cantidad" TEXT NOT NULL,
    "bucles" INTEGER NOT NULL DEFAULT 20,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "codigoRetiro" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Canasta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Canasta" ("bucles", "cantidad", "creadoEn", "descripcion", "estado", "foto", "id", "ubicacion", "usuarioId") SELECT "bucles", "cantidad", "creadoEn", "descripcion", "estado", "foto", "id", "ubicacion", "usuarioId" FROM "Canasta";
DROP TABLE "Canasta";
ALTER TABLE "new_Canasta" RENAME TO "Canasta";
CREATE TABLE "new_Recompensa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emoji" TEXT NOT NULL DEFAULT '🎁',
    "titulo" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "bucles" INTEGER NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT 'verde',
    "ecoTag" BOOLEAN NOT NULL DEFAULT false,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "fijo" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadorId" INTEGER NOT NULL,
    CONSTRAINT "Recompensa_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recompensa" ("bgColor", "bucles", "categoria", "creadoEn", "creadorId", "descripcion", "ecoTag", "emoji", "estado", "id", "titulo") SELECT "bgColor", "bucles", "categoria", "creadoEn", "creadorId", "descripcion", "ecoTag", "emoji", "estado", "id", "titulo" FROM "Recompensa";
DROP TABLE "Recompensa";
ALTER TABLE "new_Recompensa" RENAME TO "Recompensa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
