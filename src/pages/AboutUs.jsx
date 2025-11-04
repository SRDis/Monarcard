// src/pages/AboutUs.jsx
import React, { useState, useEffect } from "react"; 
import { supabase } from "../services/supabaseClient";

/**
 * Página "About Us" para Monarcard
 * - Mantengo toda tu estructura original (hero, misión, equipo, footer)
 * - Aliados: traigo datos exactamente como en tu BenefitCard:
 *     -> benefits (tabla) como fuente principal (uso usuario_id)
 *     -> businesses por .eq("usuario_id", ...)
 */

// --- DATOS INICIALES (equipo) ---
const team = [
  {
    id: 1,
    name: "Salvador Reyes",
    role: "Director General y Desarrollo",
    bio: "Encargado de la estrategia. Convierte ideas en productos digitales funcionales, gestionando el rumbo y la salud financiera del proyecto.",
    photo: "src/assets/salvador_reyes.png",
  },
  {
    id: 2,
    name: "Oliver Guijoza",
    role: "Expansión Comercial y Alianzas",
    bio: "Responsable de las ventas, la expansión en terreno y la coordinación de promotores. Conecta directamente con nuevos aliados y oportunidades de negocio.",
    photo: "src/assets/oliver_guijoza.png",
  },
  {
    id: 3,
    name: "Oscar Perrusquia",
    role: "Operaciones y Relaciones Clave",
    bio: "Motor de la operación diaria. Se encarga de la atención al cliente, cobranza y el desarrollo continuo de las alianzas con prestadores de servicios.",
    photo: "src/assets/oscar_perrus.png",
  },
];

// --- CONSTANTES ---
const ALLIES_PER_PAGE = 6; 

