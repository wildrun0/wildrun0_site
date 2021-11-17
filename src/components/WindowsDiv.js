import React from 'react';
import Draggable from 'react-draggable';

function handleClose(div){
    document.getElementsByClassName(div)[0].style.visibility = "hidden";
}

const WindowsDiv = props => {
    return(
        <Draggable bounds="html" handle=".title-bar" onStart={() => props.drag}>
            <div className={props.className}>
                <div className="window">
                    <div className="title-bar">
                        <div className="title-bar-text">{props.title}</div>
                        <div className="title-bar-controls">
                            <button aria-label="Minimize"></button>
                            <button aria-label="Maximize"></button>
                            <button aria-label="Close" onClick={() => handleClose(props.className)}></button>
                        </div>
                    </div>
                    <div className="window-body">
                        { props.children }
                    </div>
                </div>
            </div>
        </Draggable>
    )
}
export default WindowsDiv;