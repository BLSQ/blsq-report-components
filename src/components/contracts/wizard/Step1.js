import React, { useEffect, useState } from "react";
import PapaParse from "papaparse";
import { InputLabel } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import PluginRegistry from "../../core/PluginRegistry";

const Step1 = ({ contractsToImport, setContractsToImport }) => {
  const contractService = PluginRegistry.extension("contracts.service");

  function parserCsv(evt) {
    const files = evt.target.files || [];
    if (!files.length) return;
    var file = evt.target.files[0];

    PapaParse.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function (data) {
        setContractsToImport(data);
      },
    });
  }

  return (
    <div>
      <h2>Step 1 : upload csv file</h2>
      <InputLabel style={{ marginLeft: "10px" }}>File to import</InputLabel>
      <input type="file" name="csv" onChange={parserCsv} accept=".csv"></input>
      <br></br>
      {contractsToImport && contractsToImport.data && contractsToImport.data.length > 0 && (
        <div>
          <Typography>{contractsToImport && contractsToImport.data && contractsToImport.data.length}</Typography>
          {Object.values(contractService.mappings).map((mapping) => {
            return (
              <li>
                <span
                  style={{
                    color:
                      contractsToImport.meta && contractsToImport.meta.fields.includes(mapping.code) ? "green" : "",
                  }}
                >
                  {mapping.code}
                </span>
              </li>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Step1;
