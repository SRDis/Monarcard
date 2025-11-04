import React, { useState } from 'react';
import './Navbar.css'; // Importa el CSS

const Navbar = () => {
    // Estado para manejar el menú responsive (hamburguesa)
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar__contenedor-limite">
                
                {/* Logo de Monarcard */}
                <div className="navbar__marca">
                    <a href="/home" className="navbar__logo_cont">
                        <img className='navbar__logo' alt='Monarcard' src='src/assets/logo_principal.png'></img>
                    </a>
                </div>

                {/* Botón de Hamburguesa (visible solo en móviles) */}
                <button 
                    className={`navbar__toggle ${isOpen ? 'is-active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Abrir menú de navegación"
                >
                    <span className="navbar__toggle-line"></span>
                    <span className="navbar__toggle-line"></span>
                    <span className="navbar__toggle-line"></span>
                </button>

                {/* Links de Navegación */}
                <div className={`navbar__menu ${isOpen ? 'is-open' : ''}`}>
                    <ul className="navbar__lista">
                        <li className="navbar__item">
                            <a href="/about" className="navbar__link">About Us</a>
                        </li>
                        <li className="navbar__item">
                            <a href="/aliados" className="navbar__link">Aliar mi negocio</a>
                        </li>
                        <li className="navbar__item">
                            <a href="/login" className="navbar__link navbar__link--naranja">Ingresar</a>
                        </li>
                        <li className="navbar__item navbar__item--cta">
                            <a href="/signup" className="boton boton--pequeno boton--naranja">
                                ¡Obtener Membresía!
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;