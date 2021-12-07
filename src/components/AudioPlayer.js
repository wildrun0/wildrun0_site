import React, {useEffect, useState} from 'react';
import WindowsDiv from './WindowsDiv';
import './styles/AudioPlayer.css';

import yandhiCover from '../icons/programms_stuff/yandhi.mp4';

// не забудь поменять айпи здесь и в fileserver.py
const api_addr = process.env.REACT_APP_API_ADDRESS;

const AudioPlayer = props => {
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const cover = document.getElementsByClassName("musicPlayer_coverTag")[0];
    const title = document.getElementsByClassName("musicPlayer_trackName")[0];
    const bitrate = document.getElementsByClassName("musicPlayer_bitrate")[0];
    const duration = document.getElementsByClassName("musicPlayer_duration")[0];
    const track = document.getElementsByClassName("musicTrack")[0];
    useEffect(() => {
        fetch(`${api_addr}/files/music`)
        .then(res => res.json())
        .then(
          (result) => {
            setItems(result);
          },
          (error) => {
            setError(error);
          }
        )
    }, [])

    function reset_animation() {
        var el = document.getElementsByClassName("musicPlayer_trackName")[0];
        el.style.animation = 'none';
        el.getClientRects(); //forces layout / reflow (хуй знает как перевести)
        el.style.animation = null; 
    }

    var selectedSongs = [];
    var chaningCurrentTime = false;
    var after_pause = false;
    var song_playing = false;
    var audio_val = localStorage.getItem("audio_val");
    
    var audioSrc;
    var audio;
    var prev_song;
    var countDown;

    function onTrackMovement(e){
        chaningCurrentTime = true;
        audio.currentTime = e.target.value;
        chaningCurrentTime = false;
    }

    function count_time(song_duration){
        var current_time;
        var currentTime_humanized;
        var totalTime_humanized;
        countDown = setInterval(function() {
            if (song_playing){
                current_time = audio.currentTime
                currentTime_humanized = new Date(current_time * 1000).toISOString().substr(14, 5);
                totalTime_humanized = new Date(song_duration * 1000).toISOString().substr(14, 5);
                duration.innerHTML = currentTime_humanized + " / " + totalTime_humanized;
                if (!chaningCurrentTime){
                    track.value = current_time;
                }
            }
        }, 500);
    }

    async function setAudio(url){
        var audio_size;
        var kbit;
        await fetch(url).then( resp =>{
            resp.headers.forEach((value, key) => {
                if (key === "content-length"){
                    audio_size = value;
                }
            })
            kbit = audio_size/128;
        })
        audio = new Audio(url);
        audio.volume = audio_val;
        audio.preload = "auto";
        audio.onloadedmetadata = function(){
            var song_duration = audio.duration;
            var song_bitrate = Math.ceil(Math.round(kbit/song_duration)/16)*16;
            bitrate.innerHTML = song_bitrate+" kbps";
            track.max = song_duration;
            clearInterval(countDown)
            count_time(song_duration)
        }
        audio.addEventListener("ended", function(){
            audio.currentTime = 0;
            cover.pause();
            cover.currentTime = 0;
            title.innerHTML = ""
            bitrate.innerHTML = "";
            clearInterval(countDown);
            duration.innerHTML = "";
            track.disabled = true;
            track.value = track.max = 0;
       });
    }

    async function play_music(song){
        if (!after_pause){
            cover.pause();
            cover.currentTime = 0;
            reset_animation();
        } else{
            title.style.animationPlayState = "running";
            after_pause = false;
        }
        cover.play();
        song_playing = true;
        if (prev_song !== song){
            try{
                audio.pause();
            } catch {}
            await setAudio(audioSrc)
        }
        try{
            audio.play();
        } catch (err){
            console.log(err)
        }
        track.disabled = false;
        prev_song = song;
        track.addEventListener("mousedown", (e) =>{
            chaningCurrentTime = true;
        })
        track.addEventListener('change', onTrackMovement, true)

    }

    function pauseSong(){
        if (song_playing){
            cover.pause();
            title.style.animationPlayState = "paused";
            title.innerHTML = "PAUSED: " + title.innerHTML;
            audio.pause();
            song_playing = false;
            after_pause = true;
        }
    }

    function setSong(name){
        if (!song_playing && selectedSongs.length > 0){
            audioSrc = name.getAttribute("link");
            title.innerHTML = name.textContent;
            play_music(name)
        }
    }

    function songClicked(e){
        var song = e.target;
        if (song.tagName !== "DIV"){
            if (song === selectedSongs[0]){
                audioSrc = song.getAttribute("link");
                if (!song_playing){
                    setSong(song);
                }
            } else{
                song_playing = false;
                if (selectedSongs.length > 0){
                    selectedSongs[0].className = "";
                }
                song.className = "clicked"
                selectedSongs.pop()
                selectedSongs.push(song)
            }
        }
    }

    function changeVolume(e){
        audio_val = (e.target.value*0.01);
        audio_val = audio_val <= 0.05 ? audio_val - 0.01: audio_val; // делаем значения от 0.00 до 1.00
        localStorage.setItem("audio_val", audio_val)
        try{
            audio.volume = audio_val;
        } catch {}
    }

    function closeHandle(props){
        props.onclose(props.id)
        try{
            audio.pause();
            audio.currentTime = 0;
        } catch {}
    }

    if (error){
        try{
            document.getElementsByClassName("musicPlayer_songsList")[0].innerHTML = "UNABLE TO FETCH SONGS"
        } catch {}
    }
    return(
        <WindowsDiv title={props.name} className="musicPlayer_window" enableControls={true} onclose={() => closeHandle(props)} saveCoords={true}>
            <div className = "musicPlayer_grid">
                <div className="musicPlayer_cover">
                    <video preload="auto" loop muted playsInline className="musicPlayer_coverTag">
                        <source src={yandhiCover + "#t=0.1"} type="video/mp4" />
                    </video>
                </div>
                <div className = "musicPlayer_player">
                    <p className = "musicPlayer_currentlyPlaying"> Currently playing </p>
                    <div className = "musicPlayer_trackNameDiv"> <p className = "musicPlayer_trackName"></p> </div>
                    <div className = "musicPlayer_songsList" onClick={songClicked}>
                        {
                            items.map((song) =>{
                                return(
                                    <p key={song.hashCode()}link={api_addr+"/files/music/"+song}> {song} </p>
                                )
                            })
                        }
                    </div>
                    <div className = "musicPlayer_musicTrack">
                        <div className="field-row">
                            <input id="range25" className="has-box-indicator musicTrack" type="range" defaultValue = "0" disabled/>
                        </div>
                    </div>
                    <div className="musicPlayer_controls">
                        <button className="musicPlayer_playBtn" onClick={() => setSong(selectedSongs[0])}><div className = "play" /></button>
                        <button className="musicPlayer_pauseBtn" onClick={pauseSong}><div className = "pause" /></button>
                        <button className="musicPlayer_bitrate" disabled></button>
                        <blockquote className="musicPlayer_duration"></blockquote>
                    </div>
                    <div className = "musicPlayer_volume">
                        <div className="field-row">
                            <label htmlFor="range22">Volume:</label>
                            <label htmlFor="range23">Low</label>
                            <input id="range23" type="range" min="1" max="100" defaultValue = {localStorage.getItem("audio_val")*100} onChange={changeVolume} />
                            <label htmlFor="range24">High</label>
                        </div>
                    </div>
                </div>
            </div>
        </WindowsDiv>
    )
}

export default AudioPlayer