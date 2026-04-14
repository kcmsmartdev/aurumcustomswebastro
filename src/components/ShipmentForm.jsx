import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function ShipmentForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nro_guia: "",
    cliente: "",
    descripcion: "",
    etd: "",
    eta: "",
    via: "",
    almacen_llegada: "",
    origen: "",
    destino: "",
    categoria: "",
    dam: "",
    cantidad: "",
    peso: "",
    consignatario: "",
    canal_control: "",
    observaciones: "",
    estado: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("datos_awb222").insert([{
      ...form,
      cantidad: form.cantidad ? parseInt(form.cantidad) : null,
      peso: form.peso ? parseFloat(form.peso) : null,
    }]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Registro guardado correctamente");
      onClose?.();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 mt-24">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-negro">Nuevo Registro</h2>
          <button onClick={onClose} className="text-gris hover:text-negro transition text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <Field label="Nro Guia *"          name="nro_guia"       value={form.nro_guia}       onChange={handleChange} required />
          <Field label="Nombre de Cliente"   name="cliente"        value={form.cliente}        onChange={handleChange} />
          <Field label="Descripción"         name="descripcion"    value={form.descripcion}    onChange={handleChange} className="md:col-span-2" />
          <Field label="ETD / Salida"        name="etd"            value={form.etd}            onChange={handleChange} type="datetime-local" />
          <Field label="ETA / Llegada"       name="eta"            value={form.eta}            onChange={handleChange} type="datetime-local" />
          
          <div>
            <label className="block text-sm font-medium text-negro mb-2">Vía</label>
            <select
              name="via"
              value={form.via}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
            >
              <option value="">Seleccionar</option>
              <option value="AEREA">Aérea</option>
              <option value="MARITIMA">Marítima</option>
              <option value="TERRESTRE">Terrestre</option>
            </select>
          </div>

          <Field label="Almacén de llegada" name="almacen_llegada" value={form.almacen_llegada} onChange={handleChange} />
          <Field label="Origen"             name="origen"         value={form.origen}         onChange={handleChange} />
          <Field label="Destino"            name="destino"        value={form.destino}        onChange={handleChange} />
          <Field label="Categoría"          name="categoria"      value={form.categoria}      onChange={handleChange} />
          <Field label="DAM"                name="dam"            value={form.dam}            onChange={handleChange} />
          <Field label="Cantidad"           name="cantidad"       value={form.cantidad}       onChange={handleChange} type="number" />
          <Field label="Peso"               name="peso"           value={form.peso}           onChange={handleChange} type="number" />
          <Field label="Consignatario"      name="consignatario"  value={form.consignatario}  onChange={handleChange} />
          <Field label="Canal de control"   name="canal_control"  value={form.canal_control}  onChange={handleChange} />
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-negro mb-2">Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-2">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
            >
              <option value="">Seleccionar</option>
              <option value="EN_TRANSITO">En tránsito</option>
              <option value="EN_ADUANA">En aduana</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="RETENIDO">Retenido</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gris py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-secundario text-white py-3 rounded-xl font-semibold hover:bg-secundario/90 transition disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", required, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-negro mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
      />
    </div>
  );
}