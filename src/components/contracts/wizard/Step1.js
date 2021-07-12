import React, { useEffect, useState } from "react";
import PapaParse from "papaparse";
import { InputLabel } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import PluginRegistry from "../../core/PluginRegistry";

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
 }

const Step1 = ({ contractsToImport, setContractsToImport }) => {
  const contractService = PluginRegistry.extension("contracts.service");

  function parserCsv(evt) {
    const files = evt.target.files || [];
    if (!files.length) return;
    var file = evt.target.files[0];

    PapaParse.parse(file, {
      header: true,
      complete: function (data) {
        const contractService = PluginRegistry.extension("contracts.service");
        const contractFields = contractService.contractFields();
        const alternateNames = {
          contract_main_orgunit: "Unité d'organisation principale",
          contract_start_date: "Début",
          contract_end_date: "Fin",
        };
        
        // Allow to read the "exported" format
        for (const record of data.data) {
          for (const field of contractFields) {
            const value = record[field.name] || record[alternateNames[field.code]];
            if (value) {
              if (!data.meta.fields.includes(field.code)) {
                data.meta.fields.push(field.code);
              }
              record[field.code] = value;
            }
          }  
          if (record["Nom d'unité d'organisation"]) {
            record["orgUnit-name"] = record["Nom d'unité d'organisation"]
          }
          if (record["Id d'unité d'organisation"]) {
            record["orgUnit-id"] = record["Id d'unité d'organisation"]
          }
          if (record.contract_start_date && isFunction(record.contract_start_date.toISOString)) {
            record.contract_start_date = record.contract_start_date.toISOString().slice(0,8)
          }
          if (record.contract_end_date && isFunction(record.contract_end_date.toISOString)) {
            record.contract_end_date = record.contract_start_date.toISOString().slice(0,8)
          }
        }
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
