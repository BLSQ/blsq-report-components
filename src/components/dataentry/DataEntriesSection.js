import React from "react";
import PluginRegistry from "../core/PluginRegistry";
import OrgunitRelatedSection from "../shared/OrgunitRelatedSection";
import DataEntryLinks from "../shared/data_entries/DataEntryLinks";

const DataEntriesSection = ({ orgUnit, period, dataEntryCode, orgUnitSectionStyle }) => {
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");
  const config = PluginRegistry.extension("core.config");
  
  let dataEntries = [];
  if (orgUnit && orgUnit.activeContracts && orgUnit.activeContracts[0]) {
    const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(orgUnit.activeContracts[0], period);
    dataEntries = expectedDataEntries;
  }

  return (
    <OrgunitRelatedSection messageKey="dataEntry.dataEntries" orgUnitSectionStyle={orgUnitSectionStyle}>
      <div>
        {dataEntries && (
          <DataEntryLinks
            dataEntries={dataEntries}
            dataEntryCode={dataEntryCode || undefined}
            period={period}
            orgUnit={orgUnit}
            periodFormat={config.global.periodFormat}
          />
        )}
      </div>
    </OrgunitRelatedSection>
  );
};

export default DataEntriesSection;
