import InvoiceSelectionContainer from "./components/invoices/InvoiceSelectionContainer";
import PeriodPicker from "./components/shared/PeriodPicker";
import Values from "./components/invoices/support/Values";
import IndicatorEvaluator from "./components/shared/IndicatorEvaluator";

import GenericInvoices from "./components/generic_invoice/GenericInvoices";
import CompositeInvoices from "./components/generic_invoice/CompositeInvoices";

import Dhis2 from "./support/Dhis2";
import Orbf2 from "./support/Orbf2";
import DatePeriods from "./support/DatePeriods";
import * as NumberFormatter from "./support/NumberFormatter";

import Cell from "./components/shared/Cell";
import Warning from "./components/shared/Warning";
import AppDrawer from "./components/App";
import PluginRegistry from "./components/core/PluginRegistry";
import ExtensionsComponent from "./components/core/ExtensionsComponent";
import ContractService from "./components/contracts/ContractService";

import ContractPlugin from "./components/contracts/ContractPlugin";
import InvoicePlugin from "./components/invoices/InvoicePlugin";
import IncentivePlugin from "./components/incentives/IncentivePlugin";
import BrowseDataPlugin from "./components/browsedata/BrowseDataPlugin";
import PyramidPlugin from "./components/pyramid/PyramidPlugin";
import DataEntryPlugin from "./components/dataentry/DataEntryPlugin";

import { indexBy } from "./support/Arrays";
import configureI18N from "./support/configureI18N";
import Dhis2Formula from "./components/dataentry/Dhis2Formula";
import Dhis2Input from "./components/dataentry/Dhis2Input";
import CompleteDataSetButton from "./components/dataentry/CompleteDataSetButton";
import { generateCalculator } from "./components/dataentry/CalculatorFactory";
import HesabuFormula from "./components/dataentry/HesabuFormula";
import EditIasoFormButton from "./components/dataentry/EditIasoFormButton";
import { toOrgUnitFacts } from "./components/dataentry/CodeGenerator";
import DecisionTable from "./components/dataentry/DecisionTable";
import { getVisibleAndOrderedActivities } from "./components/dataentry/getVisibleAndOrderedActivities"

import HesabuIcon from "./components/shared/icons/HesabuIcon";
import IasoIcon from "./components/shared/icons/IasoIcon";
import Orbf2Icon from "./components/shared/icons/Orbf2Icon";

const App = AppDrawer;

export {
  AppDrawer,
  App,
  InvoiceSelectionContainer,
  Dhis2,
  Orbf2,
  Values,
  IndicatorEvaluator,
  DatePeriods,
  PeriodPicker,
  indexBy,
  NumberFormatter,
  Cell,
  Warning,
  GenericInvoices,
  CompositeInvoices,
  configureI18N,
  PluginRegistry,
  ExtensionsComponent,
  ContractService,
  // plugins
  ContractPlugin,
  InvoicePlugin,
  IncentivePlugin,
  BrowseDataPlugin,
  PyramidPlugin,
  DataEntryPlugin,
  Dhis2Formula,
  Dhis2Input,
  CompleteDataSetButton,
  generateCalculator,
  HesabuFormula,
  EditIasoFormButton,
  DecisionTable,
  toOrgUnitFacts,
  getVisibleAndOrderedActivities,
  // icons
  HesabuIcon,
  IasoIcon,
  Orbf2Icon,
};
