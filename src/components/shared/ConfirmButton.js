import React from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
const ConfirmButton = (props) => {
  const { t } = useTranslation();
  // onConfirm = This is a callback function when the user clicks Yes.
  // children = This is what will show in the dialog content. This can be a string, or it can be another, more complex component.
  const { onConfirm, children } = props;
  return (
    <div>
      <Button
        onClick={() => {
          if (window.confirm(t("dataSync.areYouSure"))) onConfirm.mutate();
        }}
        color="primary"
      >
        {children}
      </Button>
    </div>
  );
};
export default ConfirmButton;
