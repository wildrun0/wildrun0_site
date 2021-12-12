import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';

let touchmove;
function touchToClick(e){
    if (touchmove !== true){
        e.preventDefault();
        e.target.click();
    }
}
function setTouchMove(e){
    let eventType = e.type;
    if (eventType === "touchmove"){
        touchmove = true;
    } else{
        touchmove = false;
    }
}

function getNumbersFromString(numberString){
    var regx = numberString.match(/-?\d+/g).map(Number);
    return regx;
}

let div_params = {}
const WindowsDiv = props => {
    // конвертирует touch-нажатия в click для совместимости
    // touchend вместо touchstart чтобы отрабатывать точнее
    document.addEventListener('touchend', touchToClick);

    //защита от клика когда свайпаешь
    document.addEventListener("touchmove", setTouchMove);
    document.addEventListener("touchstart", setTouchMove);

    const [render, setRender] = useState(true);
    const [is_draggable, setDraggable] = useState(props.drag || false)
    let to_apply = {}
    let have_rights = true;

    // запрещаем расширять окна с ошибками т.к. уродство
    if (props.className.includes("error")){
        have_rights = false;
    }
    useEffect(() => {
        return () =>{
            document.removeEventListener('touchend', touchToClick)
            document.removeEventListener("touchmove", setTouchMove)
            document.removeEventListener("touchstart", setTouchMove)
        }
    }, [])
    function teleport_end(e){
        if (e.target.tagName !== "BUTTON"){
            let obj = e.target.parentNode.parentNode
            let style = obj.style;
            let pos = style.transform || style.webkitTransform || style.mozTransform;
            let coords;
            try{
                coords = getNumbersFromString(pos)
            } catch{}
            sessionStorage.setItem(props.title, coords);
        }
    }

    let transform = sessionStorage.getItem(props.title);
    try{
        let coords = transform.split(',');
        if(coords[0] === "undefined"){
            to_apply["x"] = 0;
            to_apply["y"] = 0;
        } else{
            to_apply["x"] = parseInt(coords[0]);
            to_apply["y"] = parseInt(coords[1]);
        }
    } catch (err) {
        to_apply["x"] = 0;
        to_apply["y"] = 0;
    }
    function handleMinimize(div, have_rights){
        if (have_rights){
            let div_element = document.getElementsByClassName(div)[0]
    
        }
    }
    function handleMaximize(div, have_rights, props){
        if (have_rights){
            let div_element = document.getElementsByClassName(div)[0]
            
            if (div_params[div]){
                // приводим окно в прошлый вид
                let params = div_params[div];
                div_element.style.cssText = `
                    position: ${params[0]}; 
                    top: ${params[1]};
                    left: ${params[2]};
                    transform: ${params[3]};
                    width: ${params[4]};
                    z-index: ${params[5]};
                `;
                div_element.getElementsByClassName("window")[0].style.height = params[6]
                delete div_params[div]
                div_element.classList.remove("maximized");
                setDraggable(props.drag || false);
                if (props.onResize !== undefined){
                    props.onResize('unmaximized', div_element)
                }
            } else{
                let pageWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                let pageHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
                pageHeight = pageHeight - 6;
                div_params[div] = [
                    div_element.style.position, div_element.style.top, 
                    div_element.style.left, div_element.style.transform, 
                    div_element.style.width, div_element.getElementsByClassName("window")[0].style.height,
                    div_element.style.zIndex
                ];
                div_element.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    transform: none;
                    width: ${pageWidth}px;
                    z-index: 995;
                `;
                div_element.getElementsByClassName("window")[0].style.height = pageHeight+"px";
                div_element.classList.add('maximized');
                setDraggable(false);
                if (props.onResize !== undefined){
                    props.onResize('maximized', div_element)
                }
            }
        }
    }
    return(
        <React.Fragment>
            {render && (
                <Draggable defaultPosition={to_apply} bounds={window.innerWidth < 500 ? "body":"html"} handle = ".title-bar" onStart={() => is_draggable}>
                    <div className={props.className}>
                        <div className="window">
                            <div className="title-bar" onMouseUp={teleport_end} onTouchEnd={teleport_end}>
                                <div className="title-bar-text">{props.title}</div>
                                <div className="title-bar-controls" style={{display: props.enableControls ? "":"none"}}>
                                    <button aria-label="Minimize" onClick={() => handleMinimize(props.className, have_rights, props)} />
                                    <button aria-label="Maximize" onClick={() => handleMaximize(props.className, have_rights, props)} />
                                    <button aria-label="Close" onClick={() =>{
                                            setRender(false)
                                            if(props.onclose !== undefined){
                                                props.onclose()
                                            }
                                            delete div_params[props.className]
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
            )}
        </React.Fragment>
    )
}
export default WindowsDiv;