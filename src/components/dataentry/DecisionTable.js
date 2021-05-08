import PapaParse from "papaparse";
import _ from "lodash";

const ANY = "*";
const IN_HEADER_PREFIX = "in:";
const OUT_HEADERS_PREFIX = "out:";

class DecisionRule {
  constructor(csvLine, index) {
    this.csvLine = csvLine;
    this.index = index;
    this.inHeaders = Object.keys(this.csvLine).filter((header) => header.startsWith(IN_HEADER_PREFIX));
    this.outHeaders = Object.keys(this.csvLine).filter((header) => header.startsWith(OUT_HEADERS_PREFIX));

    const stars = this.inHeaders.filter((header) => this.csvLine[header] == ANY);

    this.specificScore = [this.inHeaders.length - stars.length, -1 * this.index];
  }

  match(facts) {
    const matched = this.inHeaders.every((inHeader) => {
      const normalizedHeader = inHeader.slice(IN_HEADER_PREFIX.length);
      const value = facts[normalizedHeader];
      const lineValue = this.csvLine[inHeader];
      const matches = value == lineValue || lineValue == ANY;
      return matches;
    });
    return matched
  }
  toOutputs() {
    const result = {};
    for (let outHeader of this.outHeaders) {
      result[outHeader.slice(OUT_HEADERS_PREFIX.length)] = this.csvLine[outHeader];
    }
    return result;
  }
}

class DecisionTable {
  constructor(raw) {
    this.startPeriod = raw.start_period;
    this.endPeriod = raw.end_period;
    this.inHeaders = raw.in_headers;
    this.outHeaders = raw.out_headers;
    const csv = PapaParse.parse(raw.content, { header: true });
    this.rows = csv.data;
    this.rules = this.rows.map((row, index) => new DecisionRule(row, index));
  }

  matchPeriod(period) {
    if (this.startPeriod == undefined && this.endPeriod == undefined) {
      return true;
    }

    return this.startPeriod <= period && period <= this.endPeriod;
  }

  matchingRule(facts) {
    let matchingRules = this.rules.filter((r) => r.match(facts));
    if (matchingRules.length == 0) {
      return undefined;
    }
    if (matchingRules.length > 1) {
      matchingRules = _.sortBy(matchingRules, (r) => r.specificScore);
    }
    const matchingRule = matchingRules[matchingRules.length - 1].toOutputs();
    //console.log("DecisionTable", facts, " => ", matchingRules, " ==> ", matchingRule);

    return matchingRule;
  }
}

export default DecisionTable;
