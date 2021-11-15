import React, {useEffect} from 'react'
import Draggable from 'react-draggable';
import MediaButton from '../components/MediaButton';

import '../components/styles/main.css'
import me from "../icons/me.png"
import vk_logo from '../icons/vk.svg'
import inst_logo from '../icons/insta.png'

const Main = () => {
    return(
        <Draggable bounds="html" handle="strong" defaultPosition={{x: document.documentElement.offsetWidth/2-325, y: 0}}>
            <div className="main-containter">
                <div class="window" >
                    <strong className="cursor">
                        <div class="title-bar">
                            <div class="title-bar-text">About wildrun0</div>
                            <div class="title-bar-controls">
                                <button aria-label="Minimize"></button>
                                <button aria-label="Maximize"></button>
                                <button aria-label="Close"></button>
                            </div>
                        </div>
                    </strong>
                    <div class="window-body">
                        <div className="about-grid">
                            <img src={me} alt="I am"></img>
                            <div className='about-main'>
                                <blockquote>
                                    very good man i really appreciate him id like to fuck him
                                </blockquote>
                            </div>
                        </div>
                    </div>
                    <div class="status-bar">
                        <p class="status-bar-field">
                            <MediaButton href="https://vk.com/wildrun0" SOCIAL_LOGO_NAME={vk_logo} text="VK"></MediaButton>
                        </p>
                        <p class="status-bar-field">
                            <MediaButton href="https://instagram.com/wildrun0" SOCIAL_LOGO_NAME={inst_logo} text="INSTAGRAM"></MediaButton>
                        </p>
                    </div>
                </div>
            </div>
        </Draggable>
    )
}
export default Main