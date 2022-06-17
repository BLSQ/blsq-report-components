import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import { Link } from "react-router-dom";
import ContractsSection from "../contracts/ContractsSection";
import DataEntriesSection from "../dataentry/DataEntriesSection";
import InvoiceLinksSection from "./InvoiceLinksSection";

const LocationBreadCrumb = ({ orgUnit, period }) => {
  return (
    <div style={{ fontFamily: "monospace", marginLeft: "20px" }}>
      {orgUnit &&
        orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
          return (
            <span key={"ancestor" + index}>
              <Link to={"/select/?q=&period=" + period + "&ou=" + ancestor.id + "&mode=tree"}>{ancestor.name}</Link>
              {index < orgUnit.ancestors.length - 3 && "  >  "}
            </span>
          );
        })}
    </div>
  );
};

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, classes, onPeriodChange, periodFormat }) => {
  const queryParams = anchorQueryParams();
  // const ou = queryParams.get("ou");
  const ou = {
    "name": "bu Bas Uele DPS",
    "id": "rWrCdr321Qu",
    "children": [
        {
            "name": "bu Ganga Zone de Santé",
            "id": "C2yvpeOlAue",
            "children": [
                {
                    "id": "mb8GSxakxA2"
                },
                {
                    "id": "PmQL4SeDB6D"
                },
                {
                    "id": "mAE5GGXZ1v4"
                },
                {
                    "id": "SrTMJlpfxPi"
                },
                {
                    "id": "ebVLzCmZe9U"
                },
                {
                    "id": "MTQqtvQWI67"
                },
                {
                    "id": "DTca5oMrZ7K"
                },
                {
                    "id": "qXfgPrWWVGB"
                },
                {
                    "id": "ExBABqlyXqN"
                },
                {
                    "id": "zSHo0zGz0Y5"
                },
                {
                    "id": "fr38UJWCS21"
                },
                {
                    "id": "xXu4T1SV9ae"
                },
                {
                    "id": "Kuj0idLQHDn"
                },
                {
                    "id": "aScUWDteVTz"
                },
                {
                    "id": "Pq9JDrVjNpA"
                },
                {
                    "id": "v7nT6nMD5lc"
                },
                {
                    "id": "N6MW0JiEZAW"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Poko Zone de Santé",
            "id": "RGODwLmODlf",
            "children": [
                {
                    "id": "ELZk4IuxhtZ"
                },
                {
                    "id": "OblAWcqMi2A"
                },
                {
                    "id": "lKt31FEDsz5"
                },
                {
                    "id": "G6r41YumgKb"
                },
                {
                    "id": "KzhLBDitm3C"
                },
                {
                    "id": "DGiZ6IocedZ"
                },
                {
                    "id": "QTedVrMeLxo"
                },
                {
                    "id": "zVWAprHD0dh"
                },
                {
                    "id": "nJys5XuVeLV"
                },
                {
                    "id": "U8m4YlvRwRE"
                },
                {
                    "id": "En8bzjDRHia"
                },
                {
                    "id": "Kaq7qng7HMj"
                },
                {
                    "id": "tEwyMbJ0GFP"
                },
                {
                    "id": "CL2yswTqOW7"
                },
                {
                    "id": "uRpIEI42mMZ"
                },
                {
                    "id": "Mw6rsOUptp2"
                },
                {
                    "id": "zoauaKitcvr"
                },
                {
                    "id": "yCIuytRbCQC"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Viadana Zone de Santé",
            "id": "aUkcT7hFIgU",
            "children": [
                {
                    "id": "Si0KpfNPePg"
                },
                {
                    "id": "LvaY2QZvKo7"
                },
                {
                    "id": "CwQGRfqcXYT"
                },
                {
                    "id": "TRIsG773bii"
                },
                {
                    "id": "SLa9K8ituvc"
                },
                {
                    "id": "kJNXL54oJHn"
                },
                {
                    "id": "S6US16c0QvO"
                },
                {
                    "id": "d6TLCnJXGIr"
                },
                {
                    "id": "iQnZfStmkCX"
                },
                {
                    "id": "utPBNENDJOO"
                },
                {
                    "id": "jkrdIWqqA64"
                },
                {
                    "id": "HnKDtS2Lmmi"
                },
                {
                    "id": "ZXgmjj98sR7"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Monga Zone de Santé",
            "id": "pMrfFaKk3yp",
            "children": [
                {
                    "id": "Uuwo9amxIHt"
                },
                {
                    "id": "kQ203t2V4H4"
                },
                {
                    "id": "CQOaMQiScJf"
                },
                {
                    "id": "Dm3PJBgRVAU"
                },
                {
                    "id": "SoymXbxU3nG"
                },
                {
                    "id": "oCX50lzv3hg"
                },
                {
                    "id": "Ipdr2cczuPl"
                },
                {
                    "id": "rrsNjqU2pdS"
                },
                {
                    "id": "ruKgNYUhm6R"
                },
                {
                    "id": "ZXWPG1M1cQW"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Buta Zone de Santé",
            "id": "uXYavdjVi2G",
            "children": [
                {
                    "id": "CcSEaVKbTMf"
                },
                {
                    "id": "EuG9OxMvBYb"
                },
                {
                    "id": "AijiF45XPBj"
                },
                {
                    "id": "iPIA0XsObtz"
                },
                {
                    "id": "Qe8dn1COiqb"
                },
                {
                    "id": "q9Z58EwANdQ"
                },
                {
                    "id": "YFE6KCniuW4"
                },
                {
                    "id": "CEKJTeDVOKT"
                },
                {
                    "id": "GvjnNnx5I8T"
                },
                {
                    "id": "MIwzL67m8mI"
                },
                {
                    "id": "LQUtxA6eB96"
                },
                {
                    "id": "UwAmCtcg6pv"
                },
                {
                    "id": "aDZYDp6u5je"
                },
                {
                    "id": "gEHSVwyFhWa"
                },
                {
                    "id": "ZuRG5IO5iwU"
                },
                {
                    "id": "DpKZVJFbkgh"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Aketi Zone de Santé",
            "id": "gjyO7pgLjyk",
            "children": [
                {
                    "id": "QAEKX98nmri"
                },
                {
                    "id": "JOCatpaWvYU"
                },
                {
                    "id": "C2WCaMjzQUJ"
                },
                {
                    "id": "IxF8bgmIJ1c"
                },
                {
                    "id": "eqyNuCwObHc"
                },
                {
                    "id": "S6flGA0GGCH"
                },
                {
                    "id": "LjJbZenjWRV"
                },
                {
                    "id": "RAIEYko0wzY"
                },
                {
                    "id": "I7DlAlutkW7"
                },
                {
                    "id": "C0tnhYmRpHv"
                },
                {
                    "id": "iLIu0wsDtEp"
                },
                {
                    "id": "xHUtSvQPsen"
                },
                {
                    "id": "Pww7wcs85ux"
                },
                {
                    "id": "GZP29KfCDnB"
                },
                {
                    "id": "caeFvfFuM8S"
                },
                {
                    "id": "pCfpKXoGBF8"
                },
                {
                    "id": "u3ShgO0ra3u"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Likati Zone de Santé",
            "id": "uL5UB0huzD7",
            "children": [
                {
                    "id": "WWG1jeSDfme"
                },
                {
                    "id": "vaCUHM0MTzl"
                },
                {
                    "id": "TXdlYnJclW5"
                },
                {
                    "id": "AfXWa7aIj3p"
                },
                {
                    "id": "BroODngoa14"
                },
                {
                    "id": "U7afSVbw7pT"
                },
                {
                    "id": "gSXTXfH3JGK"
                },
                {
                    "id": "blODjMDq64N"
                },
                {
                    "id": "jv62cMVVgrM"
                },
                {
                    "id": "lXKvm3ipBN1"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Ango Zone de Santé",
            "id": "VtuoUiUgwSz",
            "children": [
                {
                    "id": "l8jztHpvwX7"
                },
                {
                    "id": "YQzmc3EVElV"
                },
                {
                    "id": "ZhdDD8TH8oH"
                },
                {
                    "id": "ZnJnw2pZ4oM"
                },
                {
                    "id": "JzllAJFi4Dq"
                },
                {
                    "id": "t89zd8Oq91N"
                },
                {
                    "id": "TYKwhufm9rp"
                },
                {
                    "id": "ZP9qxPbvhiI"
                },
                {
                    "id": "ocsmvPBxfv6"
                },
                {
                    "id": "RTZC5jhk4yE"
                },
                {
                    "id": "U2mnlRsKWZo"
                },
                {
                    "id": "qbEd1COmN8W"
                },
                {
                    "id": "jADqRUN5PGt"
                },
                {
                    "id": "GqHsYDhHCDM"
                },
                {
                    "id": "NSIfV0jUkBM"
                },
                {
                    "id": "cm6JOZMtD5G"
                },
                {
                    "id": "n6GUa4jPasW"
                },
                {
                    "id": "nTc1gY6C9UC"
                },
                {
                    "id": "ApNtH5ZDNIT"
                },
                {
                    "id": "Vhj83FOXMaZ"
                },
                {
                    "id": "VJH6voJICqz"
                },
                {
                    "id": "UoBe9ETtYMa"
                },
                {
                    "id": "zEOSwW0J7TV"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Bili Zone de Santé",
            "id": "zT6cLwtGLuv",
            "children": [
                {
                    "id": "YZiQ5bfxIAe"
                },
                {
                    "id": "tPOzqTjMpwG"
                },
                {
                    "id": "T1f9d7EIxRG"
                },
                {
                    "id": "ivCmDHOnJWp"
                },
                {
                    "id": "JxSjeGqjnYs"
                },
                {
                    "id": "NhXIo3Wnwao"
                },
                {
                    "id": "EFLVlvRQ27J"
                },
                {
                    "id": "sp58j5YBfuK"
                },
                {
                    "id": "wdj60PqsokN"
                },
                {
                    "id": "Sn7TEcGmH2A"
                },
                {
                    "id": "CWWsfzCK2OY"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Bondo Zone de Santé",
            "id": "wQ6ec9O8n2D",
            "children": [
                {
                    "id": "ejB70yjXmST"
                },
                {
                    "id": "H9d4yw8Z3oS"
                },
                {
                    "id": "BVFzLou3fhv"
                },
                {
                    "id": "sOO0qB1R4pR"
                },
                {
                    "id": "MNU7hH6EHd7"
                },
                {
                    "id": "ZmPrsrNkKia"
                },
                {
                    "id": "EEvm5lp9vQi"
                },
                {
                    "id": "imGNRBiGBAA"
                },
                {
                    "id": "glTlFCCxjsi"
                },
                {
                    "id": "eNilo3FDO6W"
                },
                {
                    "id": "JZqIqfDRTFH"
                },
                {
                    "id": "QnyhovEJami"
                },
                {
                    "id": "OvZFs5IobKq"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        },
        {
            "name": "bu Titule Zone de Santé",
            "id": "Qwh3w16VpUj",
            "children": [
                {
                    "id": "dcxGEiG6LX1"
                },
                {
                    "id": "KNpepMf3WKx"
                },
                {
                    "id": "rPDvZv5GXL6"
                },
                {
                    "id": "rLjX1yx1PzR"
                },
                {
                    "id": "WRpbruHON2h"
                },
                {
                    "id": "W6iHRiRggZf"
                },
                {
                    "id": "Jt8hCMz9sWq"
                },
                {
                    "id": "YafoHGFoECv"
                },
                {
                    "id": "V2LHJ5U9vG9"
                },
                {
                    "id": "lJsWeyrYMYc"
                },
                {
                    "id": "clhofR2snkq"
                }
            ],
            "ancestors": [
                {
                    "name": "République Démocratique du Congo",
                    "id": "pL5A7C1at1M"
                },
                {
                    "name": "bu Bas Uele DPS",
                    "id": "rWrCdr321Qu"
                }
            ]
        }
    ],
    "ancestors": [
        {
            "name": "République Démocratique du Congo",
            "id": "pL5A7C1at1M"
        }
    ],
    "has_children": true,
    "activeContracts": [
        {
            "fieldValues": {
                "id": "kSr5lgIm42C",
                "contract_start_date": "2019-06-30T22:00:00.000Z",
                "contract_end_date": "2024-09-30T21:59:59.999Z",
                "contract_type": "PCA",
                "orgUnit": {
                    "id": "rWrCdr321Qu",
                    "name": "bu Bas Uele DPS",
                    "path": "/pL5A7C1at1M/rWrCdr321Qu",
                    "ancestors": [
                        {
                            "id": "pL5A7C1at1M",
                            "name": "République Démocratique du Congo"
                        },
                        {
                            "id": "rWrCdr321Qu",
                            "name": "bu Bas Uele DPS"
                        }
                    ],
                    "codes": [
                        "PCA"
                    ]
                }
            },
            "id": "kSr5lgIm42C",
            "orgUnit": {
                "id": "rWrCdr321Qu",
                "name": "bu Bas Uele DPS",
                "path": "/pL5A7C1at1M/rWrCdr321Qu",
                "ancestors": [
                    {
                        "id": "pL5A7C1at1M",
                        "name": "République Démocratique du Congo"
                    },
                    {
                        "id": "rWrCdr321Qu",
                        "name": "bu Bas Uele DPS"
                    }
                ],
                "codes": [
                    "PCA"
                ]
            },
            "startPeriod": "201906",
            "endPeriod": "202409",
            "codes": [
                "PCA"
            ]
        }
    ]
}
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);

  const onOrgUnitChange = (orgunits) => {
    if (orgunits.length) {
      const queryParams = anchorQueryParams();
      queryParams.set("ou", orgunits[0].id);
      const newUrl = urlWith(queryParams);
      window.history.replaceState({}, "", newUrl);
      setSelectedOrgUnits(orgunits);
    }
  };

  return (
    <>
      <FormControl className={classes.periodContainer}>
        <PeriodPicker period={searchPeriod} onPeriodChange={onPeriodChange} periodFormat={periodFormat} />
      </FormControl>
      <br />
      <br />
      <div style={{ display: "flex" }}>
        <div style={{ margin: "10px", width: "500px" }}>
          <OrgUnitTreePicker onChange={onOrgUnitChange} initialSelection={ou} period={searchPeriod} />
        </div>
        {selectedOrgUnits && selectedOrgUnits.length > 0 && (
          <div>
            <h2>{selectedOrgUnits[0].name}</h2>
            <LocationBreadCrumb orgUnit={selectedOrgUnits[0]} period={searchPeriod} />
            <ContractsSection
              orgUnit={selectedOrgUnits[0]}
              orgUnitSectionStyle={{
                marginLeft: "20px",
                marginTop: "-10px",
              }}
            />
            <InvoiceLinksSection
              orgUnit={selectedOrgUnits[0]}
              period={searchPeriod}
              invoiceLinksProps={invoiceLinksProps}
              orgUnitSectionStyle={{
                marginLeft: "20px",
                marginTop: "-10px",
              }}
            />
            <DataEntriesSection
              orgUnit={selectedOrgUnits[0]}
              period={searchPeriod}             
              orgUnitSectionStyle={{
                marginLeft: "20px",
                marginTop: "-10px",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default InvoiceTreeView;
