import React, {useEffect} from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from '../components/Layout'

import Play from './play'
import Main from './main'
import Files from './files'

const Pages = () => {
    return(
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route exact path="/" element={<Main />}/>
                    <Route path="/play" element={<Play />}/>
                    <Route path="/files" element={<Files />}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
export default Pages