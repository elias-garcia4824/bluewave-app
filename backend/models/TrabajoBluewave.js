import { DataTypes } from "sequelize";
import db from "../config/database.js";

const TrabajoBluewave = db.define("trabajos_bluewave", {
  tipo: DataTypes.STRING,
  quien: DataTypes.STRING,
  cliente: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  gastos: DataTypes.DECIMAL(10, 2),
  precio: DataTypes.DECIMAL(10, 2),
  fecha_trabajo: DataTypes.DATEONLY
});

export default TrabajoBluewave;
