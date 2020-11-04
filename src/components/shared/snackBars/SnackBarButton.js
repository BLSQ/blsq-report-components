import React from "react";
import { withTranslation } from "react-i18next";

import PropTypes from "prop-types";
import { Button } from "@material-ui/core";

function SnackBarButton(props) {
  const { messageKey, onClick, t } = props;
  return (
    <Button size="small" onClick={onClick}>
      {t(messageKey)}
    </Button>
  );
}

SnackBarButton.propTypes = {
  messageKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  t: PropTypes.object.isRequired,
};

export default withTranslation()(SnackBarButton);
