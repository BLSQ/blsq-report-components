import React from "react";
import { withTranslation } from "react-i18next";
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
import PluginRegistry from "../core/PluginRegistry";
import { enqueueSnackbar } from "../redux/actions/snackBars";
import { errorSnackBar, succesfullSnackBar } from "../shared/snackBars/snackBar";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading } from "../redux/actions/load";

const styles = (theme) => ({
  title: {
    width: "80%",
  },
  deleteButton: {
    marginLeft: theme.spacing(4),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  label: {
    paddingTop: 4,
  },
});

const useStyles = makeStyles((theme) => styles(theme));

const DeleteContractDialog = ({ t, contract, onSavedSuccessfull }) => {

  const contractService = PluginRegistry.extension("contracts.service");

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.load.isLoading);


  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSave = () => {
    setOpen(false);
    dispatch(setIsLoading(true));
    const deleteContract = contractService.deleteContract(contract);
    deleteContract
      .then(() => {
        dispatch(setIsLoading(false));
        onSavedSuccessfull();
        dispatch(enqueueSnackbar(succesfullSnackBar("snackBar.success.save")));
      })
      .catch((err) => {
        setIsLoading(false);
        dispatch(enqueueSnackbar(errorSnackBar("snackBar.error.save", null, err)));
      });
  };

  return (
    <>
      <Tooltip onClick={() => handleClickOpen()} placement="bottom" title={t("delete")} arrow>
        <span className={classes.deleteButton}>
          <IconButton size="small">
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
        <DialogTitle disableTypography>
          <Typography variant="h6" className={classes.title}>
            {t("contracts.deleteTitle")}
          </Typography>
          <IconButton className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>{t("contracts.deleteWarning")}</DialogContent>

        <DialogActions>
          <Button autoFocus onClick={handleSave} color="primary" disabled={isLoading}>
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withTranslation()(DeleteContractDialog);
