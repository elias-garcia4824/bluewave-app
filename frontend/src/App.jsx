import { useState } from "react";
import axios from "axios";

export default function App() {
  const [formData, setFormData] = useState({
    tipo: "Piscinas",
    quien: "",
    cliente: "",
    descripcion: "",
    gastos: "",
    precio: "",
    fecha_trabajo: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/api/trabajos", formData);
      alert("Trabajo guardado correctamente");
      setFormData({ tipo: "Piscinas", quien: "", cliente: "", descripcion: "", gastos: "", precio: "", fecha_trabajo: "" });
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registrar trabajo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full p-2 border">
          <option value="Piscinas">Piscinas</option>
          <option value="Camaras">Cámaras</option>
        </select>
        <input name="quien" placeholder="Quién hizo el trabajo" value={formData.quien} onChange={handleChange} className="w-full p-2 border" required />
        <input name="cliente" placeholder="Nombre del cliente" value={formData.cliente} onChange={handleChange} className="w-full p-2 border" required />
        <textarea name="descripcion" placeholder="Descripción (opcional)" value={formData.descripcion} onChange={handleChange} className="w-full p-2 border" />
        <input name="gastos" placeholder="Gastos" type="number" value={formData.gastos} onChange={handleChange} className="w-full p-2 border" required />
        <input name="precio" placeholder="Precio" type="number" value={formData.precio} onChange={handleChange} className="w-full p-2 border" required />
        <input name="fecha_trabajo" type="date" value={formData.fecha_trabajo} onChange={handleChange} className="w-full p-2 border" required />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full">Guardar</button>
      </form>
    </div>
  );
}
