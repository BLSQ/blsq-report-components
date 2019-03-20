import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";

const styles = theme => ({
  buttonLike: {
    ...theme.typography.button,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing.unit,
    fontSize: "0.8125rem"
  }
});

class OuFormLink extends Component {
  render() {
    const { orgUnit, t } = this.props;

    return (
      <Button
        variant="text"
        color="primary"
        size="small"
        component={Link}
        to={"groupedit/" + orgUnit.id}
      >
        {t("edit_org_unit_groups")}
      </Button>
    );
  }
}

OuFormLink.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(OuFormLink));
