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
    let elem = document.getElementsByClassName(div)[0];
    elem.parentNode.removeChild(elem);
}
function handleMinimize(div){
    let div_element = document.getElementsByClassName(div)[0]
    let status_bar = div_element.getElementsByClassName("status-bar")[0]

    div_element.getElementsByClassName("window-body")[0].style.display = "none";

    if (status_bar.hasChildNodes()){
        status_bar.style.display = "none";
    }
}
function handleMaximize(div){
    let div_element = document.getElementsByClassName(div)[0]
    let status_bar = div_element.getElementsByClassName("status-bar")[0]

    div_element.getElementsByClassName("window-body")[0].style.display = "";

    if (status_bar.hasChildNodes()){
        status_bar.style.display = "";
    }
}
const WindowsDiv = props => {
    let to_apply = {}
    let handler = "title-bar";

    function teleport_end(e){
        if (e.target.tagName !== "BUTTON"){
            let obj = e.target.parentNode.parentNode
            let style = obj.style;
            let pos = style.transform || style.webkitTransform || style.mozTransform;
            sessionStorage.setItem(props.title, pos);
        }
    }

    let transform = sessionStorage.getItem(props.title);
    try{
        let coords = transform.replace("translate", "").replace("(","").replace(")", "").split(',');
        to_apply["x"] = parseInt(coords[0].replace('px',""));
        to_apply["y"] = parseInt(coords[1].replace('px', ''));
    } catch (err) {
        to_apply["x"] = 0;
        to_apply["y"] = 0;
    }

    return(
        <Draggable defaultPosition={to_apply} bounds={window.innerWidth < 500 ? "body":"html"} handle = {"." + handler} onStart={() => props.drag}>
            <div className={props.className}>
                <div className="window">
                    <div className="title-bar" onMouseUp={teleport_end}>
                        <div className="title-bar-text">{props.title}</div>
                        <div className="title-bar-controls" style={{display: props.enableControls ? "":"none"}}>
                            <button aria-label="Minimize" onClick={() => handleMinimize(props.className)} />
                            <button aria-label="Maximize" onClick={() => handleMaximize(props.className)} />
                            <button aria-label="Close" onClick={() =>{
                                    if(props.handleClose !== undefined){
                                        props.handleClose(document.getElementsByClassName(props.className)[0])
                                    } else{
                                        handleClose(props.className)
                                    }
                                    if(props.onclose !== undefined){
                                        props.onclose(true)
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