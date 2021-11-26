import React, {useEffect, useState, useReducer} from 'react'
import WindowsDiv from '../components/WindowsDiv';

import './styles/Files.css'

import errorPng from '../icons/error.png'
import directoryPng from '../icons/directory.png'
import directoryBackPng from "../icons/directoryBack.png"
import defaultFilePng from "../icons/defaultFile.png"

var api_addr = "http://192.168.0.101:1337";

var dirs_history = [];
var current_direction = 0;

const Files = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    function update(e, key){
        var element_index = key

        //  магия по переключению папок
        // "глубина папок" = current_direction. Каждая папка = +1 к current_direction.
        // element_index -1 это <li> элемент который должен вернуть нас на директорию назад
        if (parseInt(element_index) === -1){
            current_direction = dirs_history[dirs_history.length -1];
            dirs_history.pop();
            if (current_direction === undefined){
                current_direction = 0;
            }
        } else{
            dirs_history.push(current_direction);
            if (current_direction > 1){
                // если мы не на начальном экране
                current_direction = parseInt(element_index)+current_direction;
            }else{
                current_direction = parseInt(element_index);
            }
        }
        forceUpdate(); // обновляем чтобы отрендерить папку
        e.preventDefault(); // двойной клик заебал
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
                            i++; // ну не нада мне с 0 считать, не нада
                            elems.push(
                                React.createElement("li", {Key: i}, 
                                    React.createElement("a", {
                                        href: "#",
                                        className: "fileListElement",
                                        onClick: (e) => update(e, i)
                                    }, React.createElement("img", {
                                        src: directoryPng
                                    }),
                                    React.createElement("p", {}, folder)
                                    )
                                )
                            )
                        });
                        files.forEach((file, i) =>{
                            i = i+1337; // чтобы key папок и файлов отличались
                            elems.push(
                                React.createElement("li", {Key: i}, 
                                    React.createElement("a", {
                                        href: api_addr+element[0]+'/'+file, 
                                        download: '',
                                        className: "fileListElement"
                                    }, React.createElement("img", {
                                        src: defaultFilePng,
                                    }),
                                    React.createElement("p", {}, file)
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
                    <p>Error happend: {error.message}</p>
                </div>
            </WindowsDiv>
        )
    } else if (!isLoaded) {
        return <p className="loading">Загрузка...</p>;
    } else {
        return (
            <WindowsDiv title="File Manager" className="fileManagerDiv" enableControls={true}>
                {listFiles(items)}
            </WindowsDiv>
        );
    }
}
export default Files