import React from 'react';
import Draggable from 'react-draggable';

// конвертирует touch-нажатия в click для совместимости
// touchend вместо touchstart чтобы отрабатывать точнее
var touchmove;
document.addEventListener('touchend', (e) => {
    if (touchmove !== true){
        e.preventDefault();
        e.target.click();
    }
})

//защита от клика когда свайпаешь
document.addEventListener("touchmove", (e) =>{
    touchmove = true;
})
document.addEventListener("touchstart", (e) =>{
    touchmove = false;
})

function handleClose(div){
    var elem = document.getElementsByClassName(div)[0];
    elem.parentNode.removeChild(elem);
    // document.getElementsByClassName(div)[0].style.visibility = "hidden";
}
function handleMinimize(div){
    var div_element = document.getElementsByClassName(div)[0]
    var status_bar = div_element.getElementsByClassName("status-bar")[0]

    div_element.getElementsByClassName("window-body")[0].style.display = "none";

    if (status_bar.hasChildNodes()){
        status_bar.style.display = "none";
    }
}
function handleMaximize(div){
    var div_element = document.getElementsByClassName(div)[0]
    var status_bar = div_element.getElementsByClassName("status-bar")[0]

    div_element.getElementsByClassName("window-body")[0].style.display = "";

    if (status_bar.hasChildNodes()){
        status_bar.style.display = "";
    }
}
const WindowsDiv = props => {
    return(
        <Draggable bounds={window.innerWidth < 500 ? "body":"html"} handle=".title-bar" onStart={() => props.drag}>
            <div className={props.className}>
                <div className="window">
                    <div className="title-bar">
                        <div className="title-bar-text">{props.title}</div>
                        <div className="title-bar-controls" style={{display: props.enableControls ? "":"none"}}>
                            <button aria-label="Minimize" onClick={() => handleMinimize(props.className)} />
                            <button aria-label="Maximize" onClick={() => handleMaximize(props.className)} />
                            <button aria-label="Close" onClick={() => {
                                try {
                                    props.customHandleClose(props.className)
                                } catch {
                                    handleClose(props.className)
                                }
                            }}/>
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