import React, {useEffect} from 'react'
import Draggable from 'react-draggable';
import MediaButton from '../components/MediaButton';

import '../components/styles/main.css'
import me from "../icons/me.png"
import vk_logo from '../icons/vk.svg'
import inst_logo from '../icons/insta.png'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import WindowsDiv from '../components/WindowsDiv';

const Main = () => {
    useEffect(() => {
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(90, 500 / 500, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector("#bg")
        })
        const loader = new GLTFLoader();
        const controls = new OrbitControls(camera, renderer.domElement)
        
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(350, 350)
        camera.position.setZ(30)

        const pointLight = new THREE.PointLight(0xfffffff)
        pointLight.position.set(5,-10, 5)

        const directionalLight = new THREE.DirectionalLight(0xfffffff, 3)
        directionalLight.position.set(0,-50,0)

        const ambientLight = new THREE.AmbientLight(0xfffffff)
        scene.add(pointLight, directionalLight, ambientLight)

        const skyTexture = new THREE.TextureLoader().load('sky.jpeg')
        scene.background = skyTexture

        let model = new THREE.Object3D()
        loader.load('ebasos/scene.gltf', function (gltf) {
            const alex = gltf.scene.children[0]
            model = alex

            alex.scale.set(7,7,7)
            alex.position.set(0,-20,0)

            scene.add(gltf.scene);
            renderer.render(scene, camera);
        }, undefined, function (error) {
            console.error(error);
        });

        const animate = () => {
            requestAnimationFrame(animate)
            model.rotation.z += 0.004
            controls.update()
            renderer.render(scene, camera)
        }
        animate()
    });
    return(
        <React.Fragment>
            <div className="container">
                <Draggable bounds="html" handle=".title-bar" >
                    <div className="info-container">
                        <div className="window" >
                            <div className="title-bar">
                                <div className="title-bar-text">About wildrun0</div>
                                <div className="title-bar-controls">
                                    <button aria-label="Minimize"></button>
                                    <button aria-label="Maximize"></button>
                                    <button aria-label="Close"></button>
                                </div>
                            </div>
                            <div className="window-body">
                                <div className="about-grid">
                                    <img src={me} alt="I am"></img>
                                    <div className='about-main'>
                                        <blockquote>
                                            very good man i really appreciate him id like to fuck him
                                        </blockquote>
                                    </div>
                                </div>
                            </div>
                            <div className="status-bar">
                                <p className="status-bar-field">
                                    <MediaButton href="https://vk.com/wildrun0" SOCIAL_LOGO_NAME={vk_logo} text="VK"></MediaButton>
                                </p>
                                <p className="status-bar-field">
                                    <MediaButton href="https://instagram.com/wildrun0" SOCIAL_LOGO_NAME={inst_logo} text="INSTAGRAM"></MediaButton>
                                </p>
                            </div>
                        </div>
                    </div>
                </Draggable>
                <WindowsDiv title="3D MODEL" className="model-container" drag={true}>
                    <canvas id="bg"></canvas>
                </WindowsDiv>
            </div>
        </React.Fragment>
    )
}
export default Main