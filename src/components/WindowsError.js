import React, { useEffect } from 'react';
import errorPng from '../icons/error.png';
import WindowsDiv from './WindowsDiv';

import './styles/WindowsError.css';
let defaultClass = "error"
const WindowsError = props =>{
    const additionalClass = props.className || false;
    useEffect(() => {
        const errorDiv = document.getElementsByClassName(defaultClass)[0];
        if (additionalClass){
            errorDiv.classList.add(additionalClass)
        }
    }, [additionalClass]);
    return(
        <WindowsDiv title={props.title} className={defaultClass} drag={props.drag} enableControls={props.enableControls} onclose={props.onclose}>
            <div className="loading-error-body">
                <img src={errorPng} alt="Error"></img>
                { props.children }
            </div>
        </WindowsDiv>
    )
}
export default WindowsError;