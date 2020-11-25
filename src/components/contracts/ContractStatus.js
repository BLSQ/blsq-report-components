import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Popover, Box, IconButton, Tooltip } from "@material-ui/core";
import { withTranslation } from "react-i18next";
import classNames from "classnames";

import icons from "../styles/icons";
import tablesStyles from "../styles/tables";
import mainStyles from "../styles/main";

import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import InfoIcon from "@material-ui/icons/Info";

const getOverlaps = (contracts) => contracts.map((c) => <div key={c.id}>{`${c.orgUnit.name}, id: ${c.id}, ${c.startPeriod} - ${c.endPeriod}`}</div>);

const styles = (theme) => ({
  ...tablesStyles(theme),
  ...icons(theme),
  ...mainStyles(theme),
  button: {
    position: "relative",
    top: -2,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractStatus = ({ contract, t }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const openPopOver = Boolean(anchorEl);
  const id = openPopOver ? "contract-status" : undefined;
  const { coverageIssue, nonVisibleOverlaps, visibleOverlaps , validationErrors } = contract.statusDetail;
  return contract.status ? (
    <CheckCircleIcon className={classNames(classes.success, classes.tableIcon)} />
  ) : (
    <>
      <CancelIcon className={classNames(classes.error, classes.tableIcon, classes.pointer)} onClick={handleClick} />
      <Popover
        id={id}
        open={openPopOver}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2}>
          {validationErrors.length > 0 && <Box>{validationErrors.map((f) => f.message).join(" ")}</Box>}
          {coverageIssue && <Box>{t("contracts.status.coverageIssue")}</Box>}
          {visibleOverlaps && visibleOverlaps.length > 0 && (
            <Box>
              {t("contracts.status.visibleOverlaps", {
                count: visibleOverlaps.length,
              })}

              <Tooltip arrow title={getOverlaps(visibleOverlaps)}>
                <span>
                  <IconButton size="small" disableRipple disableFocusRipple className={classes.button}>
                    <InfoIcon color="action" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
          {nonVisibleOverlaps && nonVisibleOverlaps.length > 0 && (
            <Box>
              {t("contracts.status.nonVisibleOverlaps", {
                count: nonVisibleOverlaps.length,
              })}
              <Tooltip arrow title={getOverlaps(nonVisibleOverlaps)}>
                <span>
                  <IconButton size="small" disableRipple disableFocusRipple className={classes.button}>
                    <InfoIcon color="action" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

ContractStatus.propTypes = {
  contract: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ContractStatus);
