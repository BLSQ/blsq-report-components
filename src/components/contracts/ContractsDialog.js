import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";
import {
  Button,
  Dialog,
  Tooltip,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Edit from "@material-ui/icons/Edit";
import OuSearch from "../shared/OuSearch";

const styles = (theme) => ({
  title: {
    width: "80%",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const useStyles = makeStyles((theme) => styles(theme));
const ContractsDialog = ({ t, contract }) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  // console.log(contract);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip
        onClick={() => handleClickOpen()}
        placement="bottom"
        title={t("edit")}
        arrow
      >
        <span>
          <IconButton size="small">
            <Edit />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
        <DialogTitle disableTypography>
          <Typography variant="h6" className={classes.title}>
            {contract.id !== 0 && (
              <>
                {t("contracts.editTitle")}
                <code>{` ${contract.id}`}</code>
              </>
            )}
            {contract.id === 0 && t("contracts.createTitle")}
          </Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <OuSearch
            onChange={(orgUnit) => console.log(orgUnit)}
            orgUnit={contract.orgUnit}
          />
          <Typography gutterBottom>
            {contract.fieldValues.contract_start_date}
          </Typography>
          <Typography gutterBottom>
            {contract.fieldValues.contract_end_date}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
ContractsDialog.defaultProps = {
  contract: {
    id: 0,
    orgUnit: null,
    codes: [],
    fieldValues: {},
  },
};

ContractsDialog.propTypes = {
  t: PropTypes.func.isRequired,
  contract: PropTypes.object,
};

export default withNamespaces()(ContractsDialog);
