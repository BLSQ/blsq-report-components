import PluginRegistry from "./PluginRegistry";
import React, { Component } from "react";
import PropTypes from "prop-types";

class ExtensionsComponent extends Component {
  render() {
    // console.log('this.props.extensionKey', this.props.extensionKey)
    return PluginRegistry.extensions(this.props.extensionKey).map(
      (Extension, index) => {
        const key = `${this.props.extensionKey}-${index}`;
        // console.log(key, Extension)
        return (
          <Extension
            key={key}
            {...this.props}
          />
        );
      }
    );
  }
}

ExtensionsComponent.propTypes = {
  extensionKey: PropTypes.string.isRequired
};

export default ExtensionsComponent;
