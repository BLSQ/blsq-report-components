import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { withNamespaces } from "react-i18next";

class BackButtonDemo extends Component {
  static contextTypes = {
    router: () => true // replace with PropTypes.object if you use them
  };

  render() {
    const { t } = this.props;
    return (
      <Button
        className="button icon-left"
        onClick={this.context.router.history.goBack}
      >
        {t("back_buttom_caption")}
      </Button>
    );
  }
}

export default withNamespaces()(BackButtonDemo);
