import React from 'react'
import Navbar from './navbar';

const Layout = ({ children }) => {
    return(
        <React.Fragment>
            <div className = "layout-container">
                <Navbar />
            </div>
            { children }
        </React.Fragment>
    );
}
export default Layout