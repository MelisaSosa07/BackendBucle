import { Router } from "express";
import prisma from "../prisma.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

// GET /api/canastas?estado=Disponible — usado en Comunidad.jsx
// GET /api/canastas?usuarioId=5 — usado en MiPerfil.jsx (mis canastas)
router.get("/", async (req, res) => {
  try {
    const { estado, usuarioId } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (usuarioId) filtros.usuarioId = Number(usuarioId);

    const canastas = await prisma.canasta.findMany({
      where: filtros,
      orderBy: { creadoEn: "desc" },
      include: { usuario: { select: { nombre: true } } },
    });

    res.json(canastas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener canastas" });
  }
});

// POST /api/canastas — crear una nueva (requiere login)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { foto, descripcion, ubicacion, cantidad, bucles } = req.body;

    if (!descripcion || !ubicacion || !cantidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const nueva = await prisma.canasta.create({
      data: {
        foto,
        descripcion,
        ubicacion,
        cantidad,
        bucles: bucles ? Number(bucles) : 20,
        usuarioId: req.usuarioId,
      },
    });

    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la canasta" });
  }
});

// PATCH /api/canastas/:id/retirar — marcar como retirada
router.patch("/:id/retirar", verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const canasta = await prisma.canasta.findUnique({ where: { id } });
    if (!canasta) return res.status(404).json({ error: "No encontrada" });
    if (canasta.estado === "Retirada") {
      return res.status(409).json({ error: "Ya fue retirada" });
    }

    const actualizada = await prisma.canasta.update({
      where: { id },
      data: { estado: "Retirada" },
    });

    // sumamos los bucles al usuario que la retiró
    await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { bucles: { increment: canasta.bucles } },
    });

    res.json(actualizada);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al retirar la canasta" });
  }
});

export default router;
