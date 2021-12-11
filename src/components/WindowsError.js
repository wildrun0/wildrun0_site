import React from 'react';
import errorPng from '../icons/error.png';
import WindowsDiv from './WindowsDiv';

import './styles/WindowsError.css';

const WindowsError = props =>{
    const additionalClass = props.className || ""
    return(
        <WindowsDiv title={props.title} className={"error "+additionalClass} drag={props.drag} enableControls={props.enableControls} onclose={props.onclose}>
            <div className="loading-error-body">
                <img src={errorPng} alt="Error"></img>
                { props.children }
            </div>
        </WindowsDiv>
    )
}
export default WindowsError;