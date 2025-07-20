import 'dotenv/config';
import express from "express";
import cors from "cors";
import { Sequelize, DataTypes, Op } from "sequelize";

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

// 🗄️ Conexiones a las bases
const dbs = {
  Piscinas: new Sequelize(process.env.DB_BLUEWAVE, { dialect: "mysql" }),
  Camaras: new Sequelize(process.env.DB_JQSEGURIDAD, { dialect: "mysql" })
};

// 📦 Modelo de trabajos
const defineTrabajoModel = (sequelize) => sequelize.define("Trabajos", {
  tipo: DataTypes.STRING,
  quien: DataTypes.STRING,
  cliente: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  gastos: DataTypes.DECIMAL(10, 2),
  precio: DataTypes.DECIMAL(10, 2),
  fecha_trabajo: DataTypes.DATEONLY
});

const trabajosModels = {
  Piscinas: defineTrabajoModel(dbs.Piscinas),
  Camaras: defineTrabajoModel(dbs.Camaras)
};

// 🔍 Buscar trabajos
app.get("/api/trabajos/buscar", async (req, res) => {
  const { tipo, quien, cliente, desde, hasta } = req.query;
  const db = dbs[tipo];
  const Trabajo = trabajosModels[tipo];
  if (!db || !Trabajo) return res.status(400).json({ error: "Tipo inválido" });

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
    await db.authenticate();
    await db.sync();
    const trabajos = await Trabajo.findAll({ where, order: [["fecha_trabajo", "DESC"]] });
    res.json(trabajos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ➕ Crear trabajo
app.post("/api/trabajos", async (req, res) => {
  const { tipo, quien, cliente, descripcion, gastos, precio, fecha_trabajo } = req.body;
  const db = dbs[tipo];
  const Trabajo = trabajosModels[tipo];

  if (!tipo || !Trabajo) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    await db.authenticate();
    await db.sync();

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
app.listen(port, () => {
  console.log(`Servidor backend en http://localhost:${port}`);
});
