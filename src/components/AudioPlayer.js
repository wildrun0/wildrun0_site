import React, {useEffect, useState} from 'react';
import { openDB, deleteDB } from 'idb'
import WindowsDiv from './WindowsDiv';
import './styles/AudioPlayer.css';
import WindowsError from './WindowsError';
import noSongPng from "../icons/programms_stuff/nosong.png"

const api_addr = process.env.REACT_APP_API_ADDRESS;

let db_init = false;
let update_required = false;
const dbName = 'songsDb';
const storeName = 'songs';
const version = 1;
async function init_db(){
    await openDB(dbName, version,{
        upgrade(db, oldVersion, newVersion, transaction) {
            db.createObjectStore(storeName);
        }
    })
}
async function cache_song(songName, params){
    const db = await openDB(dbName);

    const tx = db.transaction(storeName, 'readwrite');
    const store = await tx.objectStore(storeName);
  
    await store.put(params, songName);
    await tx.done;
}
async function get_cached_song(key){
    const db = await openDB(dbName);
    const item = await db.transaction(storeName).objectStore(storeName).get(key);
    return item;
}
async function delete_db(name){
    await deleteDB(name);
}

let cover;
let title;
let bitrate;
let duration;
let track;
let audio;
function reset_animation(){
    let el = document.getElementsByClassName("musicPlayer_trackName")[0];
    el.style.animation = 'none';
    let animation;
    let parentClasses = document.getElementsByClassName("musicPlayer_window")[0].classList;
    if (parentClasses.contains("maximized")){
        animation = 'slide-left-maximized 20s linear infinite';
    } else{
        animation = 'slide-left 20s linear infinite';
    }
    window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||             
                               window.msRequestAnimationFrame;
    window.requestAnimationFrame(function(){
        el.style.animation = animation;
        console.log('here')
        console.log(el)
    });
}
let selectedSongs = [];
let chaningCurrentTime = false;
let after_pause = false;
let song_playing = false;
let audio_val = localStorage.getItem("audio_val") || 0.25;

let audioSrc;
let audioCover;
let audioCoverFormat;
let prev_song;
let countDown;

function onTrackMovement(e){
    audio.currentTime = e.target.value;
    chaningCurrentTime = false;
}
function setTrack(current_time, currentTime_humanized, totalTime_humanized, song_duration){
    if (song_playing){
        current_time = audio.currentTime
        currentTime_humanized = new Date(current_time * 1000).toISOString().substr(14, 5);
        totalTime_humanized = new Date(song_duration * 1000).toISOString().substr(14, 5);
        duration.innerHTML = currentTime_humanized + " / " + totalTime_humanized;
        if (!chaningCurrentTime){
            track.value = current_time;
        }
    }
}
function count_time(song_duration){
    let current_time;
    let currentTime_humanized;
    let totalTime_humanized;
    countDown = setInterval(setTrack, 500, current_time, currentTime_humanized, totalTime_humanized, song_duration);
}

