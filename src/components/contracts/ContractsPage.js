import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import React, { useEffect, useState } from "react";
import PluginRegistry from "../core/PluginRegistry";
import ContractCard from "./ContractCard";
import { toContractsById, toOverlappings } from "./utils";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link } from "react-router-dom";

function ContractsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState(null);
  const [contractsById, setContractsById] = useState(null);
  const [contractsOverlaps, setContractsOverlaps] = useState({});
  const [filter, setFilter] = useState(undefined);
  const contractService = PluginRegistry.extensions("contracts.service")[0];
  useEffect(() => {
    const fetchData = async () => {
      if (contractService) {
        setIsLoading(true);
        const contracts = await contractService.findAll();
        setContractsOverlaps(toOverlappings(contracts));
        setContractsById(toContractsById(contracts));
        setContracts(contracts);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setIsLoading, setContracts]);

  const filteredContracts = filter
    ? contracts.filter(
        (c) =>
          (filter == "overlaps" &&
            contractsOverlaps[c.id] &&
            contractsOverlaps[c.id].size > 0) ||
          c.codes.includes(filter) ||
          c.orgUnit.name.toLowerCase().includes(filter.toLowerCase()) ||
          c.startPeriod.includes(filter) ||
          c.endPeriod.includes(filter)
      )
    : contracts;

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Typography color="textPrimary">Contracts</Typography>
      </Breadcrumbs>
      <br></br>
      {isLoading ? <div>Loading ...</div> : <div />}
      <FormControl>
        <Input
          id="input-with-icon-adornment"
          fullWidth={true}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </FormControl>
      <Typography fontWeight="fontWeightLight">
        Filter on name, contract codes, periods or type "overlaps"
      </Typography>
      {contracts && (
        <Typography>
          {filteredContracts.length} matching filter out of {contracts.length}{" "}
          contracts, {Object.keys(contractsOverlaps).length} overlapping
          globaly.
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
          {filteredContracts.slice(0, 4 * 3).map((contract) => (
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

export default ContractsPage;
