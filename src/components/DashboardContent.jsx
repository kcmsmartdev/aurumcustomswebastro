import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import LogoutButton from "./auth/LogoutButton";
import ShipmentForm from "./ShipmentForm";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function TrackingDashboard() {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [rawShipment, setRawShipment] = useState(null);
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState(null);
  const [localData, setLocalData] = useState(null);

  const [showForm, setShowForm] = useState(false);


 useEffect(() => {
  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      window.location.href = '/login'
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("company, role")
      .eq("id", session.user.id)
      .single()

    if (data){
      setCompany(data.company)
      setRole(data.role)
    } 
  }

  fetchProfile()
}, [])

  const handleSearch = async (e) => {
  e.preventDefault();
  setLoading(true);
  setShipment(null);
  setRawShipment(null);
  setLocalData(null);

  const awbClean = awb.replace('-', '');

  try {
    // Las dos consultas en paralelo
    const [apiRes, supabaseRes] = await Promise.all([
      fetch(`https://api.aurumlogistics.com.pe/api/tracking/awb/${awbClean}`),
      supabase.from('datos_awb').select('*').eq('nro_guia', awb).single()
    ]);

    // Resultado Supabase
    if (supabaseRes.data) setLocalData(supabaseRes.data);

    // Resultado API KLM
    const json = await apiRes.json();
    if (json.success) {
      const t = json.data.Shipments?.[0];
      if (t) {
        const { Shipment, ShipmentCharacteristics, Companies } = t;
        setRawShipment(t);
        setShipment({
          exporter:    Companies?.Shipper?.Name   || '—',
          importer:    Companies?.Consignee?.Name || '—',
          quantity:    `${ShipmentCharacteristics?.TotalPieceCount || '—'} pza`,
          weight:      ShipmentCharacteristics?.TotalGrossWeight
                         ? `${ShipmentCharacteristics.TotalGrossWeight.Value} ${ShipmentCharacteristics.TotalGrossWeight.Unit}`
                         : '—',
          origin:      Shipment.OriginDestination?.DepartureLocation || '—',
          destination: Shipment.OriginDestination?.ArrivalLocation   || '—',
        });
      }
    }

    // Si no hay ninguno de los dos
    if (!supabaseRes.data && !json.success) {
      alert('No se encontraron datos para este AWB');
    }

  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="w-full py-24 px-4 font-Urbanist bg-grisClaro/40 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* CABECERA */}
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
          <div className="self-start md:self-auto flex flex-col lg:flex-row gap-4">
            {role === 'admin' && ( 
              <button onClick={() => setShowForm(true)} className="bg-negro text-white px-6 py-3 rounded-xl font-semibold hover:bg-negro/90 transition">
                Generar registro
              </button>
            )}
            <LogoutButton />
          </div>
          
        </div>

        {/* BUSCADOR */}
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

        {/* RESULTADO */}
        {(shipment || localData) && (
          <div className="grid lg:grid-cols-2 gap-10 mb-10">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-negro mb-6">
                Información del Envío
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <Info label="Exportador"      value={shipment.exporter} />
                <Info label="Importador"      value={shipment.importer} />
                <Info label="Cantidad"        value={shipment.quantity} />
                <Info label="Peso"            value={shipment.weight} />
                <Info label="País de Origen"  value={shipment.origin} />
                <Info label="País de Destino" value={shipment.destination} />
              </div>
            </div>

            {rawShipment && <FlightTimeline shipmentData={rawShipment} />}
          </div>
        )}

      </div>
      {showForm && <ShipmentForm onClose={() => setShowForm(false)} />}
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

function FlightTimeline({ shipmentData }) {
  const { Shipment, FlightPlan, Milestones } = shipmentData;

  const completedEvents = new Set(
    (Milestones?.Events || [])
      .filter(e => e.EventActualTime)
      .map(e => e.EventCode)
  );

  const isDelivered = Shipment.ShipmentStage?.Status === 'DELIVERED';
  const isEnRoute   = Shipment.ShipmentStage?.Phase  === 'EN_ROUTE';
  const phase       = Shipment.ShipmentStage?.Phase;

  const segments = FlightPlan?.SegmentDetails || [];

  const stops = [];
  if (segments.length > 0) {
    stops.push(segments[0].DepartureLocation);
    segments.forEach(s => stops.push(s.ArrivalLocation));
  } else {
    stops.push(Shipment.OriginDestination.DepartureLocation);
    stops.push(Shipment.OriginDestination.ArrivalLocation);
  }

  const getStopStatus = (iata, index) => {
    if (index === 0) return completedEvents.has('DEP') ? 'done' : 'active';
    const isLast = index === stops.length - 1;
    if (isLast) return isDelivered ? 'done' : isEnRoute ? 'active' : 'pending';
    const seg = segments[index];
    if (seg && seg.TransportActualArrivalTime) return 'done';
    return 'pending';
  };

  const getStopDate = (iata, index) => {
    const isLast = index === stops.length - 1;
    if (index === 0) {
      const dep = Milestones?.Events?.find(e => e.EventCode === 'DEP' && e.EventLocation === iata);
      return dep?.EventActualTime;
    }
    if (isLast) {
      const dlv = Milestones?.Events?.find(e => e.EventCode === 'DLV');
      const arr = Milestones?.Events?.find(e => e.EventCode === 'ARR' && e.EventLocation === iata);
      return dlv?.EventActualTime || arr?.EventActualTime;
    }
    const seg = segments[index];
    return seg?.TransportActualArrivalTime;
  };

  const formatShort = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short'
    });
  };

  const PHASE_LABEL = {
    BOOKING:  'Reserva',
    CHECK_IN: 'Check-in',
    EN_ROUTE: 'En tránsito',
    DELIVERY: 'Entregado',
  };

  const STATUS_COLOR = {
    BOOKING:  'bg-blue-100 text-blue-800',
    CHECK_IN: 'bg-yellow-100 text-yellow-800',
    EN_ROUTE: 'bg-orange-100 text-orange-800',
    DELIVERY: 'bg-green-100 text-green-800',
  };

  const EVENT_LABELS = {
    BKG: 'Reserva confirmada',
    FWB: 'Guía aérea procesada',
    FOH: 'Carga recibida en bodega',
    RCS: 'Carga aceptada',
    DEP: 'Salida del vuelo',
    ARR: 'Llegada al aeropuerto',
    RCF: 'Carga recibida en destino',
    NFD: 'Listo para entrega',
    AWD: 'Documentos entregados',
    DLV: 'Entregado',
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">

      {/* Badge de estado */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-negro">Estado del envío</h3>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLOR[phase] || 'bg-gray-100 text-gray-700'}`}>
          {PHASE_LABEL[phase] || phase}
        </span>
      </div>

      {/* Timeline horizontal */}
      <div className="relative flex items-start justify-between">
        {stops.map((iata, i) => {
          const stopStatus = getStopStatus(iata, i);
          const date       = getStopDate(iata, i);
          const isLast     = i === stops.length - 1;
          const vuelo      = i < segments.length ? segments[i]?.TransportIdentifier : null;
          const isDone     = stopStatus === 'done';
          const isActive   = stopStatus === 'active';

          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">

              {/* Línea conectora */}
              {!isLast && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                  <div className={`h-full ${isDone ? 'bg-secundario' : 'border-t-2 border-dashed border-gray-300'}`} />
                  {vuelo && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                      ✈ {vuelo}
                    </span>
                  )}
                </div>
              )}

              {/* Punto */}
              <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                ${isDone   ? 'bg-secundario border-secundario text-white' : ''}
                ${isActive ? 'bg-white border-secundario text-secundario ring-4 ring-secundario/20' : ''}
                ${stopStatus === 'pending' ? 'bg-white border-gray-300 text-gray-300' : ''}
              `}>
                {isDone ? '✓' : i + 1}
              </div>

              {/* IATA */}
              <span className={`mt-2 text-sm font-bold ${isDone || isActive ? 'text-negro' : 'text-gray-300'}`}>
                {iata}
              </span>

              {/* Etiqueta */}
              <span className="text-xs text-gray-400 mt-0.5">
                {i === 0 ? 'Origen' : isLast ? 'Destino' : 'Escala'}
              </span>

              {/* Fecha */}
              {date && (
                <span className="text-xs text-secundario font-medium mt-1">
                  {formatShort(date)}
                </span>
              )}

            </div>
          );
        })}
      </div>

      {/* Historial colapsable */}
      <details className="mt-8">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-negro transition select-none">
          Ver historial completo de eventos
        </summary>
        <div className="mt-4 border-l-2 border-gray-100 pl-4 space-y-4">
          {(Milestones?.Events || [])
            .sort((a, b) => a.Sequence - b.Sequence)
            .map((e, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${e.EventActualTime ? 'bg-secundario' : 'bg-gray-200'}`}
                />
                <div>
                  <p className={`font-medium ${e.EventActualTime ? 'text-negro' : 'text-gray-300'}`}>
                    {EVENT_LABELS[e.EventCode] || e.EventCode}
                    {e.TransportIdentifier && (
                      <span className="ml-1 text-xs text-gray-400">· {e.TransportIdentifier}</span>
                    )}
                  </p>
                  <p className="text-gray-400">
                    {e.EventLocation}
                    {e.EventActualTime && ` · ${new Date(e.EventActualTime).toLocaleString('es-PE', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}`}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </details>

    </div>
  );
}