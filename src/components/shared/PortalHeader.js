
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

class PortalHeader extends React.Component {
  constructor() {
    super();
    this.portalRoot = document.getElementById("portal-header");

    // 1: Create a new div that wraps the component
    this.el = document.createElement("div");

  }
  // 2: Append the element to the DOM when it mounts
  componentDidMount = () => {
    this.portalRoot = document.getElementById("portal-header");
    this.portalRoot.appendChild(this.el);
  };
  // 3: Remove the element when it unmounts
  componentWillUnmount = () => {
    this.portalRoot.removeChild(this.el);
  };
  render() {
    // 4: Render the element's children in a Portal
    const { children } = this.props;
    return ReactDOM.createPortal(children, this.el);
  }
}

export default PortalHeader