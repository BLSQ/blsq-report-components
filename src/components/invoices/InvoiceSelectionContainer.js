import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";
import Paper from "@material-ui/core/Paper";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import OrgUnitAutoComplete from "./OrgUnitAutoComplete";
import PeriodPicker from "./PeriodPicker";
import OuPicker from "./OuPicker";
import SelectionResultsContainer from "./SelectionResultsContainer";

import debounce from "lodash/debounce";

const styles = theme => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    minHeight: "600px"
  }),
  table: {
    minWidth: "100%"
  },
  filters: {
    marginLeft: "30px"
  }
});

class InvoiceSelectionContainer extends Component {
  static defaultProps = {
    periodFormat: {
      quarterly: "quarter",
      monthly: "yearMonth"
    }
  };

  constructor(props) {
    super(props);
    this.searchOrgunit = debounce(this.searchOrgunit.bind(this), 1500);
    this.onOuSearchChange = this.onOuSearchChange.bind(this);
    this.onPeriodChange = this.onPeriodChange.bind(this);
    this.synchronizeUrl = debounce(this.synchronizeUrl.bind(this), 200);
    this.onParentOrganisationUnit = this.onParentOrganisationUnit.bind(this);
    this.state = { loading: false };
  }

  componentDidMount() {
    this.searchOrgunit();
  }

  onOuSearchChange(event) {
    let ouSearchValue = event.target.value;
    this.synchronizeHistory(
      this.props.parent,
      ouSearchValue,
      this.props.period
    );
  }

  synchronizeUrl() {
    this.setState({ loading: true });
    synchronizeHistory(
      this.props.parent,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  synchronizeHistory(parent, ouSearchValue, period) {
    if (!ouSearchValue) {
      ouSearchValue = "";
    }
    const parentParam = parent ? "&parent=" + parent : "";
    this.props.history.replace({
      pathname: "/select",
      search: "?q=" + ouSearchValue + "&period=" + period + parentParam
    });
  }

  onParentOrganisationUnit(orgUnit) {
    this.synchronizeHistory(
      orgUnit,
      this.props.ouSearchValue,
      this.props.period
    );
  }

  onPeriodChange(period) {
    this.synchronizeHistory(
      this.props.parent,
      this.props.ouSearchValue,
      period
    );
  }

  async searchOrgunit() {
    let searchvalue = this.props.ouSearchValue
      ? this.props.ouSearchValue.trim()
      : "";
    if (this.props.currentUser) {
      this.setState({ loading: true });
      const user = this.props.currentUser;
      const orgUnitsResp = await this.props.dhis2.searchOrgunits(
        searchvalue,
        user.dataViewOrganisationUnits,
        this.props.contractedOrgUnitGroupId,
        this.props.parent
      );
      let categoryList = [];
      if (this.props.dhis2.categoryComboId) {
        categoryList = await this.searchCategoryCombo(searchvalue);
        categoryList.forEach(cl =>
          orgUnitsResp.organisationUnits.push({
            id: cl.id,
            shortName: cl.shortName,
            name: cl.name,
            ancestors: [],
            level: cl.level,
            organisationUnitGroups: cl.organisationUnitGroups
          })
        );
      }
      this.setState({
        orgUnits: orgUnitsResp.organisationUnits,
        loading: false
      });
    }
  }

  async searchCategoryCombo(searchvalue) {
    const categoryCombos = await this.props.dhis2.getCategoryComboById();
    let optionsCombos = categoryCombos.categoryOptionCombos.filter(
      cc => cc.name.toLowerCase().indexOf(searchvalue.toLowerCase()) > -1
    );
    return optionsCombos.map(option => {
      return {
        id: option.id,
        shortName: option.shortName,
        name: option.name,
        ancestors: [],
        level: 0,
        organisationUnitGroups: [
          { name: "", id: this.props.contractedOrgUnitGroupId }
        ]
      };
    });
  }

  componentWillReceiveProps(nextProps) {
    const dirty =
      nextProps.ouSearchValue !== this.props.ouSearchValue ||
      nextProps.parent != this.props.parent;
    this.props = nextProps;

    const user = this.props.currentUser;
    if (user && dirty) {
      this.searchOrgunit();
    }
  }

  render() {
    const { classes, t } = this.props;
    const SelectionResults =
      this.props.resultsElements || SelectionResultsContainer;
    return (
      <Paper className={classes.paper} square>
        <Typography variant="h5" component="h5" gutterBottom>
          {t("report_and_invoices")}
        </Typography>
        <div className={classes.filters}>
          <OrgUnitAutoComplete
            organisationUnits={this.props.topLevelsOrgUnits}
            onChange={this.onParentOrganisationUnit}
            selected={this.props.parent}
          />
          <br />

          <OuPicker
            onOuSearchChange={this.onOuSearchChange}
            ouSearchValue={this.props.ouSearchValue}
          />

          <PeriodPicker
            period={this.props.period}
            onPeriodChange={this.onPeriodChange}
            periodFormat={this.props.periodFormat}
          />
          <br />
          {this.state.loading ? <LinearProgress variant="query" /> : ""}
        </div>
        <br />
        <br />
        <br />
        <SelectionResults {...this.props} orgUnits={this.state.orgUnits} />
      </Paper>
    );
  }
}

InvoiceSelectionContainer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(withNamespaces()(InvoiceSelectionContainer));
