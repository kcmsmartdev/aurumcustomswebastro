import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Correo o contraseña incorrectos");
      return;
    }

    // Pequeño delay opcional para UX más suave
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 300);

  } catch (err) {
    setErrorMsg("Ocurrió un error inesperado");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="w-full py-24 px-4 font-Urbanist bg-grisClaro/40">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Lado Informativo */}
        <div>
          <p className="text-sm uppercase tracking-widest text-secundario font-bold">
            Plataforma segura
          </p>

          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-negro leading-tight">
            Accede al estado de tus operaciones en tiempo real
          </h2>

          <div className="w-16 h-1 bg-secundario mt-6 rounded-full"></div>

          <p className="mt-8 text-gris leading-relaxed">
            Consulta el estado de tus embarques, documentación y movimientos 
            logísticos desde nuestra plataforma de tracking. Información 
            actualizada, segura y disponible 24/7.
          </p>

          <ul className="mt-8 space-y-3 text-gris text-sm">
            <li>✔ Seguimiento en tiempo real</li>
            <li>✔ Historial de movimientos</li>
            <li>✔ Documentación disponible</li>
            <li>✔ Plataforma segura</li>
          </ul>
        </div>

        {/* Formulario Login */}
        <div className="relative">
          <div className="absolute -inset-4 bg-secundario/10 rounded-3xl blur-2xl"></div>

          <div className="relative bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-negro">
              Iniciar sesión
            </h3>

            <p className="text-sm text-gris mt-2 mb-8">
              Ingresa tus credenciales para acceder al sistema.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-negro mb-2">
                  Usuario o correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="usuario@empresa.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-negro mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secundario focus:ring-2 focus:ring-secundario/20 outline-none transition"
                />
              </div>

              {/* Error */}
              {errorMsg && (
                <p className="text-red-500 text-sm">
                  {errorMsg}
                </p>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secundario text-white py-3 rounded-xl font-semibold hover:bg-secundario/90 transition-all duration-300 shadow-md disabled:opacity-60"
              >
                {loading ? "Accediendo..." : "Acceder al Tracking"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}