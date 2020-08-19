import React, { useRef } from "react";
import { Button, Tooltip, makeStyles } from "@material-ui/core";

import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";
import { useDispatch } from "react-redux";

import { closeFixedSnackbar } from "../../redux/actions/snackBars";

const useStyles = makeStyles((theme) => ({
  tooltip: {
    marginRight: theme.spacing(),
  },
  textarea: {
    position: "absolute",
    top: -5000,
    left: -5000,
    zIndex: -100,
  },
  errorMessage: {
    display: "-webkit-box",
    "-webkit-line-clamp": 30,
    "-webkit-box-orient": "vertical",
    overflow: "hidden",
  },
}));

const SnackBarErrorMessage = ({ errorLog, messageKey, t }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const textAreaRef = useRef(null);
  if (!errorLog || errorLog === "") return null;
  const handleClick = (e) => {
    textAreaRef.current.select();
    document.execCommand("copy");
    e.target.focus();
  };
  const errorMessage =
    typeof errorLog === "string" ? errorLog : JSON.stringify(errorLog);
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
      <textarea
        onChange={() => null}
        className={classes.textarea}
        ref={textAreaRef}
        value={errorMessage}
      />
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
};

export default withNamespaces()(SnackBarErrorMessage);
