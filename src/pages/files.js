import React, {useEffect, useState, useReducer} from 'react'
import WindowsDiv from '../components/WindowsDiv';

import './styles/Files.css'

import errorPng from '../icons/error.png'
import directoryPng from '../icons/directory.png'
import directoryBackPng from "../icons/directoryBack.png"
import pathIcon from "../icons/pathIcon.png"

import txtFilePng from "../icons/txtFile.png"
import zipFilePng from "../icons/zipFile.png"
import defaultFilePng from "../icons/pyFile.png"
var filesIcons = {
    'unknown': defaultFilePng,
    'txt': txtFilePng,
    //несколько ключей к одному значению
    ...Object.fromEntries(
        ['7z','zip', 'rar'].map(key => [key, zipFilePng])
    )
}

var api_addr = "http://192.168.0.101:1337";

var current_path = "/files";

// Чтобы создать уникальные key для каждого <li> элемента
// Ниже отключаем чтобы реакт не ругался на изменение String элемента
// eslint-disable-next-line
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const Files = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    function update(e, path){
        e.preventDefault(); // двойной клик заебал

        if (path !== undefined){
            current_path = path
            var path_el = document.getElementsByClassName("pathText")[0]
            //работает только так
            setTimeout(function(){
                path_el.scrollLeft = 1500;    
            },1);
        } else{
            if (current_path !== '/files'){
                var current_path_arrayed = current_path.split('/')
                current_path_arrayed.pop()
                current_path = current_path_arrayed.join("/")
            }
        }
        forceUpdate(); // обновляем чтобы отрендерить папку
    }
    useEffect(() => {
        fetch(`${api_addr}/files`)
        .then(res => res.json())
        .then(
          (result) => {
            setIsLoaded(true);
            setItems(result);
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    }, [])
    function setFileIcon(fileName){
        var re = /(?:\.([^.]+))?$/;
        var fileExt = re.exec(fileName)[1];
        return fileExt in filesIcons ? filesIcons[fileExt]:filesIcons['unknown'];
    }
    function listFiles(arr){
        // собираю все в массив т.к. по нормальному оно работать не хочет (или я не придумал как сделать нормально....)
        var elems = [];
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
                arr.forEach((element) =>{
                    var path = element[0]
                    if (path === current_path){
                        var folders = element[1];
                        var files = element[2];
                        folders.forEach((folder) =>{
                            var folderName = folder[0];
                            var folderModifDate = folder[1];
                            var folderSize = folder[2];
                            var folderUniqHash = folderModifDate.hashCode()+folderName.hashCode()+folderSize.hashCode()
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
                            var fileName = file[0];
                            var fileModifDate = file[1];
                            var fileSize = file[2];
                            var fileUniqHash = fileModifDate.hashCode()+fileName.hashCode()+fileSize.hashCode()
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
    if (error) {
        return(
            <WindowsDiv title="ERROR"className="error" drag={false}>
                <div className="loading-error-body">
                    <img src={errorPng} alt="Error"></img>
                    <p><b>Error happend: {error.message}.</b> This was probably caused because of internal server error or 
                    server unavailability. Try to refresh the page</p>
                </div>
            </WindowsDiv>
        )
    } else if (!isLoaded) {
        return <p className="loading">Loading...</p>;
    } else {
        return (
            <WindowsDiv title="File Manager" className="fileManagerDiv" enableControls={true}>
                <div>
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
        );
    }
}
export default Files