import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import voluntariadosRoutes from "./routes/voluntariados.js";
import canastasRoutes from "./routes/canastas.js";
import recompensasRoutes from "./routes/recompensas.js";
import usuariosRoutes from "./routes/usuarios.js";

dotenv.config();

const app = express();

app.use(cors()); // permite que el front llame al servidor
app.use(express.json()); // permite leer JSON

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/voluntariados", voluntariadosRoutes);
app.use("/api/canastas", canastasRoutes);
app.use("/api/recompensas", recompensasRoutes);
app.use("/api/usuarios", usuariosRoutes);

// ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Bucle funcionando 🌱");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
