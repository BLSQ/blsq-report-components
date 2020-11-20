import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

class BackButtonDemo extends Component {
  static contextTypes = {
    router: PropTypes.object
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

export default withTranslation()(BackButtonDemo);
