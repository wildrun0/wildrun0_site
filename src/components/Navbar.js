import React from 'react'
import './styles/Navbar.css'
import NavbarButton from './NavbarButton'
import { Link } from 'react-router-dom'

import logo from "../icons/computer.png"

const Navbar = () => {
    return(
        <nav className = "navbar-container">
            <ul className = "navbar-container-main">
                <div className="logotext">
                    <Link to="/"><img src={logo} alt="logo"></img></Link>
                    <p> wildrun0 website </p>
                </div>
                <div className="buttons">
                    <NavbarButton href="/play" text="PLAY"/>
                    <NavbarButton href="/experimental" text="EXPERIMENTAL"/>
                    <NavbarButton href="/files" text="FILES"/>
                </div>
            </ul>
        </nav>
    )
}

export default Navbar