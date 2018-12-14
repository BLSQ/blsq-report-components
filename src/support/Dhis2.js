import { init, getInstance, getManifest } from "d2/lib/d2";
import DatePeriods from "./DatePeriods";

const API_URL = process.env.REACT_APP_DHIS2_URL;
const CONTRACT_OU_GROUP = process.env.REACT_APP_CONTRACT_OU_GROUP;

const ORGUNIT_FIELDS =
  "[id,name,ancestors[id,name],organisationUnitGroups[id,name,code]]";

class Dhis2 {
  /**
   * @param url API endpoint url
   * @param auth Authentication HTTP header content
   */
  constructor(url) {
    this.url = url;
    this.cache = [];
    this.userId = "";
    this.baseUrl = "..";
    this.ignoredStores = [""];
    this.version = "";
  }

  /**
   * Initialized the Api to a d2 instance.
   * @returns {Api}
   */
  initialize() {
    let headers =
      process.env.NODE_ENV === "development"
        ? {
            Authorization:
              "Basic " +
              btoa(
                process.env.REACT_APP_USER +
                  ":" +
                  process.env.REACT_APP_PASSWORD
              )
          }
        : null;
    const mydhis2 = this;
    this.d2 = getManifest("./manifest.webapp")
      .then(manifest => {
        let baseUrl =
          process.env.NODE_ENV === "production"
            ? manifest.getBaseUrl()
            : this.url;
        baseUrl = baseUrl.replace("http://", "https://");
        console.info("Using URL: " + baseUrl);
        console.info(`Loading: ${manifest.name} ${manifest.version}`);
        console.info(`Built ${manifest.manifest_generated_at}`);
        mydhis2.version = manifest.version;
        console.log("mydhis2.version " + mydhis2.version);
        this.baseUrl = baseUrl;
        return baseUrl + "/api";
      })
      .catch(e => {
        return this.url;
      })
      .then(baseUrl =>
        init({ baseUrl, headers }).then(d2 => {
          this.user = d2.currentUser;
          this.userId = d2.currentUser.id;
        })
      );
    return this;
  }

  appVersion() {
    return getManifest("./manifest.webapp").then(manifest => {
      return manifest.version;
    });
  }
  currentUser() {
    return getInstance().then(d2 => d2.currentUser);
  }

  systemInfoRaw() {
    return getInstance().then(d2 => d2.system.systemInfo);
  }

  currentUserRaw() {
    return getInstance().then(d2 =>
      d2.Api.getApi().get(
        "/me?fields=:all,organisationUnits" +
          ORGUNIT_FIELDS +
          ",dataViewOrganisationUnits" +
          ORGUNIT_FIELDS
      )
    );
  }

  setDataValue(value) {
    const url =
      "/dataValues?" +
      "de=" +
      value.de +
      "&co=" +
      value.co +
      "&ds=" +
      value.ds +
      "&ou=" +
      value.ou +
      "&pe=" +
      value.pe +
      "&value=" +
      value.value;
    return getInstance().then(d2 => d2.Api.getApi().post(url));
  }

  getDefaultCategoryCombo() {
    var categoryUrl =
      "categoryCombos?filter=name:eq:default&fields=id,name,categoryOptionCombos[id,name]";
    return getInstance().then(d2 => d2.Api.getApi().get(categoryUrl));
  }

  getDataSet(dataSetId) {
    var dataSetUrl =
      "/dataSets/" +
      dataSetId +
      "?fields=:all,organisationUnits[id,path,name,ancestors[id,name],organisationUnitGroups[id,name]],dataSetElements[categoryCombo[id,name,categoryOptionCombos[id,name]],dataElement[id,name,code,shortName,valueType]]";
    return getInstance().then(d2 => d2.Api.getApi().get(dataSetUrl));
  }

  getDataElementGroup(dataElementGroupId) {
    var dataElementGroupUrl =
      "/dataElementGroups/" +
      dataElementGroupId +
      "?fields=:all,dataElements[id,name,shortName]";
    return getInstance().then(d2 => d2.Api.getApi().get(dataElementGroupUrl));
  }

