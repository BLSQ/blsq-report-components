const ORBF2_URL = process.env.REACT_APP_ORBF2_URL;
const ORBF2_TOKEN = process.env.REACT_APP_ORBF2_TOKEN;

class Orbf2 {
  constructor(config) {
    this.url = ORBF2_URL || config.url || "https://orbf2.bluesquare.org/";
    this.token = ORBF2_TOKEN || config.token;
    this.config = config;
  }

  headers() {
    return {
      "content-type": "application/json",
      "X-token": this.token,
    };
  }
  calculate(request) {
    const url = `${this.url}/api/invoices`;
    const body = JSON.stringify({
      pe: request.period,
      ou: request.orgUnitId,
      dhis2UserId: request.currentUserId,
    });
    return fetch(url, {
      headers: this.headers(),
      method: "post",
      body: body,
    }).then(this.handleResponse);
  }

  invoicingJobs(calculations, currentUserId) {
    const url = `${this.url}/api/invoicing_jobs`;
    const body = JSON.stringify({
      period: calculations[0].period,
      orgUnitIds: calculations.map((c) => c.orgUnitId).join(","),
      dhis2UserId: currentUserId,
    });

    return fetch(url, {
      headers: this.headers(),
      method: "post",
      body: body,
    }).then(this.handleResponse);
  }

  handleResponse(response) {
    return response.json().then((json) => {
      if (response.ok) {
        return json;
      } else {
        return Promise.reject(json);
      }
    });
  }
}

export default Orbf2;
