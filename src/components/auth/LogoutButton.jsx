import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="self-start md:self-auto border border-secundario text-secundario px-6 py-3 rounded-xl font-semibold hover:bg-secundario hover:text-white transition-all duration-300"
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}