  allowedSeeOrgunits(user, dataSet) {
    const userOrgUnitIds = user.dataViewOrganisationUnits.map(ou => ou.id);
    const allowedOrgunitIds = dataSet.organisationUnits.filter(ou =>
      userOrgUnitIds.some(id => ou.path.includes(id))
    );
    return allowedOrgunitIds;
  }

  allowedEditOrgunitIds(user, dataSet) {
    const userOrgUnitIds = user.organisationUnits.map(ou => ou.id);
    const allowedOrgunitIds = dataSet.organisationUnits.filter(ou =>
      userOrgUnitIds.some(id => ou.path.includes(id))
    );
    return allowedOrgunitIds;
  }

  getValues(user, dataSet, periods) {
    const allowedOrgunitIds = this.allowedSeeOrgunits(user, dataSet);

    if (allowedOrgunitIds.length === 0) {
      throw new Error(
        "sorry you are not allowed to see values from at least one of the following organisation units : " +
          dataSet.organisationUnits.map(ou => ou.name).join(" , ")
      );
    }
    const allowedOrgunitQuery = allowedOrgunitIds
      .map(ou => "&orgUnit=" + ou.id)
      .join("");
    var dataSetUrl =
      "/dataValueSets?dataSet=" +
      dataSet.id +
      periods.map(pe => "&period=" + pe).join("") +
      allowedOrgunitQuery;
    return getInstance().then(d2 => d2.Api.getApi().get(dataSetUrl));
  }

  getDataElementGroupValues(orgUnitId, dataElementGroupId, periods) {
    var dataValueSetsUrl =
      "/dataValueSets?dataElementGroup=" +
      dataElementGroupId +
      periods.map(pe => "&period=" + pe).join("") +
      "&orgUnit=" +
      orgUnitId +
      "&children=true";
    return getInstance().then(d2 => d2.Api.getApi().get(dataValueSetsUrl));
  }

  getOrgunit(orgunitid) {
    var getOuUrl =
      "organisationUnits/" +
      orgunitid +
      "?fields=[*],ancestors[id,name],organisationUnitGroups[id,name,code]";
    return getInstance().then(d2 => d2.Api.getApi().get(getOuUrl));
  }

  getOrgunitByUser(orgunitid, userId) {
    var getOuUrl =
      "organisationUnits/" +
      orgunitid +
      "?fields=[*],ancestors[id,name],organisationUnitGroups[id,name]&filter=user.id:eq:" +
      userId +
      "";
    return getInstance().then(d2 => d2.Api.getApi().get(getOuUrl));
  }

  getOrgunitsForContract(orgUnitId, contractGroupSetId) {
    var getOuUrl =
      "organisationUnitGroupSets/" +
      contractGroupSetId +
      "?fields=[*],organisationUnitGroups[:all,organisationUnits[id,name,ancestors[id,name],organisationUnitGroups[id,name,code]]";
    return getInstance()
      .then(d2 => d2.Api.getApi().get(getOuUrl))
      .then(response => {
        const contractGroup = response.organisationUnitGroups.find(
          orgUnitgroup =>
            orgUnitgroup.organisationUnits.some(ou => ou.id === orgUnitId)
        );
        return contractGroup.organisationUnits;
      });
  }

  getOrgunitsByAncestor(ancestorId, level) {
    const Url =
      "organisationUnits?fields=[*],ancestors[id,name],organisationUnitGroups[id,name,code]" +
      "&pageSize=500" +
      "&filter=level:eq:" +
      level +
      "&filter=ancestors.id:eq:" +
      ancestorId +
      "&filter=organisationUnitGroups.id:eq:" +
      CONTRACT_OU_GROUP;
    return getInstance().then(d2 => d2.Api.getApi().get(Url));
  }

  getOrgunitsForGroup(ancestorId, groupId) {
    const url =
      "organisationUnits?fields=id,name,ancestors[id,name],organisationUnitGroups[id,name,code]" +
      "&pageSize=500" +
      "&filter=organisationUnitGroups.id:eq:" +
      groupId +
      "&filter=ancestors.id:eq:" +
      ancestorId;
    return getInstance().then(d2 => d2.Api.getApi().get(url));
  }

