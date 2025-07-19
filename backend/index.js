import express from "express";
import cors from "cors";
import { Sequelize, DataTypes, Op } from "sequelize";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Middleware de autenticación
const AUTH_TOKEN = "password"; // <- Cambiá esto por algo privado
app.use((req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
});

const dbs = {
  Piscinas: new Sequelize("BlueWave", "root", "root", {
    host: "localhost",
    dialect: "mysql",
  }),
  Camaras: new Sequelize("JQ_Seguridad", "root", "root", {
    host: "localhost",
    dialect: "mysql",
  })
};

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

app.post("/api/trabajos", async (req, res) => {
  const { tipo, quien, cliente, descripcion, gastos, precio, fecha_trabajo } = req.body;

  if (!tipo || !trabajosModels[tipo]) {
    return res.status(400).json({ error: "Tipo inválido" });
  }

  try {
    const db = dbs[tipo];
    const Trabajo = trabajosModels[tipo];
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

app.listen(3001, () => {
  console.log("Servidor backend en http://localhost:3001");
});
