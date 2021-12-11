import React, {useEffect, useState} from 'react'
import FileManager from '../components/FileManager';
import WindowsError from '../components/WindowsError';

import './styles/Files.css'

const api_addr = process.env.REACT_APP_API_ADDRESS;

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
            <div className="fileError">
                <WindowsError title="FILE SYSTEM ERROR" drag={false}>
                    <p><b>Error happend: {error.message}.</b> This was probably caused because of internal server error or 
                    server unavailability. Try to refresh the page</p>
                </WindowsError>
            </div>
        )
    } else if (!isLoaded) {
        return <p className="loading">Loading...</p>;
    } else {
        return (
            <FileManager download_link={api_addr} files={items} startPath="/files"/>
        );
    }
}
export default Files;