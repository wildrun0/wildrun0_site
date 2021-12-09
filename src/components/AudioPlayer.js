import React, {useEffect, useState} from 'react';
import { openDB, deleteDB } from 'idb'
import WindowsDiv from './WindowsDiv';
import './styles/AudioPlayer.css';

import yandhiCover from '../icons/programms_stuff/yandhi.mp4';

const api_addr = process.env.REACT_APP_API_ADDRESS;

let db_init = false;
let update_required = false;
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
async function delete_db(name){
    await deleteDB(name)
}

// конвертируем шаги в гиги
document.addEventListener("touchstart", e =>{
    e.target.dispatchEvent(new MouseEvent("mousedown"))
})

const AudioPlayer = props => {
    if (update_required){
        delete_db(dbName)
        update_required = false;
    }
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
    const audio = document.getElementsByClassName("musicPlayer_audio")[0];
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

    async function setAudio(url, song_hash, song_element){
        let headers;
        let kbit;
        let audioBlob;
        let response_blob;
        let songType;
        let song_duration;
        let song_bitrate;

        let cached_song = await get_cached_song(song_hash);
        let toCache = [];
        if (cached_song){
            song_duration = cached_song[0];
            song_bitrate = cached_song[1];
            songType = cached_song[2]['type']

            audioBlob = URL.createObjectURL(cached_song[2]);

            console.log("recovered from cache")
        } else{
            await fetch(url).then(resp =>{
                headers = Object.fromEntries(resp.headers.entries())
                kbit = headers['content-length']/128;
                response_blob = resp.blob();
            })
            await response_blob.then(blob =>{
                let blobURL = URL.createObjectURL(blob);
                songType = blob['type'];
                audioBlob = blobURL;
                toCache.push(blob)
            })
            console.log("song not stored, saving now...");
        }
        if(audio.canPlayType(songType) === ""){
            console.warn("UNSUPPORTABLE TYPE: "+songType)
            return false;
        }
        audio.src = audioBlob;
        audio.volume = audio_val;
        audio.preload = "auto";
        audio.play();

        function handleTrackMovement(){
            chaningCurrentTime = true
        }
        
        track.disabled = false;
        track.addEventListener("mousedown", handleTrackMovement);
        track.addEventListener('change', onTrackMovement, true)
        
        audio.onloadedmetadata = () => {
            if (!cached_song){
                song_duration = audio.duration;
                song_bitrate = Math.ceil(Math.round(kbit/song_duration)/16)*16;

                toCache.splice(0,0, song_duration);
                toCache.splice(1,0, song_bitrate)
                cache_song(song_hash, toCache)
            }

            clearInterval(countDown)
            count_time(song_duration)

            bitrate.innerHTML = song_bitrate+" kbps";
            track.max = song_duration;
        }
        cover.play();

        audio.onended = () => {
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

            let next_song = song_element.nextSibling

            if (next_song !== null){
                if (selectedSongs.length > 0){
                    selectedSongs[0].className = "";
                }
                next_song.className = "clicked"

                selectedSongs.pop()
                selectedSongs.push(next_song)

                setSong(next_song, next_song.getAttribute("data-key"))
            }
        }
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
            await setAudio(audioSrc, song_hash, song)
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

    function setSong(name){
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