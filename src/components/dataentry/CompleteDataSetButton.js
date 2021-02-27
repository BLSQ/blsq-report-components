import React, { useEffect, useState, useContext } from "react";
import { Button } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

const CompleteDataSetButton = ({calculations}) => {
  const formDataContext = useContext(FormDataContext);

  const isComplete = formDataContext.isDataSetComplete();
  const onClick = () => {
    formDataContext.toggleComplete(calculations);
  };
  return (
    <Button
      variant="contained"
      disabled={!formDataContext.isDataWritable()}
      color="primary"
      onClick={onClick}
      title={JSON.stringify(formDataContext.completeDataSetRegistration, undefined, 2)}
    >
      {isComplete ? "Uncomplete" : "Complete"}
    </Button>
  );
};

export default CompleteDataSetButton;
