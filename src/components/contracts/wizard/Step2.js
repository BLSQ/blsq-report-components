import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import PluginRegistry from "../../core/PluginRegistry";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";

const Step2 = ({ contractsToImport, dhis2, setValidatedContracts, setIsLoading }) => {
  const contractService = PluginRegistry.extension("contracts.service");
  const [contracts, setContracts] = useState(undefined);
  const [rowsSelected, setRowsSelected] = useState(undefined);
  const contractFields = contractService.contractFields();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const api = await dhis2.api();
      const organisationUnits = (await api.get("organisationUnits", { paging: false, fields: "id,name,path" }))
        .organisationUnits;
      const organisationUnitsById = _.keyBy(organisationUnits, (ou) => ou.id);

      const currentContracts = await contractService.findAll();

      contractsToImport.data.map((contractRaw, index) => {
        contractRaw.contract_start_date = contractRaw.contract_start_date || "2009-01-01";
        contractRaw.contract_end_date = contractRaw.contract_end_date || "2040-12-31";

        let orgUnit = organisationUnitsById[contractRaw["orgUnit-id"]] || {
          id: contractRaw["orgUnit-id"],
          name: contractRaw["orgUnit-name"],
        };

        const fieldValues = {
          id: "csv_" + (index + 1),
          contract_start_date: contractRaw.contract_start_date,
          contract_end_date: contractRaw.contract_end_date,
          orgUnit: orgUnit,
          ...contractRaw,
        };

        const contract = contractService.newContract(fieldValues);
        contractRaw["orgUnit-path"] = orgUnit && orgUnit.path ? orgUnit.path.split("/").filter(id => id).slice(1).map(id => organisationUnitsById[id]).map(ou => ou ? ou.name : "?").join(" > ") : undefined

        contractRaw.warnings = [];
        // validate orgunit
        if (organisationUnitsById[contractRaw["orgUnit-id"]] == undefined) {
          contractRaw.warnings.push("orgunit '" + contractRaw["orgUnit-id"] + "' not found");
        }

        // validate contract_main_orgunit
        if (
          contractRaw["contract_main_orgunit"] &&
          organisationUnitsById[contractRaw["contract_main_orgunit"]] == undefined
        ) {
          contractRaw.warnings.push("orgunit '" + contractRaw["contract_main_orgunit"] + "' not found");
        }

        // validate optionsets
        contractFields.forEach((field) => {
          if (field.optionSet) {
            const fieldValue = contractRaw[field.code];
            const option = field.optionSet.options.find((o) => o.code == fieldValue);
            if (fieldValue != undefined && option == undefined) {
              contractRaw.warnings.push(
                "invalid value for " +
                  field.code +
                  " " +
                  fieldValue +
                  " unknown : " +
                  field.optionSet.options.map((o) => o.code).join(" , "),
              );
            }
          }
        });
        // validate overlaps
        const overlappingContract = currentContracts.find(
          (currentContract) => currentContract.orgUnit.id == contract.orgUnit.id && currentContract.overlaps(contract),
        );
        if (overlappingContract) {
          contractRaw.warnings.push(
            "contract overlaps with " +
              overlappingContract.startPeriod +
              " -> " +
              overlappingContract.endPeriod +
              " : " +
              overlappingContract.codes.join(" "),
          );
        }

        const errors = contractService.validateContract(contract);
        if (errors.length > 0) {
          for (let error of errors) {
            contractRaw.warnings.push(error.message)
          }
        }
      });

      const validIndexes = [];
      contractsToImport.data.map((contractRaw, index) => {
        contractRaw.warnings = contractRaw.warnings.join("\n");
        if (contractRaw.warnings == "") {
          validIndexes.push(index);
        }
      });

      setContracts(contractsToImport.data);
      setRowsSelected(validIndexes);
      setValidatedContracts(validIndexes.map((index) => contractsToImport.data[index]));
      setIsLoading(false);
    };
    loadData();
  }, [contractsToImport]);

  const onRowSelectionChange = (currentRowsSelected, allRowsSelected, rowsSelected) => {
    setRowsSelected(rowsSelected);
    setValidatedContracts(rowsSelected.map((index) => contracts[index]));
  };

  const getMuiTheme = () =>
    createMuiTheme({
      overrides: {
        MuiTableCell: { whiteSpace: "nowrap" },
        MUIDataTableBodyCell: { root: { whiteSpace: "nowrap" } },
      },
    });

  return (
    <div style={{maxWidth:"95%"}}>
      <h2>Step 2 : Validations</h2>
      <MuiThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          title={""}
          data={contracts}
          columns={["orgUnit-id", "orgUnit-name"].concat(contractFields.map((f) => f.code)).concat(["warnings", "orgUnit-path"])}
          options={{
            fixedHeader: true,
            responsive: 'scrollMaxHeight',
            onRowSelectionChange: onRowSelectionChange,
            rowsSelected: rowsSelected,
            rowsPerPage: 5,
            rowsPerPageOptions: [5, 10, 50, 100, 1000],
            selectToolbarPlacement: "above",
            print: false,
          }}
        />
      </MuiThemeProvider>
    </div>
  );
};

export default Step2;
