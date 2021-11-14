import React from "react";

import './styles/media_btn.css'


class MediaBtn extends React.Component {
    handleClick = () => {
        window.location.href = (this.props.href);
    }
  
    render() {
      return (
        <button className="social_btn" onClick={this.handleClick}> 
             <img src={this.props.SOCIAL_LOGO_NAME}></img>
             <p>{this.props.text}</p>
        </button> 
      );
    }
  }
export default MediaBtn