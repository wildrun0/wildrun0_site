import React from 'react';
import Draggable from 'react-draggable';

function handleClose(div){
    document.getElementsByClassName(div)[0].style.visibility = "hidden";
}
function handleMinimize(div){
    var div_element = document.getElementsByClassName(div)[0]
    div_element.getElementsByClassName("window-body")[0].style.display = "none";

    if (div_element.getElementsByClassName("status-bar")[0].hasChildNodes()){
        div_element.getElementsByClassName("status-bar")[0].style.display = "none";
    }
}
function handleMaximize(div){
    var div_element = document.getElementsByClassName(div)[0]
    div_element.getElementsByClassName("window-body")[0].style.display = "";

    if (div_element.getElementsByClassName("status-bar")[0].hasChildNodes()){
        div_element.getElementsByClassName("status-bar")[0].style.display = "";
    }
}
const WindowsDiv = props => {
    return(
        <Draggable bounds={window.innerWidth < 500 ? "body":"html"} handle=".title-bar" onStart={() => props.drag}>
            <div className={props.className}>
                <div className="window">
                    <div className="title-bar">
                        <div className="title-bar-text">{props.title}</div>
                        <div className="title-bar-controls">
                            <button aria-label="Minimize" onClick={() => handleMinimize(props.className)}></button>
                            <button aria-label="Maximize" onClick={() => handleMaximize(props.className)}></button>
                            <button aria-label="Close" onClick={() => handleClose(props.className)}></button>
                        </div>
                    </div>
                    <div className="window-body">
                        { React.Children.count(props.children) === 1 ? props.children : props.children[0] }
                    </div>
                    <div className="status-bar">
                        { props.children[1] }
                    </div>
                </div>
            </div>
        </Draggable>
    )
}
export default WindowsDiv;