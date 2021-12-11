import React, { useEffect, useReducer, useState } from 'react';
import Draggable from 'react-draggable';

let pageWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let pageHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;

pageHeight = pageHeight - 6;
console.warn(pageHeight)
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

let div_params = {}
function handleMinimize(div, have_rights){
    if (have_rights){
        let div_element = document.getElementsByClassName(div)[0]

    }
}
function handleMaximize(div, have_rights){
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
        } else{
            console.log("maximizing now")
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
                z-index: 999;
            `;
            div_element.getElementsByClassName("window")[0].style.height = pageHeight+"px";
        }
    }
}
const WindowsDiv = props => {
    const [render, setRender] = useState(true);
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    let to_apply = {}
    let is_draggable = props.drag || false;
    let have_rights = true;
    // запрещаем расширять окна с ошибками т.к. уродство
    if (props.className === "error"){
        have_rights = false;
    }
    useEffect(() => {
        function handleResize(e){
            pageWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            pageHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
        }
        window.addEventListener('resize', handleResize);
        return () =>{
            window.removeEventListener('resize', handleResize)
        }
    }, [])
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
        <React.Fragment>
            {render && (
                <Draggable defaultPosition={to_apply} bounds={window.innerWidth < 500 ? "body":"html"} handle = ".title-bar" onStart={() => is_draggable}>
                    <div className={props.className}>
                        <div className="window">
                            <div className="title-bar" onMouseUp={teleport_end} onTouchEnd={teleport_end}>
                                <div className="title-bar-text">{props.title}</div>
                                <div className="title-bar-controls" style={{display: props.enableControls ? "":"none"}}>
                                    <button aria-label="Minimize" onClick={() => handleMinimize(props.className, have_rights)} />
                                    <button aria-label="Maximize" onClick={() => handleMaximize(props.className, have_rights)} />
                                    <button aria-label="Close" onClick={() =>{
                                            setRender(false)
                                            if(props.onclose !== undefined){
                                                props.onclose()
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
            )}
        </React.Fragment>
    )
}
export default WindowsDiv;