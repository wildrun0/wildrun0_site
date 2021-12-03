import React, {useReducer} from 'react'
import { Link } from "react-router-dom";
import WindowsDiv from '../components/WindowsDiv';
import WindowsIcon from '../components/WindowsIcon';

import './styles/Experimental.css'
import MusicIcon from '../icons/cdPlayer.png'
var programms_started = []
const Experimental = () => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    function handle(event, name){
        programms_started.push(
            <WindowsDiv title = {name}>
                <p>hi</p>
            </WindowsDiv>
        )
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
            {
                programms_started.map((Component) => (
                    React.cloneElement(Component)
                    )
                )
            }
        </div>
    )
}
export default Experimental