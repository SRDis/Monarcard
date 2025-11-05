import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Importa el CSS

const Navbar = () => {
    // Estado para manejar el menú responsive (hamburguesa)
    const [isOpen, setIsOpen] = useState(false);

    // Modificamos toggleMenu para que, si se llama sin argumento,
    // invierta el estado, y si se llama con 'false', fuerce el cierre.
    const closeMenu = () => {
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar__contenedor-limite">
                
                {/* Logo de Monarcard */}
                <div className="navbar__marca">
                    <Link to="/home" className="navbar__logo_cont" onClick={closeMenu}>
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
                            {/* Cierra el menú al hacer clic en el link */}
                            <Link to="/about" className="navbar__link" onClick={closeMenu}>
                                About Us
                            </Link>
                        </li>
                        <li className="navbar__item">
                            {/* Cierra el menú al hacer clic en el link */}
                            <Link to="/aliados" className="navbar__link" onClick={closeMenu}>
                                Aliar mi negocio
                            </Link>
                        </li>
                        <li className="navbar__item">
                            {/* Cierra el menú al hacer clic en el link */}
                            <Link to="/login" className="navbar__link navbar__link--naranja" onClick={closeMenu}>
                                Ingresar
                            </Link>
                        </li>
                        <li className="navbar__item navbar__item--cta">
                            {/* Cierra el menú al hacer clic en el link */}
                            <Link to="/signup" className="boton boton--pequeno boton--naranja" onClick={closeMenu}>
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