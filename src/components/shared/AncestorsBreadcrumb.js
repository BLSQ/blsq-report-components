import React from "react";
import { Link } from "react-router-dom";

const AncestorsBreadcrumbs = ({orgUnit, linkHead, linkEnd}) => {
  // link head
  // link end
  // <a href={"./index.html#/contracts?under_orgunit=" + a.id}>{a.name}</a>
  // <Link to={"/select/?q=&period=" + quarterPeriod + "&parent=" + ancestor.id}>{ancestor.name}</Link>

  return (
    <>
      {orgUnit &&
        orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
          return (
            <span key={"ancestor" + index}>
              <Link to={linkHead + ancestor.id + linkEnd}>{ancestor.name}</Link>
              {index < orgUnit.ancestors.length - 3 && "  >  "}
            </span>
          );
        })}
    </>
  );
};

export default AncestorsBreadcrumbs;
