import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
                    <Link to="/home" className="navbar__logo_cont">
                        <img className='navbar__logo' alt='Monarcard' src='/assets/logo_principal.png'></img>
                    </Link>
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
                            <Link to="/about" className="navbar__link">About Us</Link>
                        </li>
                        <li className="navbar__item">
                            <Link to="/aliados" className="navbar__link">Aliar mi negocio</Link>
                        </li>
                        <li className="navbar__item">
                            <Link to="/login" className="navbar__link navbar__link--naranja">Ingresar</Link>
                        </li>
                        <li className="navbar__item navbar__item--cta">
                            <Link to="/signup" className="boton boton--pequeno boton--naranja">
                                ¡Obtener Membresía!
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
