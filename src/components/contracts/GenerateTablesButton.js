import React from "react";
import { useQuery } from "react-query";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import { Button } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "@material-ui/icons/Check";
import { Alert } from "@material-ui/lab";
import { useTranslation } from "react-i18next";

const UNKNOWN = "unknown";
const STOPPED = "stopped";
const RUNNING = "running";

// step 1: determine pollingStatus
const getPollingStatus = async () => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const api = await dhis2.api();
  const pollingEvents = await api.get("system/tasks/RESOURCE_TABLE");
  return pollingEvents;
};

// step 2: post request to start polling using new event id and return event id
const triggerResourceTable = async () => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const api = await dhis2.api();
  const { response } = await api.post("resourceTables");
  return response;
};

// statuses array of array of task
const filterUncompletedTasks = (allStatuses) => {
  return allStatuses.filter((statuses) => !statuses.some((s) => s.completed));
};

const getLastExecutionDate = (tasks) => {
  const completedTaskDates = tasks
          .flatMap((t) => t)
          .filter((event) => event.completed)
          .map((event) => event.time);
  return completedTaskDates.sort()[completedTaskDates.length - 1]          
}

const GenerateTablesButton = ({ creationDate }) => {
  const { t } = useTranslation();
  const [pollingStatus, setPollingStatus] = React.useState(UNKNOWN);
  const [pollingId, setPollingId] = React.useState();
  const [lastExecutionDate, setLastExecutionDate] = React.useState();

  const verifyPollingStatusQuery = useQuery("verifyPollingStatus", getPollingStatus, {
    onSuccess: (statusesById) => {
      const statuses = Object.values(statusesById);
      const uncompletedTasks = filterUncompletedTasks(statuses);      
      setLastExecutionDate(getLastExecutionDate(statuses));

      if (uncompletedTasks.length > 0) {
        setPollingId(uncompletedTasks[0][0].id);
        setPollingStatus(RUNNING)
      } else {
        setPollingStatus(STOPPED);
      }
    },
  });

  // trigger resource table polling
  const triggerResourceTableQuery = useQuery("triggerResourceTableQueryForPolling", triggerResourceTable, {
    enabled: false,
    onSuccess: (response) => setPollingId(response.id),
  });

  // step 4: poll to see when finished returns an array of steps
  const beginPolling = async () => {
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    const response = await api.get(`system/tasks/RESOURCE_TABLE/${pollingId}`);  
    return response;
  };

  // begin resource table polling
  const resourceTablePollingQuery = useQuery("beginResourceTablePolling", beginPolling, {
    enabled: !!pollingId,
    refetchInterval: 30000,
    onSuccess: (task) => {
      const tasks = [task];
      const uncompletedTasks = filterUncompletedTasks(tasks);
      if (uncompletedTasks.length == 0) {
        setPollingStatus( STOPPED);
        setPollingId(undefined);
        setLastExecutionDate(getLastExecutionDate(tasks));
      } else {
        setPollingStatus(RUNNING);
      }
    },
  });

  const queries = [verifyPollingStatusQuery, resourceTablePollingQuery, triggerResourceTableQuery];
  const isError = queries.some((q) => q.isError);
  const errorMessages = queries.map((q) => q?.error?.message).filter((m) => m);
  return (
    <div>
      <Button
        autoFocus
        disabled={pollingStatus === UNKNOWN || pollingStatus === RUNNING}
        onClick={() => {
          triggerResourceTableQuery.refetch();
        }}
        color="primary"
      >
        {t("contracts.resourceTables.generateButton")}
      </Button>

      {isError ? (
        <Alert onClose={() => {}} severity="error">
          {errorMessages.join(" ")}
        </Alert>
      ) : (
        ""
      )}

      {pollingStatus === RUNNING ? <CircularProgress size={15} /> : ""}
      {lastExecutionDate > creationDate ? <CheckIcon fontSize="small" /> : ""}   
    </div>
  );
};

export default GenerateTablesButton;
