import _ from "lodash";

export function isBlank(s: string): boolean {
  return !s || s.trim().length == 0;
}

export function capitalize(beerName: string): string {
  return _.startCase(_.toLower(beerName)).replace(
    /(\d+)\s*(ml|l)/gi,
    (match: string, qnt: string, volume: string) =>
      `${qnt}${volume.toLowerCase()}`
  );
}