  searchOrgunits(name, orgunits, contractGroup) {
    var searchOuUrl =
      "organisationUnits?fields=[*],ancestors[id,name],organisationUnitGroups[id,name,code]" +
      "&pageSize=50" +
      "&filter=name:ilike:" +
      name;
    if (contractGroup) {
      searchOuUrl += "&filter=organisationUnitGroups.id:eq:" + contractGroup;
    }
    if (orgunits && orgunits.length === 1) {
      searchOuUrl += "&filter=path:like:" + orgunits[0].id;
    } else if (orgunits && orgunits.length > 0) {
      searchOuUrl +=
        "&filter=ancestors.id:in:[" + orgunits.map(ou => ou.id).join(",") + "]";
    }
    return getInstance().then(d2 => d2.Api.getApi().get(searchOuUrl));
  }

  getAllDataElements(userIds) {
    var dataElementsUrl =
      "/dataElements.json?fields=id,name,valueType,domainType,user[id,name]&paging=false&filter=user.id:in:[" +
      userIds.join(",") +
      "]";

    return getInstance().then(d2 => d2.Api.getApi().get(dataElementsUrl));
  }

  getDataElementNames(dataElementGroup) {
    var dataElementsUrl =
      "dataElementGroups/" +
      dataElementGroup +
      ".json?fields=dataElements[id,name]";

    return getInstance().then(d2 => d2.Api.getApi().get(dataElementsUrl));
  }

  getDataElementNamesByGroups(dataElementGroupIds) {
    var dataElementsUrl =
      "dataElements.json?pageSize=1000&filter=dataElementGroups.id:in:[" +
      dataElementGroupIds.join(",") +
      "]";

    return getInstance().then(d2 => d2.Api.getApi().get(dataElementsUrl));
  }

  getDataElementNamesByDataSets(dataSetIds) {
    var dataElementsUrl =
      "dataElements.json?pageSize=1000&filter=dataSetElements.dataSet.id:in:[" +
      dataSetIds.join(",") +
      "]";

    return getInstance().then(d2 => d2.Api.getApi().get(dataElementsUrl));
  }

  buildInvoiceRequest(orgUnits, period, invoiceType, orgUnitId) {
    const year = period.slice(0, 4);
    const quarter = DatePeriods.split(period, "quarterly")[0].slice(5, 6);

    return {
      orgUnit: orgUnits.filter(orgUnit => orgUnit.id === orgUnitId)[0],
      orgUnits: orgUnits,
      period: period,
      quarterPeriod: period,
      quarterPeriods: DatePeriods.split(period, invoiceType.frequency),
      monthlyPeriods: DatePeriods.split(period, "monthly"),
      year: year,
      quarter: quarter,
      invoiceType: invoiceType
    };
  }

  getOrgUnitsUnder(under) {
    const url =
      "organisationUnits?fields=id,name,ancestors[id,name],organisationUnitGroups[id,name,code]" +
      "&paging=false" +
      "&filter=path:ilike:" +
      under;
    return getInstance().then(d2 => d2.Api.getApi().get(url));
  }

  getInvoiceValues(request) {
    let orgUnits = [request.orgUnit];
    if (request.orgUnits) {
      orgUnits = request.orgUnits;
    }

    const orgUnitsQuery = orgUnits
      .map(orgUnit => "orgUnit=" + orgUnit.id)
      .join("&");
    const degQuery = request.invoiceType.dataElementGroups
      .map(deg => "dataElementGroup=" + deg)
      .join("&");
    const dsQuery = request.invoiceType.dataSets
      .map(ds => "dataSet=" + ds)
      .join("&");
    const periods = [request.year]
      .concat(request.monthlyPeriods)
      .concat(request.quarterPeriods);
    const periodsQuery = periods.map(p => "&period=" + p).join("");

    const dataValuesUrl =
      "dataValueSets?" +
      orgUnitsQuery +
      "&" +
      degQuery +
      "&" +
      dsQuery +
      periodsQuery;

    return getInstance().then(d2 => d2.Api.getApi().get(dataValuesUrl));
  }

  /**
   * Make sure the response status code is 2xx
   * @param response
   */
  successOnly(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }
}

export default (() => new Dhis2(API_URL).initialize())();