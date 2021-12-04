import React, { useEffect } from 'react';
import WindowsDiv from './WindowsDiv';

import './styles/AudioPlayer.css';

import yandhiCover from '../icons/programms_stuff/yandhi.mp4'
const AudioPlayer = props => {
    useEffect(() => {
        const trackName = document.getElementsByClassName("musicPlayer_trackName")[0];
    }, [])
    function changeVolume(e){
        var val = e.target.value
        console.log(val)
        // e.target.value = val
    }
    return(
        <WindowsDiv title={props.name} className="musicPlayer_window" enableControls={true}>
            <div className = "musicPlayer_grid">
                <div className="musicPlayer_cover">
                    <video loop muted playsInline>
                        <source src={yandhiCover} type="video/mp4" />
                    </video>
                </div>
                <div className = "musicPlayer_player">
                    <p className = "musicPlayer_currentlyPlaying"> Currently playing </p>
                    <div className = "musicPlayer_trackName"> <p>Kanye West - YANDHI (2018 unreleased).flac</p> </div>
                    <div className = "musicPlayer_volume">
                        <div className="field-row">
                            <label for="range22">Volume:</label>
                            <label for="range23">Low</label>
                            <input id="range23" type="range" min="1" max="100" defaultValue = "25" onChange={changeVolume} />
                            <label for="range24">High</label>
                        </div>
                    </div>
            </div>
            </div>
        </WindowsDiv>
    )
}

export default AudioPlayer