export default function AboutUs() {
  const [visibleAlliesCount, setVisibleAlliesCount] = useState(ALLIES_PER_PAGE);

  // Estado para aliados obtenidos desde supabase (beneficio + negocio)
  const [allies, setAllies] = useState([]);
  const [loadingAllies, setLoadingAllies] = useState(true);

  useEffect(() => {
    const fetchAllies = async () => {
      setLoadingAllies(true);
      try {
        // 1) Traer beneficios (tabla benefits) — uso mismo shape que tu BenefitCard
        const { data: beneficiosData, error: beneficiosError } = await supabase
          .from("benefits")
          .select("id, descripcion, descuento_porcentaje, usuario_id")
          .order("id", { ascending: true }); // opcional

        if (beneficiosError) {
          console.error("Error al obtener beneficios:", beneficiosError);
          setAllies([]);
          setLoadingAllies(false);
          return;
        }

        // Si no hay beneficios, salimos limpiamente
        if (!beneficiosData || beneficiosData.length === 0) {
          setAllies([]);
          setLoadingAllies(false);
          return;
        }

        // 2) Por cada beneficio, traemos el negocio usando usuario_id EXACTAMENTE como en BenefitCard
        const resultados = await Promise.all(
          beneficiosData.map(async (beneficio) => {
            if (!beneficio?.usuario_id) return null;

            const { data: negocio, error: negocioError } = await supabase
              .from("businesses")
              .select("nombre, latitud, longitud, logo_url, categoria, id")
              .eq("usuario_id", beneficio.usuario_id)
              .single();

            if (negocioError || !negocio) {
              console.warn(
                `Negocio no encontrado para usuario_id ${beneficio.usuario_id} (benefit id ${beneficio.id})`,
                negocioError ?? ""
              );
              return null;
            }

            const googleMapsUrl =
              negocio.latitud && negocio.longitud
                ? `https://www.google.com/maps/search/?api=1&query=${negocio.latitud},${negocio.longitud}`
                : null;

            return {
              // Mantengo keys que tus tarjetas usan: name/category/logo/discount
              id: beneficio.id,
              business_id: negocio.id ?? null,
              name: negocio.nombre,
              category: negocio.categoria,
              logo: negocio.logo_url,
              // Prioriza descripcion (texto). Si quieres mostrar porcentaje, lo puedes tomar de descuento_porcentaje.
              discount:
                beneficio.descripcion ||
                (beneficio.descuento_porcentaje
                  ? `${beneficio.descuento_porcentaje}%`
                  : "Beneficio disponible"),
              googleMapsUrl,
              rawBenefit: beneficio,
            };
          })
        );

        // Filtramos nulos (beneficios sin negocio encontrado)
        setAllies(resultados.filter((r) => r !== null));
      } catch (err) {
        console.error("Error inesperado al cargar aliados:", err);
        setAllies([]);
      } finally {
        setLoadingAllies(false);
      }
    };

    fetchAllies();
  }, []);

  const handleShowMore = () => {
    setVisibleAlliesCount((prev) => prev + ALLIES_PER_PAGE);
  };

  const alliesToRender = allies.slice(0, visibleAlliesCount);
  const allLoaded = visibleAlliesCount >= allies.length;

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroText}>
            <h1 style={styles.h1}>
              Conectando experiencias en Valle de Bravo
            </h1>
            <p style={styles.lead}>
              Somos una plataforma local que facilita descuentos y beneficios
              exclusivos para turistas y residentes. Apoyamos a negocios aliados
              para atraer clientes de calidad y brindar experiencias memorables.
            </p>

            <div style={styles.ctaRow}>
              <a href="/signup" style={styles.primaryBtn}>
                Únete como cliente
              </a>
              <a href="/dashboard-negocio" style={styles.ghostBtn}>
                Soy negocio
              </a>
            </div>
          </div>

          <div style={styles.heroMedia}>
            <img
              src="src/assets/logo_principal.png"
              alt="Vista Valle de Bravo"
              style={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* ALIADOS CON FUNCIONALIDAD "MOSTRAR MÁS" */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Nuestros Aliados</h2>
          <p style={styles.p}>
            Una muestra de los negocios de calidad que confían en Monarcard.
            Disfruta de beneficios exclusivos.
          </p>

          <div style={styles.allyGrid}>
            {loadingAllies ? (
              <p style={styles.p}>Cargando aliados...</p>
            ) : alliesToRender.length > 0 ? (
              alliesToRender.map((ally) => (
                <AllyCard key={`${ally.business_id ?? "b"}-${ally.id}`} ally={ally} />
              ))
            ) : (
              <p style={styles.p}>No hay aliados disponibles por ahora.</p>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            {!allLoaded && !loadingAllies && allies.length > 0 && (
              <button 
                onClick={handleShowMore} 
                style={styles.ghostBtn}
              >
                MÁS BENEFICIOS
              </button>
            )}
            {allLoaded && !loadingAllies && allies.length > 0 && (
                <p style={{...styles.p, color: '#666'}}>
                    🎉 ¡Has visto todos nuestros beneficios!
                </p>
            )}
          </div>
        </div>
      </section>
      
      {/* MISION / VALORES */}
      <section style={{...styles.section, background: "#f8f8f8"}}>
        <div style={styles.container}>
          <div style={styles.col2}>
            <div>
              <h2 style={styles.h2}>Nuestra misión</h2>
              <p style={styles.p}>
                Facilitar el acceso a experiencias locales, ayudando a turistas
                y residentes a descubrir y aprovechar promociones auténticas, y
                a los negocios a incrementar su clientela de forma sostenible.
              </p>
            </div>

            <div>
              <h2 style={styles.h2}>Nuestros valores</h2>
              <ul style={styles.valuesList}>
                <li style={styles.valueItem}>
                  <strong>Localidad:</strong> Conocemos y trabajamos con la
                  comunidad.
                </li>
                <li style={styles.valueItem}>
                  <strong>Transparencia:</strong> Procesos claros y justos para
                  negocios y usuarios.
                </li>
                <li style={styles.valueItem}>
                  <strong>Calidad:</strong> Aliados seleccionados para
                  experiencias reales.
                </li>
                <li style={styles.valueItem}>
                  <strong>Innovación:</strong> Tecnología sencilla que funciona
                  para todos.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section style={{ ...styles.section, background: "#F9FFF9" }}>
        <div style={styles.container}>
          <h2 style={styles.h2}>El equipo</h2>
          <p style={styles.p}>
            Un equipo pequeño, práctico y comprometido con Valle de Bravo.
          </p>

          <div style={styles.teamGrid}>
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <div>
              <h3 style={styles.h3}>¿Listo para empezar?</h3>
              <p style={styles.p}>
                Únete a Monarcard y empieza a disfrutar descuentos en tus
                lugares favoritos.
              </p>
            </div>
            <div>
              <a href="/signup" style={styles.primaryBtn}>
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
                <div className="contenedor-limite footer__contenido">
                    {/* Branding y Contacto */}
                    <div className="footer__columna">
                        <img className='logoFooter' src='src/assets/logo_negativo.png' alt='Monarcard'></img>
                        <p className="footer__detalle">Membresía Turística Digital</p>
                        <p className="footer__detalle">📍 Valle de Bravo, México</p>
                        <p className="footer__detalle">✉️ contacto@monarcard.mx</p>
                    </div>
                    {/* Menús de Navegación (Ejemplo) */}
                    <div className="footer__columna">
                        <h4 className="footer__subtitulo">Descubre</h4>
                        <ul className="footer__lista">
                            <li><a href="#beneficios" className="footer__link">Beneficios</a></li>
                            <li><a href="#membresias" className="footer__link">Tipos de Membresía</a></li>
                            <li><a href="#como-funciona" className="footer__link">Cómo Funciona</a></li>
                        </ul>
                    </div>
                    <div className="footer__columna">
                        <h4 className="footer__subtitulo">Aliados</h4>
                        <ul className="footer__lista">
                            <li><a href="#beneficiosAliadosHome" className="footer__link">Beneficios para Negocios</a></li>
                            <li><a href="/aliados" className="footer__link">Regístrate como Aliado</a></li>
                        </ul>
                    </div>
                    {/* Redes Sociales */}
                    <div className="footer__columna">
                        <h4 className="footer__subtitulo">Síguenos</h4>
                        <div className="footer__redes">
                            {/* Reemplazar con íconos reales de redes sociales */}
                            <a href="https://www.facebook.com/monarcard" target="_blank" rel="noopener noreferrer"  className="footer__icono-social">
                                <img className='icono-social' alt='Facebook' src='src/assets/Logo_de_Facebook.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Instagram' src='src/assets/Instagram_icon.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Facebook' src='src/assets/tiktok_icono.png'></img>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer__copyright">
                    &copy; {new Date().getFullYear()} Dextreme. Todos los derechos reservados.
                </div>
            </footer>

    </main>
  );
}

/* ---------- TeamCard (componente interno) ---------- */
function TeamCard({ member }) {
  return (
    <article style={styles.teamCard}>
      <img
        src={member.photo}
        alt={`${member.name} — ${member.role}`}
        style={styles.teamPhoto}
        onError={(e) => {
          e.currentTarget.src = "/images/team-placeholder.png";
        }}
      />
      <h4 style={styles.teamName}>{member.name}</h4>
      <p style={styles.teamRole}>{member.role}</p>
      <p style={styles.teamBio}>{member.bio}</p>
    </article>
  );
}

/* ---------- AllyCard (NUEVO componente interno) ---------- */
function AllyCard({ ally }) {
  return (
    <article style={styles.allyCard}>
      <img
        src={ally.logo}
        alt={`${ally.name} logo`}
        style={styles.allyLogo}
        onError={(e) => {
          e.currentTarget.src = "/images/ally-placeholder.png"; // Placeholder genérico
        }}
      />
      <div style={styles.allyContent}>
        <span style={styles.allyCategory}>{ally.category}</span>
        <h4 style={styles.allyName}>{ally.name}</h4>
        <div style={styles.allyDiscount}>{ally.discount}</div> 
        {ally.googleMapsUrl && (
          <div style={{ marginTop: 8 }}>
            <a href={ally.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={styles.locationBtn}>Ubicación</button>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------- Styles ---------- */
const styles = {
  page: {
    fontFamily: "Inter, Arial, sans-serif",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  hero: {
    padding: "48px 0",
    background: "linear-gradient(180deg, rgba(27,94,32,0.03), #fff)",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    gap: 32,
    alignItems: "center",
    padding: "0 20px",
    flexWrap: "wrap",
  },
  heroText: { flex: "1 1 420px" },
  h1: { fontSize: "2rem", margin: "0 0 12px 0", color: "#1B5E20" },
  lead: { color: "#333", marginBottom: 18, fontSize: "1.05rem" },
  ctaRow: { display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" },
  heroMedia: { flex: "0 0 360px", display: "flex", justifyContent: "center" },
  heroImage: {
    width: "100%",
    height: "auto",
    borderRadius: 12,
    objectFit: "cover",
  },
  section: { padding: "32px 0" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 20px" },
  col2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 },
  h2: { color: "#1B5E20", marginBottom: 8 },
  h3: { color: "#1B5E20", marginBottom: 6 },
  p: { color: "#444", marginTop: 0 },
  valuesList: { paddingLeft: 18, marginTop: 8 },
  valueItem: { marginBottom: 8 },
  
  // Estilos del Equipo
  teamGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
  },
  teamCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
    textAlign: "center",
  },
  teamPhoto: { width: 96, height: 96, borderRadius: 999, objectFit: "cover", marginBottom: 12 },
  teamName: { margin: "6px 0 4px 0", fontSize: "1.05rem" },
  teamRole: { margin: 0, color: "#666", fontSize: "0.9rem" },
  teamBio: { fontSize: "0.9rem", color: "#444", marginTop: 8 },

  // Estilos de Aliados
  allyGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  allyCard: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: 10,
    padding: 16,
    border: "1px solid #ddd",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  allyLogo: {
    width: 64,
    height: 64,
    borderRadius: 8,
    objectFit: "contain",
    border: "1px solid #eee",
    padding: 4,
    flexShrink: 0, 
  },
  allyContent: {
    flexGrow: 1,
  },
  allyCategory: {
    fontSize: "0.8rem",
    color: "#666",
    background: "#f0f0f0",
    padding: "2px 8px",
    borderRadius: 4,
    display: "inline-block",
    marginBottom: 4,
  },
  allyName: {
    margin: "0 0 4px 0",
    fontSize: "1.1rem",
    color: "#1a1a1a",
  },
  allyDiscount: {
    fontWeight: "bold",
    color: "#D32F2F", 
    fontSize: "1rem",
  },

  // Estilos de Botones y CTA
  cta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 18,
    background: "#FFF8E6",
    borderRadius: 10,
    marginTop: 8,
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "#1B5E20",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    textDecoration: "none",
    display: "inline-block",
  },
  ghostBtn: {
    background: "transparent",
    color: "#1B5E20",
    padding: "10px 16px",
    borderRadius: 8,
    textDecoration: "none",
    border: "1px solid #1B5E20",
    display: "inline-block",
    transition: "background-color 0.3s",
    cursor: 'pointer',
    lineHeight: 'normal',
  },
  footer: { borderTop: "1px solid #eee", marginTop: 36, padding: "24px 0" },

  // Botón ubicación
  locationBtn: {
    backgroundColor: "#348A15",
    color: "white",
    padding: "8px 18px",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
};
