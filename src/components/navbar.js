import React from 'react'
import './styles/navbar.css'
import Navbar_btn from './navbar_btn'
import { Link } from 'react-router-dom'

import logo from "../icons/computer.png"
const Navbar = () => {
    return(
        <nav className = "navbar-container">
            <ul className = "navbar-container-main">
                <div className="logotext">
                    <Link to="/"> <img src={logo}></img></Link>
                    <p> wildrun0 website </p>
                </div>
                <div className="buttons">
                    <Navbar_btn href="/play" text="PLAY"/>
                    <Navbar_btn href="/exp" text="EXPEREMENTAL"/>
                    <Navbar_btn href="/files" text="FILES"/>
                </div>
            </ul>
        </nav>
    )
}

export default Navbar