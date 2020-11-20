import PluginRegistry from "./PluginRegistry";
import React, { Component } from "react";
import PropTypes from "prop-types";

class ExtensionsComponent extends Component {
  render() {
    return PluginRegistry.extensions(this.props.extensionKey).map(
      (Extension, index) => {
        const key = `${this.props.extensionKey}-${index}`;
        return <Extension key={key} {...this.props} />;
      },
    );
  }
}

ExtensionsComponent.propTypes = {
  extensionKey: PropTypes.string.isRequired,
};

export default ExtensionsComponent;
