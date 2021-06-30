import React, { useEffect, useState, useContext } from "react";
import { Button } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

const CompleteDataSetButton = ({ calculations, completable, dataSetId }) => {
  const isDataSetCompletable = completable == undefined ? true : completable;
  const formDataContext = useContext(FormDataContext);

  useEffect(() => {
    setComplete(formDataContext.isDataSetComplete(currentDataSetId));
    console.log("formData modified !");
  }, [formDataContext.completeDataSetRegistrations]);
  const [loading, setLoading] = useState(false);
  const currentDataSetId = dataSetId ? dataSetId : formDataContext.dataSet.id;
  const [isComplete, setComplete] = useState(formDataContext.isDataSetComplete(currentDataSetId));
  const isWritable = formDataContext.isDataWritable(currentDataSetId);
  const onClick = async () => {
    setLoading(true);
    try {
      await formDataContext.toggleComplete(calculations, currentDataSetId);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      key={currentDataSetId + "-" + isComplete}
      variant="contained"
      disabled={loading || !isWritable || (!isComplete && !isDataSetCompletable)}
      color="primary"
      onClick={onClick}
      title={JSON.stringify(
        formDataContext.completeDataSetRegistrations.filter((r) => r.dataSet == currentDataSetId),
        undefined,
        2,
      )}
    >
      {isComplete ? "Uncomplete" : "Complete"}
    </Button>
  );
};

export default CompleteDataSetButton;
