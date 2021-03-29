import React from "react";
import DatePeriods from "../../support/DatePeriods";

import { BarChart, Bar, Brush, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function getColor(value) {
  var hue = (value * 120).toString(10);
  return ["hsl(100," + hue + "%," + (90 - value * 10).toString(10) + "%)"].join("");
}

const ContractsPeriodStats = ({ filteredContracts }) => {
  const minYear = Math.max(
    Math.min(...filteredContracts.filter((c) => c.startPeriod).map((c) => parseInt(c.startPeriod.slice(0, 4)))),
    2000,
  );

  const maxYear = Math.min(
    Math.max(...filteredContracts.filter((c) => c.endPeriod).map((c) => parseInt(c.endPeriod.slice(0, 4)))),
    2050,
  );

  const years = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(year);
  }

  const data = [];
  years.map((year) => {
    DatePeriods.split("" + year, "monthly").map((monthPeriod) => {
      const contractsForPeriod = filteredContracts.filter((contract) => contract.matchPeriod(monthPeriod)).length;
      data.push({ period: monthPeriod, contracted: contractsForPeriod });
    });
  });

  return (
    <div>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
        <ReferenceLine y={0} stroke="#000" />
        <Brush dataKey="period" height={30} stroke="#8884d8" />
        <Bar dataKey="contracted" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default ContractsPeriodStats;
