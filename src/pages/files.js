import React, {useEffect, useState} from 'react'

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
        return <div>Ошибка: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Загрузка...</div>;
    } else {        
        return (
            <ul>
                {
                    Object.keys(items).map((key) => (
                        <li>
                            <a href={api_addr + "/file/" + items[key]}> {items[key]}</a>
                        </li>
                    ))
                }
            </ul>
        );
    }
}
export default Files