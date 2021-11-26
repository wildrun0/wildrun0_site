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

var dirs_history = [];
var current_direction = 0;
var current_path = "/files";
 
const Files = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    function update(e, key, path){
        e.preventDefault(); // двойной клик заебал
        var element_index = parseInt(key)
        
        if (path !== undefined){
            current_path = path
            var path_el = document.getElementsByClassName("pathText")[0]
            //работает только так
            setTimeout(function(){
                path_el.scrollLeft = 1500;    
            },1);
        }
        //  магия по переключению папок
        // "глубина папок" = current_direction. Каждая папка = +1 к current_direction.
        // element_index -1 это <li> элемент который должен вернуть нас на директорию назад
        if (element_index === -1){
            current_direction = dirs_history[dirs_history.length -1];
            dirs_history.pop();
            if (current_direction === undefined){
                current_direction = 0;
            } else{
                var current_path_splitted = current_path.split('/')
                current_path_splitted.pop()

                current_path = current_path_splitted.join('/')
            }
        } else{
            dirs_history.push(current_direction);
            if (current_direction > 1){
                // если мы не на начальном экране
                current_direction = element_index+current_direction;
            }else{
                current_direction = element_index;
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
            React.createElement("ul",
                {
                    className: "filesList"
                },
                React.createElement("li", {
                    Key: -1
                }, React.createElement("a", {
                        href: "#", onClick: (e) => update(e, -1),
                        className: "fileListElement"
                        }, React.createElement("img", {
                            src: directoryBackPng
                        }),
                            React.createElement("p", {}, "../")
                    )
                ),
                arr.forEach((element, index) =>{
                    if (index === current_direction){
                        var folders = element[1];
                        var files = element[2];
                        folders.forEach((folder, i) =>{
                            var folderName = folder[0];
                            var folderModifDate = folder[1];
                            var folderSize = folder[2];

                            i++; // ну не нада мне с 0 считать, не нада
                            elems.push(
                                React.createElement("li", {
                                        Key: i,
                                        className: "fileLiElement"
                                    }, 
                                    React.createElement("a", {
                                            href: "#",
                                            className: "fileListElement",
                                            onClick: (e) => update(e, i, String(element[0]+"/"+folderName))
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
                        files.forEach((file, i) =>{
                            var fileName = file[0];
                            var fileModifDate = file[1];
                            var fileSize = file[2];

                            i = i+1337; // чтобы key папок и файлов отличались
                            elems.push(
                                React.createElement("li", {
                                        Key: i,
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