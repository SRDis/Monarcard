import React from "react";
import "../styles/AliadosLanding.css";

const AliadosLanding = () => {
  return (
    <div className="aliados">
      {/* Hero */}
      <section className="aliados--hero">
        <div className="aliados--overlay">
          <h1 className="aliados--titulo"><img className="logoprinc_aliados" src="/assets/logo_neg_sinslogan.png" alt="Monarcard"></img> <a className="textoNaranjaAliados">Aliados</a></h1>
          <p className="aliados--subtitulo">
            La nueva forma de vivir y promover Valle de Bravo
          </p>
          <a href="/signup" className="aliados--boton boton--naranja">
            Súmate como aliado
          </a>
        </div>
      </section>

      {/* Introducción */}
      <section className="aliados--seccion">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion">Introducción</h2>
          <p>
            Valle de Bravo es un destino vivo, en constante movimiento. Visitantes y residentes buscan experiencias auténticas, trato preferencial y un sentido de pertenencia con la comunidad local.
          </p>
          <p>
            <strong>Monarcard</strong> nace para conectar a quienes disfrutan de Valle con los negocios que lo hacen único.
            Una membresía turística digital que impulsa el consumo local, genera lealtad y promueve una red de beneficios exclusivos en todo el destino.
          </p>
        </div>
      </section>

      {/* Qué es Monarcard */}
      <section className="aliados--seccion aliados--fondo-claro">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion">💡 ¿Qué es Monarcard?</h2>
          <p>
            Monarcard es una tarjeta digital inteligente que ofrece descuentos, promociones y experiencias únicas en los principales establecimientos de Valle de Bravo.
          </p>
          <p>
            Cada usuario recibe una tarjeta personalizada con un QR único. Los negocios escanean el código desde una web app sencilla para registrar el uso y obtener datos reales de consumo.
          </p>
        </div>
      </section>

      {/* Objetivo */}
      <section className="aliados--seccion">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion">🧭 Objetivo</h2>
          <p>
            Impulsar la economía local conectando a visitantes y residentes con los negocios de Valle de Bravo mediante una membresía digital práctica, transparente y confiable.
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="aliados--seccion aliados--fondo-verde">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion-blanco"> Beneficios para los aliados</h2>

          <div className="aliados--grid">
            <div className="aliados--card">
              <h3>1️⃣ Mayor afluencia y visibilidad</h3>
              <p>Monarcard te conecta con un público dispuesto a consumir en negocios locales. Tu marca aparece en nuestro directorio, redes y materiales turísticos.</p>
            </div>
            <div className="aliados--card">
              <h3>2️⃣ Herramienta de fidelización</h3>
              <p>Atrae nuevos clientes y recompénsalos con beneficios exclusivos. Monarcard impulsa la recompra y la recomendación.</p>
            </div>
            <div className="aliados--card">
              <h3>3️⃣ Estadísticas e información útil</h3>
              <p>Conoce cuántos visitantes redimen beneficios, en qué fechas y con qué frecuencia. Usa esos datos para ajustar tus promociones.</p>
            </div>
            <div className="aliados--card">
              <h3>4️⃣ Control y flexibilidad</h3>
              <p>Tú decides qué beneficios ofrecer, cuándo activarlos y por cuánto tiempo. Modifícalos fácilmente desde tu panel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="aliados--seccion">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion">⚙️ ¿Cómo funciona?</h2>
          <ol className="aliados--lista">
            <li>1. Registro del negocio y definición de promociones.</li>
            <li>2. El usuario activa su Monarcard y recibe su QR digital.</li>
            <li>3. El negocio escanea el QR para validar el beneficio.</li>
            <li>4. El sistema registra el uso y genera reportes automáticos.</li>
          </ol>
        </div>
      </section>

      {/* Niveles de participación */}
      <section className="aliados--seccion aliados--fondo-claro">
        <div className="aliados--contenedor">
          <h2 className="aliados--titulo-seccion">💎 Niveles de participación</h2>
          <table className="aliados--tabla">
            <thead>
              <tr>
                <th>Tipo de aliado</th>
                <th>Aporte</th>
                <th>Beneficios principales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Aliado Monarcard</td>
                <td>$150 de inscripción anual</td>
                <td>Aparición básica en el directorio digital y acceso a la web app.</td>
              </tr>
              <tr>
                <td>Aliado Premium</td>
                <td><b>$350</b> mensual o $3000 anual</td>
                <td>Promoción destacada, prioridad en listados y estadísticas avanzadas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Final */}
      <section id="registro" className="aliados--cta">
        <div className="aliados--contenedor">
          <h2>🤝 Súmate a la red de aliados Monarcard</h2>
          <p>Forma parte del nuevo modelo turístico digital que impulsa a los negocios locales y mejora la experiencia de cada visitante.</p>
          <a href="/signup" className="aliados--boton aliados--boton-dorado">
            Registrarme ahora
          </a>
        </div>
      </section>

      <footer className="footer">
                <div className="contenedor-limite footer__contenido">
                    {/* Branding y Contacto */}
                    <div className="footer__columna">
                        <img className='logoFooter' src='/assets/logo_negativo.png' alt='Monarcard'></img>
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
                            <li><a href="#" className="footer__link">Beneficios para Negocios</a></li>
                            <li><a href="/aliados" className="footer__link">Regístrate como Aliado</a></li>
                        </ul>
                    </div>
                    {/* Redes Sociales */}
                    <div className="footer__columna">
                        <h4 className="footer__subtitulo">Síguenos</h4>
                        <div className="footer__redes">
                            {/* Reemplazar con íconos reales de redes sociales */}
                            <a href="#" className="footer__icono-social">
                                <img className='icono-social' alt='Facebook' src='/assets/Logo_de_Facebook.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Instagram' src='/assets/Instagram_icon.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Facebook' src='/assets/tiktok_icono.png'></img>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer__copyright">
                    &copy; {new Date().getFullYear()} Monarcard. Todos los derechos reservados.
                </div>
            </footer>
    </div>
  );
};

export default AliadosLanding;
