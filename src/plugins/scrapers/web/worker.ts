import { NameMatcher } from "../../../core/matcher";
import { ScrapProcessor } from ".";

export declare type Worker = {
  readonly beerName: string;
  processor: ScrapProcessor;
  matcher?: NameMatcher;
};
