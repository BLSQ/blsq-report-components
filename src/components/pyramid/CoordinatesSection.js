import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getInstance } from "d2/lib/d2";
import OrgunitRelatedSection from "../shared/OrgunitRelatedSection";
const Map = ({ orgUnit }) => {
  const detailsQuery = useQuery(["coordinates", orgUnit.id], async () => {
    const d2 = await getInstance();
    const api = await d2.Api.getApi();
    const orgUnitDetails = await api.get(
      "organisationUnits/" + orgUnit.id + "?fields=id,name,geometry,attributeValues[value,attribute[id,name]]",
    );

    const result = { orgUnitDetails };

    if (orgUnitDetails.geometry && orgUnitDetails.geometry.type === "Point") {
      result.mapEmbedUrl =
        "https://maps.google.com/maps?width=100%25&height=600&hl=en&q=" +
        orgUnitDetails.geometry.coordinates[1] +
        "," +
        orgUnitDetails.geometry.coordinates[0] +
        "+(" +
        encodeURIComponent(orgUnit.name) +
        ")&t=k&z=14&ie=UTF8&iwloc=B&output=embed";

      result.mapEmbedSrc =
        "https://maps.google.com/maps?q=" +
        orgUnitDetails.geometry.coordinates[1] +
        "," +
        orgUnitDetails.geometry.coordinates[0] +
        "&hl=es&z=14&output=embed";
    }

    const imgAttributeValue = orgUnitDetails.attributeValues.find((d) => d.attribute.name == "imgUrl");

    if (imgAttributeValue) {
      result.imgUrl = imgAttributeValue.value;
    }

    return result;
  });

  return (
    <>
      {detailsQuery.isFetching && "Fetching coordinates"}
      {detailsQuery.data && (detailsQuery.data.mapEmbedUrl || detailsQuery.data.imgUrl) && (
        <OrgunitRelatedSection messageKey="pyramid.signalitic">
          <div style={{ display: "flex", direction: "row", gap: "20px", flexWrap: "wrap" }}>
            {detailsQuery.data && detailsQuery.data.mapEmbedUrl && (
              <div style={{ width: "500px" }}>
                <iframe
                  width="100%"
                  height="300"
                  frameborder="0"
                  scrolling="no"
                  marginheight="0"
                  marginwidth="0"
                  src={detailsQuery.data.mapEmbedUrl}
                >
                  <a href={detailsQuery.data.mapEmbedSrc}>{orgUnit.name}</a>
                </iframe>
              </div>
            )}

            {detailsQuery.data && detailsQuery.data.imgUrl && (
              <a href={detailsQuery.data.imgUrl}>
                <img style={{ maxWidth: "500px" }} src={detailsQuery.data.imgUrl} />
              </a>
            )}
          </div>
        </OrgunitRelatedSection>
      )}
    </>
  );
};

export default Map;
