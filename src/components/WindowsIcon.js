import React from 'react'
import './styles/WindowsIcon.css'

const WindowsIcon = ({icon, name, onclick}) => {
    return(
        <div className="win_icon" onClick={(e) => onclick(e, name)}>
            <img src={icon} alt="programm icon"></img>
            <p>{name}</p>
        </div>
    )

}
export default WindowsIcon