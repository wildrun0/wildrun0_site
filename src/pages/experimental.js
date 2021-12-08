import React, {useReducer} from 'react';
import WindowsDiv from '../components/WindowsDiv';
import WindowsIcon from '../components/WindowsIcon';
import AudioPlayer from '../components/AudioPlayer';

import './styles/Experimental.css'
import MusicIcon from '../icons/cdPlayer.png'
import errorPng from '../icons/error.png'

var programms_started = {}
var programms_started_names = []
const Experimental = () => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    // тута выбираем и отправляем в массив нужную "программу"
    function handle_error_closing(e){
        e.style.visibility = "hidden";
    }
    function handleClose(id, name){
        delete programms_started[id]
        programms_started_names = programms_started_names.filter(e => e !== name)
    }
    function handle(_, name){
        const errordiv = document.getElementsByClassName("error")[0]
        let programm_content;
        let uniq_id = Date.now() / 1000 | 0 + Math.random();
        if (name === "Music Player"){
            programm_content = (
                <AudioPlayer key = {uniq_id} id={uniq_id} name="Music Player" onclose={(id) => handleClose(id, name)}/>
            )
        }
        if(programm_content !== undefined){
            if (!programms_started_names.includes(name)){
                programms_started[uniq_id] = programm_content;
                programms_started_names.push(name)
                forceUpdate();
            } else{
                errordiv.style.visibility = "unset"
            }
        }
    }
    let containerId = Date.now() / 1000 | 0 + Math.random()
    return(
        <div className = "exp_container" key = {containerId}>
            <WindowsDiv title="MAIN MENU" className='exp_menu' drag={false}>
                <div>
                    <p className="exp_title"> Welcome to the Experimental</p>
                    <div className="exp_icons_grid">
                        <WindowsIcon icon={MusicIcon} name="Music Player" onclick={handle} />
                    </div>
                </div>
            </WindowsDiv>
            <WindowsDiv title="PROGRAMM SYSTEM ERROR" className="error" drag={true} enableControls={true} handleClose={handle_error_closing}>
                <div className="loading-error-body">
                    <img src={errorPng} alt="Error"></img>
                    <p>Error happend: programm already started</p>
                </div>
            </WindowsDiv>
            {   // отрисовываем запущенные "программы"
                Object.keys(programms_started).map(function(key, index) {
                    return React.cloneElement(programms_started[key])
                })
            }
        </div>
    )
}
export default Experimental