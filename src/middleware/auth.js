import jwt from "jsonwebtoken";

// protege rutas: solo deja pasar si el token es válido
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado, falta token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = datos.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}
