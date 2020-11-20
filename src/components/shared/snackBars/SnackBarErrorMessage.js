import React from "react";
import { Button, Tooltip, makeStyles } from "@material-ui/core";

import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

import { closeFixedSnackbar } from "../../redux/actions/snackBars";

const useStyles = makeStyles((theme) => ({
  tooltip: {
    marginRight: theme.spacing(),
  },
  errorMessage: {
    display: "-webkit-box",
    "-webkit-line-clamp": 30,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },
}));

const SnackBarErrorMessage = ({ errorLog, messageKey, t, dispatch }) => {
  const classes = useStyles();
  const errorMessage =
    typeof errorLog === "string" ? errorLog : JSON.stringify(errorLog);
  if (!errorLog || errorLog === "") return null;
  const handleClick = (e) => {
    navigator.clipboard.writeText(errorMessage);
    e.target.focus();
  };
  const handleClose = () => dispatch(closeFixedSnackbar(messageKey));
  return (
    <>
      <Tooltip
        size="small"
        title={<p className={classes.errorMessage}>{errorMessage}</p>}
        className={classes.tooltip}
        arrow
      >
        <Button
          onClick={(e) => handleClick(e)}
          size="small"
          variant="outlined"
          color="inherit"
        >
          {t("snackBar.copyError")}
        </Button>
      </Tooltip>
      <Button
        onClick={() => handleClose()}
        size="small"
        variant="outlined"
        color="inherit"
      >
        {t("close")}
      </Button>
    </>
  );
};

SnackBarErrorMessage.defaultProps = {
  errorLog: null,
};
SnackBarErrorMessage.propTypes = {
  errorLog: PropTypes.any,
  messageKey: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default withTranslation()(SnackBarErrorMessage);
