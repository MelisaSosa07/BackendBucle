import { Router } from "express";
import prisma from "../prisma.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

// GET /api/recompensas — lista todas las disponibles
// GET /api/recompensas?creadorId=5 — las que publicó un usuario
router.get("/", async (req, res) => {
  try {
    const { creadorId, estado } = req.query;

    const filtros = {};
    if (creadorId) filtros.creadorId = Number(creadorId);

    // las recompensas de ejemplo siempre se muestran como disponibles, sin importar cuántas veces ya las haya canjeado otra gente
    if (estado === "Disponible") {
      filtros.OR = [{ fijo: true }, { estado: "Disponible" }];
    } else if (estado) {
      filtros.estado = estado;
    }

    const recompensas = await prisma.recompensa.findMany({
      where: filtros,
      orderBy: { creadoEn: "desc" },
      include: { creador: { select: { nombre: true } } },
    });

    res.json(recompensas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener recompensas" });
  }
});

// POST /api/recompensas — publicar una nueva (requiere login)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { emoji, titulo, categoria, descripcion, bucles, bgColor, ecoTag } =
      req.body;

    if (!titulo || !bucles) {
      return res
        .status(400)
        .json({ error: "Faltan datos obligatorios (título y bucles)" });
    }

    const nueva = await prisma.recompensa.create({
      data: {
        emoji: emoji || "🎁",
        titulo,
        categoria,
        descripcion,
        bucles: Number(bucles),
        bgColor: bgColor || "verde",
        ecoTag: Boolean(ecoTag),
        creadorId: req.usuarioId,
      },
    });

    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la recompensa" });
  }
});

// POST /api/recompensas/:id/canjear — canjear una recompensa con tus bucles
router.post("/:id/canjear", verificarToken, async (req, res) => {
  try {
    const recompensaId = Number(req.params.id);

    const recompensa = await prisma.recompensa.findUnique({
      where: { id: recompensaId },
    });
    if (!recompensa) {
      return res.status(404).json({ error: "Recompensa no encontrada" });
    }

    if (!recompensa.fijo && recompensa.estado === "Canjeada") {
      return res.status(409).json({ error: "Esta recompensa ya fue canjeada" });
    }

    // las recompensas de ejemplo no se pueden canjear dos veces por el mismo usuario, para evitar que alguien la canjee en bucle y se quede con bucles infinitos
    if (recompensa.fijo) {
      const yaCanjeada = await prisma.canje.findFirst({
        where: { usuarioId: req.usuarioId, recompensaId },
      });
      if (yaCanjeada) {
        return res
          .status(409)
          .json({ error: "Ya canjeaste esta recompensa antes" });
      }
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });
    if (usuario.bucles < recompensa.bucles) {
      return res
        .status(400)
        .json({ error: "No tenés suficientes bucles para este canje" });
    }

    // restamos bucles al usuario, guardamos el canje, y si no es fija marcamos "Canjeada"
    const operaciones = [
      prisma.usuario.update({
        where: { id: req.usuarioId },
        data: { bucles: { decrement: recompensa.bucles } },
      }),
      prisma.canje.create({
        data: {
          usuarioId: req.usuarioId,
          recompensaId,
          buclesPagados: recompensa.bucles,
        },
      }),
    ];

    if (!recompensa.fijo) {
      operaciones.push(
        prisma.recompensa.update({
          where: { id: recompensaId },
          data: { estado: "Canjeada" },
        }),
      );
    }

    const resultado = await prisma.$transaction(operaciones);
    const canje = resultado[1];

    res.json({ recompensa, canje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al canjear la recompensa" });
  }
});

// GET /api/recompensas/mis-canjes — historial de canjes del usuario
router.get("/mis-canjes", verificarToken, async (req, res) => {
  try {
    const canjes = await prisma.canje.findMany({
      where: { usuarioId: req.usuarioId },
      include: { recompensa: true },
      orderBy: { creadoEn: "desc" },
    });

    res.json(canjes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tus canjes" });
  }
});

export default router;
