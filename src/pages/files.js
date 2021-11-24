import React, {useEffect, useState, useReducer} from 'react'
import WindowsDiv from '../components/WindowsDiv';
import errorPng from '../icons/error.png'

var api_addr = "http://localhost:1337";
var current_direction = 0;

function listFiles(arr){
    var ul = document.createElement("ul");

    var goback = document.createElement("li")
    goback.setAttribute('key',-1);

    var goback_a = document.createElement('a');
    goback_a.innerHTML = "..";
    goback_a.href="javascript:;";

    goback.append(goback_a);
    ul.appendChild(goback)
    arr.forEach((element, index) =>{
        if (index === current_direction){
            var folders = element[1];
            var files = element[2];
    
            folders.forEach((folder, i) =>{
                // ну не нада мне с 0 считать, не нада
                i++;

                var li = document.createElement('li');
                li.setAttribute('key',i);
                
                var a = document.createElement('a');
                a.innerHTML = folder;
                a.href="javascript:;";

                li.append(a);
                ul.appendChild(li);
            });
            files.forEach((file, i) =>{
                // чтобы key папок и файлов отличались
                i = i+1337;

                var li = document.createElement('li');
                li.setAttribute('key',i);

                var a = document.createElement('a');
                a.download = '';
                a.innerHTML = file;

                if(current_direction > 0){
                    a.href = api_addr+"/file/"+element[0]+'/'+file
                } else{
                    a.href = api_addr+"/file/"+file
                }

                li.append(a);
                ul.appendChild(li);
            });
        }
    })
    return ul;
}
const Files = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => {
        var dirs_history = [];
        function update(event){
            var clickedElem = event.target;
            if (clickedElem.href === "javascript:;"){
                var element_index = clickedElem.parentElement.getAttribute("key")

                //  магия по переключению папок
                // "глубина папок" = current_direction. Каждая папка = +1 к current_direction.
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
            }
        }
        document.addEventListener("click", update);
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
            <div dangerouslySetInnerHTML={{__html: listFiles(items).innerHTML}} />
        );
    }
}
export default Files