import React, {useReducer} from 'react';
import WindowsDiv from '../components/WindowsDiv';
import WindowsIcon from '../components/WindowsIcon';
import AudioPlayer from '../components/AudioPlayer';

import './styles/Experimental.css'
import MusicIcon from '../icons/cdPlayer.png'

var programms_started = []

const Experimental = () => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    // тута выбираем и отправляем в массив нужную "программу"
    function handle(_, name){
        var programm_content;
        if (name === "Music Player"){
            programm_content = (
                <AudioPlayer name="Music Player" playersList={programms_started}/>
            )
        }
        if(programm_content !== undefined){
            programms_started.push(programm_content)
        }
        forceUpdate();
    }
    return(
        <div className = "exp_container">
            <WindowsDiv title="MAIN MENU" className='exp_menu' drag={false}>
                <div>
                    <p className="exp_title"> Welcome to the Experimental</p>
                    <div className="exp_icons_grid">
                        <WindowsIcon icon={MusicIcon} name="Music Player" onclick={handle} />
                    </div>
                </div>
            </WindowsDiv>
            {   // отрисовываем запущенные "программы"
                programms_started.map((Component) => (
                    React.cloneElement(Component)
                    )
                )
            }
        </div>
    )
}
export default Experimental