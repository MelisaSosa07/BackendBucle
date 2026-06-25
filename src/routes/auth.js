import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const router = Router();

// POST /api/auth/registro
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const yaExiste = await prisma.usuario.findUnique({ where: { email } });
    if (yaExiste) {
      return res
        .status(409)
        .json({ error: "Ya existe una cuenta con ese email" });
    }

    const passwordHasheada = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: passwordHasheada, bucles: 250 }, // bono de bienvenida
    });

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    res.status(201).json({ usuario: usuarioSinPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la cuenta" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    res.json({ usuario: usuarioSinPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

export default router;
