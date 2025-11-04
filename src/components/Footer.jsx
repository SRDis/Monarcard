<footer className="footer">
                <div className="contenedor-limite footer__contenido">
                    {/* Branding y Contacto */}
                    <div className="footer__columna">
                        <img className='logoFooter' src='public/images/logo_negativo.png' alt='Monarcard'></img>
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
                                <img className='icono-social' alt='Facebook' src='public/images/Logo_de_Facebook.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Instagram' src='public/images/Instagram_icon.png'></img>
                            </a>
                            <a href="#" className="footer__icono-social">
                            <img className='icono-social' alt='Facebook' src='public/images/tiktok_icono.png'></img>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer__copyright">
                    &copy; {new Date().getFullYear()} Monarcard. Todos los derechos reservados.
                </div>
            </footer>