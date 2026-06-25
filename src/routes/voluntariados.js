import { Router } from "express";
import prisma from "../prisma.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

// GET /api/voluntariados — y ordenados
router.get("/", async (req, res) => {
  try {
    const voluntariados = await prisma.voluntariado.findMany({
      orderBy: { fecha: "asc" },
      include: { _count: { select: { anotaciones: true } } },
    });

    const resultado = voluntariados.map((v) => ({
      ...v,
      anotados: v._count.anotaciones,
    }));

    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener voluntariados" });
  }
});

// POST /api/voluntariados — crear uno nuevo (requiere estar logueado)
router.post("/", verificarToken, async (req, res) => {
  try {
    const {
      emoji,
      titulo,
      descripcion,
      fecha,
      hora,
      bucles,
      direccion,
      lat,
      lng,
    } = req.body;

    if (
      !titulo ||
      !fecha ||
      !hora ||
      !bucles ||
      !direccion ||
      lat == null ||
      lng == null
    ) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const nuevo = await prisma.voluntariado.create({
      data: {
        emoji: emoji || "🌱",
        titulo,
        descripcion,
        fecha: new Date(fecha),
        hora,
        bucles: Number(bucles),
        direccion,
        lat: Number(lat),
        lng: Number(lng),
        fijo: false,
        creadorId: req.usuarioId,
      },
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el voluntariado" });
  }
});

// POST /api/voluntariados/:id/anotarse — anotarse a un evento
router.post("/:id/anotarse", verificarToken, async (req, res) => {
  try {
    const voluntariadoId = Number(req.params.id);

    const yaAnotado = await prisma.anotacion.findUnique({
      where: {
        usuarioId_voluntariadoId: { usuarioId: req.usuarioId, voluntariadoId },
      },
    });

    if (yaAnotado) {
      return res.status(409).json({ error: "Ya estás anotado a este evento" });
    }

    const anotacion = await prisma.anotacion.create({
      data: { usuarioId: req.usuarioId, voluntariadoId },
    });

    res.status(201).json(anotacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al anotarse" });
  }
});

// DELETE /api/voluntariados/:id — borrar
router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const voluntariado = await prisma.voluntariado.findUnique({
      where: { id },
    });
    if (!voluntariado) {
      return res.status(404).json({ error: "No encontrado" });
    }
    if (voluntariado.fijo) {
      return res
        .status(403)
        .json({ error: "Este evento no se puede eliminar" });
    }

    // borramos primero las anotaciones relacionadas, y después el evento
    await prisma.anotacion.deleteMany({ where: { voluntariadoId: id } });
    await prisma.voluntariado.delete({ where: { id } });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// PATCH /api/voluntariados/:id/completar/:usuarioId
// Marca la anotación de un usuario como "Completado" y le suma los bucles.
// Pensado para que lo use un organizador después del evento.
router.patch("/:id/completar/:usuarioId", verificarToken, async (req, res) => {
  try {
    const voluntariadoId = Number(req.params.id);
    const usuarioId = Number(req.params.usuarioId);

    const anotacion = await prisma.anotacion.findUnique({
      where: { usuarioId_voluntariadoId: { usuarioId, voluntariadoId } },
    });

    if (!anotacion) {
      return res
        .status(404)
        .json({ error: "Ese usuario no está anotado a este evento" });
    }
    if (anotacion.estado === "Completado") {
      return res
        .status(409)
        .json({ error: "Ya estaba marcado como completado" });
    }

    const voluntariado = await prisma.voluntariado.findUnique({
      where: { id: voluntariadoId },
    });

    // marcamos completado y sumamos bucles en una sola transacción
    const [anotacionActualizada] = await prisma.$transaction([
      prisma.anotacion.update({
        where: { id: anotacion.id },
        data: { estado: "Completado" },
      }),
      prisma.usuario.update({
        where: { id: usuarioId },
        data: { bucles: { increment: voluntariado.bucles } },
      }),
    ]);

    res.json(anotacionActualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al completar el voluntariado" });
  }
});

// GET /api/voluntariados/mis-anotaciones — historial del usuario logueado
router.get("/mis-anotaciones", verificarToken, async (req, res) => {
  try {
    const anotaciones = await prisma.anotacion.findMany({
      where: { usuarioId: req.usuarioId },
      include: { voluntariado: true },
      orderBy: { creadoEn: "desc" },
    });

    res.json(anotaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el historial" });
  }
});

export default router;
