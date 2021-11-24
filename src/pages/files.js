import React, {useEffect, useState} from 'react'
import WindowsDiv from '../components/WindowsDiv';
import errorPng from '../icons/error.png'

var api_addr = "http://localhost:1337";

const Files = () => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
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
        // console.log(items)
        return (
            <ul>
            {items.map(item => (
                <li key={item[0]}>
                    {/* корень    папки в корне  файлы в корне (array)*/}
                    {  item[0]} / {item[1]}    / {item[2]}
                </li>
            ))}
        </ul>
        );
    }
}
export default Files