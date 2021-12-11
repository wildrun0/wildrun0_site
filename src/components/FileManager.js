import React, {useReducer} from 'react'
import WindowsDiv from '../components/WindowsDiv';

import './styles/FileManager.css'

import directoryPng from '../icons/directory.png'
import directoryBackPng from "../icons/directoryBack.png"
import pathIcon from "../icons/pathIcon.png"

import txtFilePng from "../icons/txtFile.png"
import zipFilePng from "../icons/zipFile.png"
import defaultFilePng from "../icons/defaultFile.png"
import musicFilePng from '../icons/musicFile.png'
import videoFilePng from "../icons/videoFile.png"

const filesIcons = {
    'unknown': defaultFilePng,
    'txt': txtFilePng,
    //несколько ключей к одному значению
    ...Object.fromEntries(
        ['7z','zip', 'rar'].map(key => [key, zipFilePng])
    ),
    ...Object.fromEntries(
        ['mp3','wav', 'ogg', 'flac', 'm4a'].map(key => [key, musicFilePng])
    ),
    ...Object.fromEntries(
        ['mp4','mkv', 'avi'].map(key => [key, videoFilePng])
    )
}

// Чтобы создать уникальные key для каждого <li> элемента
// Ниже отключаем чтобы реакт не ругался на изменение String элемента
// eslint-disable-next-line
String.prototype.hashCode = function() {
    let hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var current_path;
var api_addr;
var has_loaded = false
const FileManager = props => {
    if (!has_loaded){
        current_path = props.startPath;
        api_addr = props.download_link;
        has_loaded = true;
    }
    const defaultPath = props.startPath;
    const items = props.files;
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    function update(e, path){
        e.preventDefault(); // двойной клик заебал
        if (path !== undefined){
            current_path = path
            let path_el = document.getElementsByClassName("pathText")[0]
            //работает только так
            setTimeout(function(){
                path_el.scrollLeft = 1500;    
            },1);
        } else{
            if (current_path !== defaultPath){
                let current_path_arrayed = current_path.split('/')
                current_path_arrayed.pop()
                current_path = current_path_arrayed.join("/")
            }
        }
        forceUpdate(); // обновляем чтобы отрендерить папку
    }
    function setFileIcon(fileName){
        let re = /(?:\.([^.]+))?$/;
        let fileExt = re.exec(fileName)[1];
        return fileExt in filesIcons ? filesIcons[fileExt]:filesIcons['unknown'];
    }
    function listFiles(arr){
        // собираю все в массив т.к. по нормальному оно работать не хочет (или я не придумал как сделать нормально....)
        let elems = [];
        return(
            React.createElement("ul", {
                        className: "filesList"
                    },
                React.createElement("li", {
                        key: -1
                    }, 
                    React.createElement("a", {
                            href: "#", onClick: (e) => update(e),
                            className: "fileListElement"
                        },
                        React.createElement("img", {
                                src: directoryBackPng
                            }
                        ),
                        React.createElement("p", {}, "../")
                    )
                ),
                arr.forEach((element) => {
                    let path = element[0];
                    if (path === current_path){
                        let folders = element[1];
                        let files = element[2];
                        folders.forEach((folder) =>{
                            let folderName = folder[0];
                            let folderModifDate = folder[1];
                            let folderSize = folder[2];
                            let folderUniqHash = folderModifDate.hashCode()+folderName.hashCode()+folderSize.hashCode()
                            elems.push(
                                React.createElement("li", {
                                        key: folderUniqHash,
                                        className: "fileLiElement"
                                    }, 
                                    React.createElement("a", {
                                            href: "#",
                                            className: "fileListElement",
                                            onClick: (e) => update(e, element[0]+"/"+folderName)
                                        }, 
                                        React.createElement("img", {
                                            src: directoryPng
                                        }),
                                        React.createElement("p", {}, folderName)
                                    ),
                                    React.createElement("p",{
                                            className: "fileCreateDate"
                                        },
                                        folderModifDate
                                    ),
                                    React.createElement("p",{
                                            className: "fileSize"
                                        },
                                        folderSize
                                    )
                                )
                            )
                        });
                        files.forEach((file) =>{
                            let fileName = file[0];
                            let fileModifDate = file[1];
                            let fileSize = file[2];
                            let fileUniqHash = fileModifDate.hashCode()+fileName.hashCode()+fileSize.hashCode()
                            elems.push(
                                React.createElement("li", {
                                        key: fileUniqHash,
                                        className: "fileLiElement"
                                    }, 
                                    React.createElement("a", {
                                            href: api_addr+element[0]+'/'+fileName, 
                                            download: '',
                                            className: "fileListElement"
                                        }, 
                                        React.createElement("img", {
                                            src: setFileIcon(fileName)
                                        }),
                                        React.createElement("p", {}, fileName)
                                    ),
                                    React.createElement("p",{
                                            className: "fileCreateDate"
                                        },
                                        fileModifDate
                                    ),
                                    React.createElement("p",{
                                            className: "fileSize"
                                        },
                                        fileSize
                                    )
                                )
                            )
                        });
                    }
                }),
                elems
            )
        )
    }
    return (
        <div className="container files">
            <WindowsDiv title="File Manager" className="fileManagerDiv" enableControls={true}>
                <div className='filemanager_wrapper'>
                    <div className="title-path">
                        <button type="button" disabled>Address</button>
                        <div className="pathDiv">
                            <img alt="path icon" src={pathIcon}></img>
                            <div className="pathText">{current_path}</div>
                        </div>
                    </div>
                    <hr></hr>
                    {listFiles(items)}
                </div>
            </WindowsDiv>
        </div>
    );
}

export default FileManager;
