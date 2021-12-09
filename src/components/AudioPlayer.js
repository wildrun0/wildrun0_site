import React, {useEffect, useState} from 'react';
import { openDB } from 'idb'
import WindowsDiv from './WindowsDiv';
import './styles/AudioPlayer.css';

import yandhiCover from '../icons/programms_stuff/yandhi.mp4';

const api_addr = process.env.REACT_APP_API_ADDRESS;

let db_init = false;
const dbName = 'songsDb'
const storeName = 'songs'
const version = 1 //versions start at 1
async function init_db(){
    await openDB(dbName, version,{
        upgrade(db, oldVersion, newVersion, transaction) {
            db.createObjectStore(storeName)
        }
    })
}
async function cache_song(songName, params){
    const db = await openDB(dbName)

    const tx = db.transaction(storeName, 'readwrite')
    const store = await tx.objectStore(storeName)
  
    await store.put(params, songName)
    await tx.done
}
async function get_cached_song(key){
    const db = await openDB(dbName)
    const item = await db.transaction(storeName).objectStore(storeName).get(key)
    return item
}
const AudioPlayer = props => {
    if (!db_init){
        init_db()
        db_init = true;
        console.log("DB initialized")
    }
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const cover = document.getElementsByClassName("musicPlayer_coverTag")[0];
    const title = document.getElementsByClassName("musicPlayer_trackName")[0];
    const bitrate = document.getElementsByClassName("musicPlayer_bitrate")[0];
    const duration = document.getElementsByClassName("musicPlayer_duration")[0];
    const track = document.getElementsByClassName("musicTrack")[0];
    let audio = document.getElementsByClassName("musicPlayer_audio")[0];
    useEffect(() =>{
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

    function reset_animation(){
        let el = document.getElementsByClassName("musicPlayer_trackName")[0];
        el.style.animation = 'none';
        window.requestAnimationFrame(function(){
            el.style.animation = 'slide-left 20s linear infinite';
        });
    }
    let selectedSongs = [];
    let chaningCurrentTime = false;
    let after_pause = false;
    let song_playing = false;
    let audio_val = localStorage.getItem("audio_val") || 0.25;
    
    let audioSrc;
    let prev_song;
    let countDown;
    
    function onTrackMovement(e){
        chaningCurrentTime = true;
        audio.currentTime = e.target.value;
        chaningCurrentTime = false;
    }

    function count_time(song_duration){
        let current_time;
        let currentTime_humanized;
        let totalTime_humanized;
        countDown = setInterval(function(){
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

    async function setAudio(url, song_hash){
        let headers;
        let kbit;
        let audioBlob;
        let response_blob;
        let songType;

        if (await get_cached_song(song_hash)){
            let storedSong = await get_cached_song(song_hash)
            kbit = storedSong[0];
            songType = storedSong[1]
            audioBlob = URL.createObjectURL(storedSong[2]);
            console.log("stored from cache")

        } else{
            await fetch(url).then(resp =>{
                headers = Object.fromEntries(resp.headers.entries())
                songType = headers['content-type']
                kbit = headers['content-length']/128;
                response_blob = resp.blob()
            })
            await response_blob.then(blob =>{
                let blobURL = URL.createObjectURL(blob)
                audioBlob = blobURL
                cache_song(song_hash, [kbit, songType, blob])
                console.log("song not stored, saving now...")
            })
        }
        if(!audio.canPlayType(songType)){
            return false;
        }
        audio.src = audioBlob;
        audio.type = songType;
        audio.volume = audio_val;
        audio.preload = "auto";

        audio.play();
        track.disabled = false;
        track.addEventListener("mousedown", (e) =>{
            chaningCurrentTime = true;
        })
        track.addEventListener('change', onTrackMovement, true)

        audio.onloadedmetadata = function(){
            let song_duration = audio.duration;
            let song_bitrate = Math.ceil(Math.round(kbit/song_duration)/16)*16;
            bitrate.innerHTML = song_bitrate+" kbps";
            track.max = song_duration;
            clearInterval(countDown)
            count_time(song_duration)
            cover.play();
        }
        function handleAudioEnd(e){
            audio.currentTime = 0;
            cover.pause();
            cover.currentTime = 0;
            title.innerHTML = ""
            bitrate.innerHTML = "";
            clearInterval(countDown);
            duration.innerHTML = "";
            track.disabled = true;
            track.value = track.max = 0;
            song_playing = false;
            prev_song = null;
        }
        audio.removeEventListener("ended", handleAudioEnd)
        audio.addEventListener("ended", handleAudioEnd)
    }

    async function play_music(song, song_hash){
        if (!after_pause){
            cover.pause();
            cover.currentTime = 0;
            reset_animation();
        } else{
            title.style.animationPlayState = "running";
            after_pause = false;
            audio.play();
            cover.play();
        }
        song_playing = true;
        if (prev_song !== song){
            try{
                audio.pause();
            } catch {}
            await setAudio(audioSrc, song_hash)
        }
        prev_song = song;
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

    function setSong(name, song_hash){
        if (!song_playing && selectedSongs.length > 0){
            let song_hash = name.getAttribute("data-key")
            audioSrc = name.getAttribute("link");
            title.innerHTML = name.textContent;
            play_music(name, song_hash)
        }
    }

    function songClicked(e){
        let song = e.target;
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
        let songsList_div = document.getElementsByClassName("musicPlayer_songsList")[0]
        songsList_div.innerHTML = "<p class = 'unableFetch'>UNABLE TO FETCH SONGS</p>";
        songsList_div.style.display = "flex"
    }
    return(
        <WindowsDiv title={props.name} className="musicPlayer_window" enableControls={true} onclose={() => closeHandle(props)} saveCoords={true}>
            <div className = "musicPlayer_grid">
                <audio className = "musicPlayer_audio" />
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
                                let hash = song[1]
                                let song_name = song[0]
                                return(
                                    <p data-key={hash} key={hash} link={api_addr+"/files/music/"+song_name}> {song_name} </p>
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
                            <input id="range23" type="range" min="1" max="100" defaultValue = {localStorage.getItem("audio_val")*100 || 25} onChange={changeVolume} />
                            <label htmlFor="range24">High</label>
                        </div>
                    </div>
                </div>
            </div>
        </WindowsDiv>
    )
}

export default AudioPlayer;