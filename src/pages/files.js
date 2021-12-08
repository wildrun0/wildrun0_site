import React, {useEffect, useState} from 'react'
import FileManager from '../components/FileManager';
import WindowsDiv from '../components/WindowsDiv';

import errorPng from '../icons/error.png';
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
            <WindowsDiv title="FILE SYSTEM ERROR" className="error" drag={false}>
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
            <FileManager api_address={api_addr} files={items} startPath="/files"/>
        );
    }
}
export default Files