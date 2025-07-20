import 'dotenv/config';
import express from "express";
import cors from "cors";
import { Sequelize, Op } from "sequelize";
import TrabajoBluewave from "./models/TrabajoBluewave.js";
import TrabajoSeguridad from "./models/TrabajoSeguridad.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Autenticación
const AUTH_TOKEN = process.env.AUTH_TOKEN;
app.use((req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
});

// 📦 Diccionario de modelos según tipo
const modelos = {
  Piscinas: TrabajoBluewave,
  Camaras: TrabajoSeguridad
};

// 🔍 Buscar trabajos
app.get("/api/trabajos/buscar", async (req, res) => {
  const { tipo, quien, cliente, desde, hasta } = req.query;
  const Trabajo = modelos[tipo];
  if (!Trabajo) return res.status(400).json({ error: "Tipo inválido" });

  const where = {};
  if (quien) where.quien = { [Op.like]: `%${quien}%` };
  if (cliente) where.cliente = { [Op.like]: `%${cliente}%` };
  if (desde && hasta) {
    where.fecha_trabajo = { [Op.between]: [desde, hasta] };
  } else if (desde) {
    where.fecha_trabajo = { [Op.gte]: desde };
  } else if (hasta) {
    where.fecha_trabajo = { [Op.lte]: hasta };
  }

  try {
    const trabajos = await Trabajo.findAll({ where, order: [["fecha_trabajo", "DESC"]] });
    res.json(trabajos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ➕ Crear trabajo
app.post("/api/trabajos", async (req, res) => {
  const { tipo, quien, cliente, descripcion, gastos, precio, fecha_trabajo } = req.body;
  const Trabajo = modelos[tipo];

  if (!tipo || !Trabajo) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    const nuevoTrabajo = await Trabajo.create({
      tipo,
      quien,
      cliente,
      descripcion,
      gastos,
      precio,
      fecha_trabajo
    });

    res.status(201).json(nuevoTrabajo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ▶️ Iniciar servidor
const port = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`Servidor backend en http://localhost:${port}`);
  try {
    await TrabajoBluewave.sync({ alter: true });
    await TrabajoSeguridad.sync({ alter: true });
    console.log("Tablas sincronizadas correctamente");
  } catch (err) {
    console.error("Error al sincronizar tablas:", err);
  }
});
