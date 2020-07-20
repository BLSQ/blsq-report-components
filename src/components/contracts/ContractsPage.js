import React, { Component } from "react";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Box from "@material-ui/core/Box";
import MUIDataTable from "mui-datatables";
import { withNamespaces } from 'react-i18next';

import PluginRegistry from "../core/PluginRegistry";
import ContractCard from "./ContractCard";
import ContractFilters from "./ContractFilters";
import { contractsColumns, contractsOptions } from "./config";
import LoadingSpinner from "../shared/LoadingSpinner";
import { toContractsById, toOverlappings, getFilteredContracts } from "./utils";
const styles = theme => ({
  rowError: {
    '& .MuiTableCell-body': {
      color: 'red',
    }
  }
});

 
class ContractsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      contracts: null,
      contractsById: null,
      contractsOverlaps: {},
      filter: undefined,
      contractService: PluginRegistry.extension("contracts.service"),
    };
  }

  setIsLoading(isLoading) {
    this.setState({
      isLoading,
    })
  }

  setContracts(data) {
    this.setState({
      ...data,
    })
  }

  async fetchData() {
    const { contractService } = this.state;
    if (contractService) {
      this.setIsLoading(true);
      const contracts = await contractService.findAll();
      console.log('fetchData', contracts);
      this.setContracts({
        contracts,
        contractsById: toContractsById(contracts),
        contractsOverlaps: toOverlappings(contracts),
      })
      this.setIsLoading(false);
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { t, classes } = this.props;
    const { contracts, filter, contractsOverlaps, isLoading, contractsById } = this.state;
    const filteredContracts = getFilteredContracts(filter, contracts, contractsOverlaps);

  return (
    <div>
      {/* <Breadcrumbs aria-label="breadcrumb">
        <Typography color="textPrimary">Contracts</Typography>
      </Breadcrumbs>
      <br /> */}
      {
        isLoading
        && <LoadingSpinner />
      }
      {/* <ContractFilters
        filter={filter}
        setFilter={(filter) => this.setState({filter})}
      /> */}
      {contracts && (
        <Box justifyContent="flex-end" display="flex" mb={2}>
          <Typography>
            {filteredContracts.length} matching filter out of {contracts.length}{" "}
            contracts, {Object.keys(contractsOverlaps).length} overlapping
            globaly.
          </Typography>
        </Box>
      )}
      {
        contracts
        && (
          <MUIDataTable
            title={"Contracts"}
            data={contracts}
            columns={contractsColumns(t)}
            options={contractsOptions(t, contracts, contractsById, contractsOverlaps, classes)}
          />
        )
      }
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
  };
};

ContractsPage.propTypes = {
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withNamespaces()( withStyles(styles)(ContractsPage));
