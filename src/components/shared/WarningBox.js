import React from "react";
import PropTypes from "prop-types";
import { Box, makeStyles, Grid } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
import yellow from "@material-ui/core/colors/yellow";

const styles = (theme) => ({
  root: {
    backgroundColor: fade(yellow[500], 0.2),
    borderLeft: `5px solid ${yellow[500]}`,
  },
  iconContainer: {
    fontSize: 30,
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const WarningBox = ({ children }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root} py={2}>
      <Grid container spacing={0}>
        <Grid
          container
          item
          xs={2}
          justify="center"
          className={classes.iconContainer}
        >
          ⚠️
        </Grid>
        <Grid container item xs={10}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
};

WarningBox.defaultProps = {
  children: <span />,
};

WarningBox.propTypes = {
  children: PropTypes.node,
};

export default WarningBox;
