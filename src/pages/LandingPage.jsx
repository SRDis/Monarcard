import React from 'react';
import '../styles/LandingPage_style.css';

// Componente para la Tarjeta de Beneficio/Información (ahora usa clases CSS descriptivas)
const Card = ({ icon, title, description, colorClass }) => (
    // 'tarjeta' es el estilo base. 'colorClass' define el color específico (ej. 'tarjeta--naranja')
    <div className={`tarjeta ${colorClass || 'tarjeta--blanca'}`}>
        <div className="tarjeta__icono">{icon}</div>
        <h3 className="tarjeta__titulo">{title}</h3>
        <p className="tarjeta__descripcion">{description}</p>
    </div>
);

// Componente principal de la Landing Page
const MonarcardLandingPage = () => {
    // --- Nombres de Clases de Color como Constantes para el botón CTA ---
    // Estas constantes se usarán para inyectar clases específicas de color en el botón
    const primaryColorClass = 'boton--naranja';
    const secondaryColorClass = 'boton--verde';

    return (
        <div className="contenedor-principal">

            {/* Sección 1: Hero / Portada */}
            <header className="hero" style={{ backgroundImage: "url('src/assets/pexels-ramo-229757033-12107731.jpg')" }}>
                <div className="hero__contenido">
                    <img className='iconoHeroe' src='src/assets/vite.svg'></img>
                    <h1 className="hero__titulo">
                        La nueva forma de vivir Valle de Bravo
                    </h1>
                    <p className="hero__subtitulo">
                        Descubre experiencias, descuentos y beneficios exclusivos con Monarcard, tu membresía digital para disfrutar al máximo Valle de Bravo.
                    </p>
                    {/* El botón usa la clase general 'boton' y la clase de color */}
                    <a href="/signup" className={`boton boton--grande ${primaryColorClass}`}>
                        ¡Obtén tu Monarcard ahora!
                    </a>
                </div>
            </header>

            {/* Sección 2: ¿Qué es Monarcard? */}
            <section className="seccion seccion--blanca">
                <div className="contenedor-limite text-center">
                    <h2 className="seccion__titulo">
                        ¿Qué es <img className='logoTexto' src='src/assets/logo_sinslogan.png'></img>?
                    </h2>
                    <p className="seccion__parrafo seccion__parrafo--grande">
                        Monarcard es una tarjeta digital inteligente que te da acceso a descuentos, promociones y experiencias únicas en los mejores establecimientos de Valle de Bravo.
                    </p>
                    <p className="seccion__parrafo">
                        Cada usuario recibe un QR único que puede presentar en restaurantes, hoteles, tiendas, spas y actividades participantes.
                    </p>

                    {/* Iconos Destacados */}
                    <div className="caracteristicas-destacadas">
                        <div className="caracteristica__item">
                            <span className="caracteristica__icono"><img className='iconoQuees' alt='Turista' src='src/assets/854929.png'></img></span>
                            <p className="caracteristica__nombre">Turista:</p>
                            <p className="caracteristica__detalle">Acceso temporal a beneficios.</p>
                        </div>
                        <div className="caracteristica__item">
                            <span className="caracteristica__icono"><img className='iconoQuees' alt='Local' src='src/assets/10751558.png'></img></span>
                            <p className="caracteristica__nombre">Residente:</p>
                            <p className="caracteristica__detalle">Beneficios recurrentes y reportes mensuales.</p>
                        </div>
                    </div>

                    <a href="/about" className={`boton ${primaryColorClass} mt-3`}>
                        Conoce tus beneficios
                    </a>
                </div>
            </section>

            {/* Sección 3: Beneficios para el usuario */}
            <section id="beneficios" className="seccion seccion--blanca">
                <div className="contenedor-limite text-center">
                    <h2 className="seccion__titulo">
                         Por qué usar <img className='logoTexto' src='src/assets/logo_sinslogan.png'></img>
                    </h2>
                    <div className="contenedor-tarjetas">
                        <Card
                            icon="🏷️"
                            title="Descuentos exclusivos"
                            description="Obtén promociones especiales en restaurantes, hospedaje y experiencias locales."
                            colorClass="tarjeta--naranja-oscura"
                        />
                        <Card
                            icon="✨"
                            title="Experiencias únicas"
                            description="Accede a actividades y eventos diseñados para que vivas Valle de Bravo como un local."
                            colorClass="tarjeta--amarilla"
                        />
                        <Card
                            icon="📱"
                            title="Fácil y práctico"
                            description="Todo en tu móvil: activa tu Monarcard, presenta tu QR y disfruta sin complicaciones."
                            colorClass="tarjeta--naranja-fuerte"
                        />
                    </div>
                </div>
            </section>

            {/* Sección 4: Tipos de Membresía */}
            <section id="membresias" className="seccion seccion--fondo-claro">
                <div className="contenedor-limite text-center">
                    <h2 className="seccion__titulo">
                        Elige tu <img className='logoTexto' src='src/assets/logo_sinslogan.png'></img>
                    </h2>
                    <div className="contenedor-tarjetas contenedor-tarjetas--dos-columnas">
                        <Card
                            icon={<img src="public/images/turista.png" alt="Turista" className="iconoTipo_usuario" />}
                            title="Turista"
                            description="Vigencia: 7 días | Ideal para visitantes de fin de semana | Beneficios válidos una sola vez."
                            colorClass="tarjeta--membresia-turista"
                        />
                        <Card
                            icon={<img src="public/images/residente.png" alt="Residente" className="iconoTipo_usuario" />}
                            title="Residente"
                            description="Vigencia: 12 meses | Acceso recurrente a promociones y experiencias | Reporte mensual de beneficios."
                            colorClass="tarjeta--membresia-residente"
                        />
                    </div>
                    <a href="/signup" className={`boton ${secondaryColorClass} mt-3`}>
                        Elige tu membresía
                    </a>
                </div>
            </section>

            {/* Sección 5: Cómo funciona */}
            <section id="como-funciona" className="seccion seccion--blanca">
                <div className="contenedor-limite text-center">
                    <h2 className="seccion__titulo">
                        ¿ Cómo usar <img className='logoTexto' src='src/assets/logo_sinslogan.png'></img> ?
                    </h2>
                    <div className="contenedor-pasos">
                        {/* Paso 1 */}
                        <div className="paso">
                            <span className="paso__numero">1</span>
                            <h3 className="paso__titulo">Registro del negocio o usuario</h3>
                            <p className="paso__descripcion">Completa tu registro en línea para obtener tu membresía.</p>
                        </div>
                        {/* Paso 2 */}
                        <div className="paso">
                            <span className="paso__numero">2</span>
                            <h3 className="paso__titulo">Recepción de tu QR único</h3>
                            <p className="paso__descripcion">Tu Monarcard digital se genera al instante en tu móvil.</p>
                        </div>
                        {/* Paso 3 */}
                        <div className="paso">
                            <span className="paso__numero">3</span>
                            <h3 className="paso__titulo">Redención en establecimientos participantes</h3>
                            <p className="paso__descripcion">Presenta tu QR en caja y ¡disfruta de tu beneficio!</p>
                        </div>
                    </div>
                    <p className="texto-nota">
                        Cada uso queda registrado automáticamente, garantizando beneficios seguros y transparentes.
                    </p>
                </div>
            </section>

            {/* Sección 6: Beneficios para los negocios aliados (Fondo Verde) */}
            <section className="seccion seccion--verde-oscura" id='beneficiosAliadosHome'>
                <div className="contenedor-limite text-center">
                    <h2 className="seccion__titulo">
                        Beneficios para negocios aliados
                    </h2>
                    <div className="contenedor-tarjetas contenedor-tarjetas--cuatro-columnas">
                        <Card title="Mayor visibilidad y afluencia" icon="📈" description="Llega a una audiencia calificada de turistas y residentes." colorClass="tarjeta--verde-aliado"/>
                        <Card title="Fidelización de clientes" icon="🤝" description="Convierte visitantes ocasionales en clientes recurrentes con ofertas únicas." colorClass="tarjeta--verde-aliado"/>
                        <Card title="Estadísticas útiles" icon="📊" description="Obtén datos valiosos sobre el perfil y consumo de tus clientes." colorClass="tarjeta--verde-aliado"/>
                        <Card title="Control y flexibilidad" icon="⚙️" description="Gestiona tus promociones de forma sencilla y en tiempo real." colorClass="tarjeta--verde-aliado"/>
                    </div>
                    <a href="/aliados" className="boton boton--blanco-verde mt-3">
                        Sé un aliado Monarcard
                    </a>
                </div>
            </section>

            {/* Sección 7: Testimonios */}
            <section className="seccion seccion--testimonios">
                <div className="contenedor-limite contenedor-limite--centrado text-center">
                    <h2 className="seccion__titulo">
                        Qué dicen nuestros usuarios
                    </h2>
                    <div className="testimonio">
                        <span className="testimonio__cita-inicio">“</span>
                        <p className="testimonio__texto">
                            "Gracias a Monarcard descubrí lugares que nunca habría encontrado y ahorré en restaurantes y hospedaje."
                        </p>
                        <p className="testimonio__autor">
                            — Diego Reyna, Turista
                        </p>
                    </div>
                </div>
            </section>

            {/* Sección 8: Llamado final */}
            <section id="obtener" className="seccion-cta seccion--verde-oscura">
                <div className="contenedor-limite cta__contenido">
                    <div className="cta__texto">
                        <h2 className="cta__titulo">
                            <img className='iconoVive' src='src/assets/mariposa_negativo.png'></img> Vive Valle de Bravo al máximo con Monarcard
                        </h2>
                        <p className="cta__parrafo">
                            Únete a la membresía digital que conecta visitantes y residentes con los mejores negocios del destino. Disfruta beneficios exclusivos, apoya al comercio local y vive experiencias únicas.
                        </p>
                    </div>
                    <div className="cta__boton-contenedor">
                        <a href="/signup" className="boton boton--grande boton--secundario">
                            ¡Obtén tu Monarcard hoy!
                        </a>
                    </div>
                </div>
            </section>

            {/* Sección 9: Contacto / Footer */}
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
        </div>
    );
};

export default MonarcardLandingPage;