import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from '../components/Layout'

import Play from './play'
import Main from './main'
import Files from './files'
import Experimental from './experimental'

const Pages = () => {
    return(
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route exact path="/" element={<Main />}/>
                    <Route path="/play" element={<Play />}/>
                    <Route path="/experimental" element={<Experimental />}/>
                    <Route path="/files" element={<Files />}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
export default Pages