import React, { useEffect, useState, useContext } from "react";
import { Button } from "@material-ui/core";
import FormDataContext from "./FormDataContext";
import { dsRegistrationPeriods } from "./forms";

const CompleteDataSetButton = ({ variant, calculations, completable, dataSetId, period, children }) => {
  const isDataSetCompletable = completable == undefined ? true : completable;
  const formDataContext = useContext(FormDataContext);

  let currentDataSetIds = [];
  if (dataSetId) {
    currentDataSetIds.push(dataSetId);
  } else if (formDataContext.dataSets) {
    currentDataSetIds = formDataContext.dataSets.map((c) => c.id);
  } else if (formDataContext.dataSet) {
    currentDataSetIds = [formDataContext.dataSet.id];
  }

  useEffect(() => {
    setComplete(formDataContext.areDataSetsComplete(currentDataSetIds, period || formDataContext.period));
    console.log("formData modified !");
  }, [formDataContext.completeDataSetRegistrations]);
  const [loading, setLoading] = useState(false);
  const [isComplete, setComplete] = useState(formDataContext.areDataSetsComplete(currentDataSetIds));
  const isWritable = formDataContext.areDataWritable(currentDataSetIds);
  const onClick = async () => {
    setLoading(true);
    const desiredState = !isComplete;
    try {
      let dataSets = formDataContext.dataSets.filter(ds => currentDataSetIds.includes(ds.id) )
      for (let dataSet of dataSets) {
        const regPeriods = dsRegistrationPeriods(dataSet, period || formDataContext.period);
        for (const regPeriod of regPeriods) {
          const currentState = formDataContext.isDataSetComplete(dataSet.id, regPeriod);
          if (desiredState !== currentState) {
            await formDataContext.toggleComplete(calculations, dataSet.id, regPeriod);           
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      key={currentDataSetIds.join("-") + "-" + isComplete}
      variant={variant || "contained"}
      disabled={loading || !isWritable || (!isComplete && !isDataSetCompletable)}
      color="primary"
      onClick={onClick}
      title={JSON.stringify(
        formDataContext.completeDataSetRegistrations.filter((r) => currentDataSetIds.includes(r.dataSet)),
        undefined,
        2,
      )}
    >
      {isComplete ? "Uncomplete" : "Complete"} {children}
    </Button>
  );
};

export default CompleteDataSetButton;
