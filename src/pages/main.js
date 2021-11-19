import React, {useEffect} from 'react'
import MediaButton from '../components/MediaButton';
import WindowsDiv from '../components/WindowsDiv';

import './styles/Main.css'

import me from "../icons/me.png"
import vk_logo from '../icons/vk.svg'
import inst_logo from '../icons/insta.png'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

            model.scale.set(7,7,7)
            model.position.set(0,-20,0)

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
        <div className="container">
            <WindowsDiv title="About wildrun0" className="info-container" drag={true}>  
                <div className="about-grid">
                    <img src={me} alt="I am"></img>
                    <div className='about-main'>
                        <blockquote>
                            <h4>Alexander "wildrun0" Postnikov</h4>
                            <p> This page exist just for fun and some tech things.</p>
                            <p> About myself: I'm 19yo, from Russia. Currently study for <b>computer networks</b> specialty.</p>
                            <p> I like to programm but not this much. Just some react apps and python stuff.</p>
                            <p> My Github Profile you can check <a href="https://github.com/wildrun0">here</a></p>
                        </blockquote>
                    </div>
                </div>
                <div className="buttons-group">
                    <p className="status-bar-field">
                        <MediaButton href="https://vk.com/wildrun0" SOCIAL_LOGO_NAME={vk_logo} text="VK"></MediaButton>
                    </p>
                    <p className="status-bar-field">
                        <MediaButton href="https://instagram.com/wildrun0" SOCIAL_LOGO_NAME={inst_logo} text="INSTAGRAM"></MediaButton>
                    </p>
                </div>
            </WindowsDiv>
            <WindowsDiv title="3D MODEL" className="model-container" drag={true}>
                <canvas id="bg" />
            </WindowsDiv>
        </div>
    )
}
export default Main