function handleTrackMovement(){
    chaningCurrentTime = true
}
function get_url_extension( url ) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
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
    let lost_connection;
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
        }).then(
            (result) => {
                console.log(result)
                lost_connection = false;
            },
            (error) => {
                lost_connection = true;
            }
          )
        if (lost_connection){
            return;
        }
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
        return;
    }

    audio.src = audioBlob;
    audio.volume = audio_val;
    audio.preload = "auto";
    audio.play();
    
    track.disabled = false;

    async function load_metadata(){
        if (!cached_song){
            console.log("caching", url)
            song_duration = audio.duration;
            song_bitrate = Math.ceil(Math.round(kbit/song_duration)/16)*16;

            toCache.splice(0,0, song_duration);
            toCache.splice(1,0, song_bitrate);
            await cache_song(song_hash, toCache);
            cached_song = true;
            audio.removeEventListener("loadedmetadata", load_metadata);
        }
        clearInterval(countDown)
        count_time(song_duration)

        bitrate.innerHTML = song_bitrate+" kbps";
        track.max = song_duration;
    }
    audio.addEventListener("loadedmetadata", load_metadata);

    let audioCoverExt = get_url_extension(audioCover)
    if ((audioCoverExt == "jpg") || (audioCoverExt == "png") || (audioCoverExt == "gif")){
        cover.src = '';
        cover.poster = audioCover; // ???? ????????????, ???????? ?????????????? - ???? ??????????
        audioCoverFormat = 'picture'
    } else{
        cover.src = audioCover;
        cover.play();
        audioCoverFormat = "video"
    }

    audio.onended = () => {
        audio.currentTime = 0;
        if (audioCoverFormat == "video"){
            cover.pause();
        }
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
        if (audioCoverFormat == "video"){
            cover.pause();
        }
        cover.currentTime = 0;
        reset_animation();
    } else{
        title.style.animationPlayState = "running";
        after_pause = false;
        audio.play();
        if (audioCoverFormat == "video"){
            cover.play();
        }
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
        if (audioCoverFormat == "video"){
            cover.pause();
        }
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
        audioCover = name.getAttribute("cover");
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
    audio_val = audio_val <= 0.05 ? audio_val - 0.01: audio_val; // ???????????? ???????????????? ???? 0.00 ???? 1.00
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
function touchToMouse(e){
    e.target.dispatchEvent(new MouseEvent("mousedown"))
}
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
    const [isRender, setRender] = useState(true)
    const [items, setItems] = useState([]);

    
    // ???????????????????????? ???????? ?? ????????
    
    useEffect(() =>{
        cover = document.getElementsByClassName("musicPlayer_coverTag")[0];
        title = document.getElementsByClassName("musicPlayer_trackName")[0];
        bitrate = document.getElementsByClassName("musicPlayer_bitrate")[0];
        duration = document.getElementsByClassName("musicPlayer_duration")[0];
        track = document.getElementsByClassName("musicTrack")[0];
        audio = document.getElementsByClassName("musicPlayer_audio")[0];
        
        track.addEventListener("mousedown", handleTrackMovement);
        track.addEventListener('change', onTrackMovement);
        document.addEventListener("touchstart", touchToMouse)
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
        return () =>{
            // ???? ???????????? ?????????????? ??????????????
            clearInterval(countDown);
            track.removeEventListener("mousedown", handleTrackMovement);
            track.removeEventListener('change', onTrackMovement);
            document.removeEventListener("touchstart", touchToMouse);
        }
    }, [])
    function closeComponent(){
        setError(false);
        closeHandle(props);
        setRender(false);
    }
    function handleResize(){
        reset_animation();
    }
    return(
        <React.Fragment>
            {error && (
                <WindowsError title="MUSIC PLAYER ERROR" enableControls={true} drag={true} onclose={closeComponent}>
                    <p> ERROR: {error.message} </p>
                </WindowsError>
            )}
            {isRender && (
                <WindowsDiv title={props.name} className="musicPlayer_window" enableControls={true} drag={true} onclose={closeComponent} onResize={handleResize}>
                    <div className = "musicPlayer_grid">
                        <audio className = "musicPlayer_audio" />
                        <video poster={noSongPng} preload="auto" loop muted playsInline className="musicPlayer_coverTag">
                            <source type="video/mp4"/>
                        </video>
                        <div className = "musicPlayer_player">
                            <p className = "musicPlayer_currentlyPlaying"> Currently playing </p>
                            <div className = "musicPlayer_trackNameDiv"> <p className = "musicPlayer_trackName"></p> </div>
                            <div className = "musicPlayer_songsList" onClick={songClicked}>
                                {
                                    items.map((song) =>{
                                        let song_path = api_addr+"/files/music/"+song[0];
                                        let hash = song[1];
                                        let song_name = song[0].split("/")[1];
                                        let cover = api_addr+"/files/music/"+song[2];
                                        return(
                                            <p cover={cover} data-key={hash} key={hash} link={song_path}> {song_name} </p>
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
                                <blockquote>
                                    <p className="musicPlayer_duration" ></p>
                                </blockquote>
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
            )}
        </React.Fragment>
    )
}

export default AudioPlayer;