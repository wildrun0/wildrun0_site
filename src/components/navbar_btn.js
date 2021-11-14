import React from "react";
import { Link } from "react-router-dom";

const Navbar_btn = props => {
    return(
        <Link to={props.href}> <button> {props.text} </button> </Link>
    )
}
export default Navbar_btn