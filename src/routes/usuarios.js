import { Router } from "express";
import prisma from "../prisma.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

// GET /api/usuarios/me — datos actuales del usuario logueado (incluye bucles al día)
router.get("/me", verificarToken, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        nombre: true,
        email: true,
        bucles: true,
        avatar: true,
        creadoEn: true,
      },
    });

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

// PATCH /api/usuarios/me/avatar — cambiar el emoji de foto de perfil
router.patch("/me/avatar", verificarToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ error: "Falta el avatar" });

    const usuario = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { avatar },
      select: {
        id: true,
        nombre: true,
        email: true,
        bucles: true,
        avatar: true,
      },
    });

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el avatar" });
  }
});

export default router;
