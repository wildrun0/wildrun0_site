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
        console.log(items)
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