import React, {useEffect, useState, useReducer, fetchData} from 'react'
import WindowsDiv from '../components/WindowsDiv';
import errorPng from '../icons/error.png'

var api_addr = "http://localhost:1337";

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
        // document.addEventListener("click", update, false);
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
                {},
                React.createElement("li", {Key: -1}, React.createElement("a", {href: "#", onClick: (e) => update(e, -1)}, '..')),
                arr.forEach((element, index) =>{
                    if (index === current_direction){
                        var folders = element[1];
                        var files = element[2];
                
                        folders.forEach((folder, i) =>{
                            // ну не нада мне с 0 считать, не нада
                            i++;
                            elems.push(
                                React.createElement("li", {Key: i}, 
                                    React.createElement("a", {
                                        href: "#", 
                                        onClick: (e) => update(e, i)
                                    }, folder)
                                )
                            )
                        });
                        files.forEach((file, i) =>{
                            // чтобы key папок и файлов отличались
                            i = i+1337;
                            elems.push(
                                React.createElement("li", {Key: i}, 
                                    React.createElement("a", {
                                        href: api_addr+"/file/"+element[0]+'/'+file, 
                                        download: ''
                                    }, file)
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
                <React.Fragment>
                    {listFiles(items)}
                </React.Fragment>
            // <div dangerouslySetInnerHTML={{__html: _listFiles(items).innerHTML}} />
        );
    }
}
export default Files