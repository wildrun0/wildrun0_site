import React from "react";
import { Link } from "react-router-dom";

const NavbarButton = props => {
    return(
        <Link to={props.href}> <button> {props.text} </button> </Link>
    )
}

export default NavbarButton