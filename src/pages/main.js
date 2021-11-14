import React from 'react'
import Draggable from 'react-draggable';
import MediaBtn from '../components/media_btn';

import '../components/styles/main.css'
import me from "../icons/me.png"
import vk_logo from '../icons/vk.svg'
import inst_logo from '../icons/insta.png'

const Main = () => {
    return(
        <Draggable bounds={{top: 0, left: -400, right: 400, bottom: 200}} handle="strong">
            <div className="main-containter">
                <div class="window" >
                    <strong className="cursor">
                        <div class="title-bar">
                            <div class="title-bar-text">About wildrun0</div>
                        </div>
                    </strong>
                    <div class="window-body">
                        <div className="about-grid">
                            <img src={me}></img>
                            <div className='about-main'>
                                <blockquote>
                                    very good man i really appreciate him id like to fuck him
                                </blockquote>
                            </div>
                        </div>
                    </div>
                    <div class="status-bar">
                        <p class="status-bar-field">
                            <MediaBtn href="https://vk.com/wildrun0" SOCIAL_LOGO_NAME={vk_logo} text="VK"></MediaBtn>
                        </p>
                        <p class="status-bar-field">
                            <MediaBtn href="https://instagram.com/wildrun0" SOCIAL_LOGO_NAME={inst_logo} text="INSTAGRAM"></MediaBtn>
                        </p>
                    </div>
                </div>
            </div>
        </Draggable>
    )
}
export default Main