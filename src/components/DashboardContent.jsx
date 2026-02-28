import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import LogoutButton from "./auth/LogoutButton";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function TrackingDashboard() {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [company, setCompany] = useState(null);

  // 🔎 Obtener empresa del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("company")
        .eq("id", user.id)
        .single();

      if (data) {
        setCompany(data.company);
      }
    };

    fetchProfile();
  }, []);

  // 🔎 Simulación búsqueda
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShipment(null);

    setTimeout(() => {
      setShipment({
        exporter: "Global Export SAC",
        importer: "Aurum Customs SAC",
        quantity: "120 cajas",
        weight: "1,450 kg",
        origin: "China",
        destination: "Perú",
        statusTimeline: [
          { status: "Carga recibida en origen", date: "02 Feb 2026", completed: true },
          { status: "Despacho aduanero origen", date: "04 Feb 2026", completed: true },
          { status: "En tránsito internacional", date: "08 Feb 2026", completed: true },
          { status: "Arribo a país destino", date: "15 Feb 2026", completed: false },
          { status: "Entrega final", date: "-", completed: false },
        ],
      });

      setLoading(false);
    }, 1200);
  };

  return (
    <section className="w-full py-24 px-4 font-Urbanist bg-grisClaro/40 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ================= CABECERA ================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-14 gap-6">
          
          <div>
            <p className="text-sm uppercase tracking-widest text-secundario font-bold">
              Tracking de embarque
            </p>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-negro">
              Consulta el estado de tu envío
            </h1>

            <div className="w-16 h-1 bg-secundario mt-6 rounded-full"></div>

            <p className="mt-6 text-gris">
              Sesión iniciada como{" "}
              <span className="font-semibold text-negro">
                {company || "Cargando..."}
              </span>
            </p>
          </div>

          <div className="self-start md:self-auto">
            <LogoutButton />
          </div>
        
        </div>

        {/* ================= BUSCADOR ================= */}
        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            
            <input
              type="text"
              placeholder="Ingresa tu número AWB"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              required
              className="flex-1 px-5 py-4 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-secundario text-white px-8 py-4 rounded-xl font-semibold hover:bg-secundario/90 transition disabled:opacity-60"
            >
              {loading ? "Buscando..." : "Consultar"}
            </button>

          </form>
        </div>

        {/* ================= RESULTADO ================= */}
        {shipment && (
          <div className="grid lg:grid-cols-2 gap-10">

            <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-negro mb-6">
                Información del Envío
              </h3>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <Info label="Exportador" value={shipment.exporter} />
                <Info label="Importador" value={shipment.importer} />
                <Info label="Cantidad" value={shipment.quantity} />
                <Info label="Peso" value={shipment.weight} />
                <Info label="País de Origen" value={shipment.origin} />
                <Info label="País de Destino" value={shipment.destination} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-negro mb-8">
                Estado del Seguimiento
              </h3>

              <div className="relative border-l-2 border-gray-200 pl-6 space-y-10">
                {shipment.statusTimeline.map((step, index) => (
                  <div key={index} className="relative">
                    
                    <span
                      className={`absolute -left-4 top-1 size-3 rounded-full border-2 ${
                        step.completed
                          ? "bg-secundario border-secundario"
                          : "bg-white border-gray-300"
                      }`}
                    ></span>

                    <p className={`font-semibold ${
                      step.completed ? "text-negro" : "text-gris"
                    }`}>
                      {step.status}
                    </p>

                    <p className="text-sm text-gris">
                      {step.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gris">{label}</p>
      <p className="font-semibold text-negro">{value}</p>
    </div>
  );
}