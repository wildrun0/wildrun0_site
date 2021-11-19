import React from "react";

import './styles/MediaButton.css'

const MediaButton = props => {
    const handleClick = () => {
        window.location.href = props.href;
    }
    return (
        <button className="social_btn" onClick={handleClick}> 
             <img src={props.SOCIAL_LOGO_NAME} alt={props.href}></img>
             <p>{props.text}</p>
        </button> 
      );
    }

export default MediaButton