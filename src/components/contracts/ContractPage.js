import React, { useState, useEffect } from "react";
import PluginRegistry from "../core/PluginRegistry";
import Typography from "@material-ui/core/Typography";
import ContractCard from "./ContractCard";
import { toOverlappings, toContractsById } from "./utils";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link } from "react-router-dom";

function ContractPage({ match }) {
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState(null);
  const [contractsById, setContractsById] = useState(null);
  const [contractsOverlaps, setContractsOverlaps] = useState({});

  const contractService = PluginRegistry.extensions("contracts.service")[0];
  useEffect(() => {
    const fetchData = async () => {
      if (contractService) {
        setIsLoading(true);
        const allContracts = await contractService.findAll();

        const contracts = allContracts.filter(
          (c) => c.orgUnit.id === match.params.orgUnitId
        );
        contracts.sort((a, b) => (a.startPeriod > b.startPeriod) ? 1 : -1)
        setContractsOverlaps(toOverlappings(contracts));
        setContractsById(toContractsById(contracts));
        setContracts(contracts);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setIsLoading, setContracts]);

  const filteredContracts = contracts;

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" to="/contracts">
          Contracts
        </Link>

        <Typography color="textPrimary">
          {contracts && contracts.length > 0
            ? contracts[0].orgUnit.name
            : "..."}
        </Typography>
      </Breadcrumbs>
      {isLoading ? <div>Loading ...</div> : <div />}

      {contracts && (
        <Typography>
          {contracts.length} contracts, {Object.keys(contractsOverlaps).length}{" "}
          overlapping.
        </Typography>
      )}
      {contracts && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "space-around",
          }}
        >
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              contractsById={contractsById}
              contractsOverlaps={contractsOverlaps}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ContractPage;
