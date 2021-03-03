import { mock, mockReset } from "jest-mock-extended";
import { SourceScraper, Scraper } from "../../src/core";
import { NameMatcher } from "../../src/core/matcher";
import { Source } from "../../src/core/scrapedBeer";

const mockMatcher = mock<NameMatcher>();

beforeEach(() => {
  mockReset(mockMatcher);
});

describe("Scraper", () => {
  describe("constructor", () => {
    describe("Invalid Inputs", () => {
      it("When specifying an empty source list, it should thrown an error", () => {
        return expect(() => new Scraper([], mock<NameMatcher>())).toThrow();
      });
      it("When specifying null source list, it should thrown an error", () => {
        return expect(() => new Scraper(null, mock<NameMatcher>())).toThrow();
      });
      it("When specifying a null matcher, it should thrown an error", () => {
        return expect(
          () => new Scraper([mock<SourceScraper>()], null)
        ).toThrow();
      });
    });
  });
  describe("By Name", () => {
    describe("Invalid Inputs", () => {
      const testCases = ["", "  ", null, undefined];
      test.each(testCases)(
        "When beerName is %p, it should thrown an error",
        (beerName: string) => {
          //given
          const mockedExtScraper = mock<SourceScraper>();
          const scraper = new Scraper([mockedExtScraper], mockMatcher);

          //then
          return expect(() => scraper.byName(beerName)).rejects.toBeDefined();
        }
      );
    });

    describe("Searching", () => {
      it("When searched, an ordered by price list should be returned", async () => {
        //given
        const mockA = mock<SourceScraper>();
        const mockB = mock<SourceScraper>();
        const scraper = new Scraper([mockA, mockB], mockMatcher);
        const source = mock<Source>();

        mockMatcher.matches.mockReturnValue(true);

        const resultA = {
          name: "Hb Original 500ml",
          price: 30.99,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };
        const resultB = {
          name: "Hb Original 500ml",
          price: 30.85,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };

        mockA.scrapeByName.mockResolvedValue([resultA]);
        mockB.scrapeByName.mockResolvedValue([resultB]);

        //when
        const scrapedBeers = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(scrapedBeers).toStrictEqual([resultB, resultA]);
      });

      it("When searched, it should discard unmatched beers", async () => {
        //given
        const mockA = mock<SourceScraper>();
        const scraper = new Scraper([mockA], mockMatcher);
        const source = mock<Source>();

        const resultA = {
          name: "Paulaner Helles 500ml",
          price: 30.77,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };
        const resultB = {
          name: "Hb Original 500ml",
          price: 25.99,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };

        mockA.scrapeByName.mockResolvedValue([resultA, resultB]);
        mockMatcher.matches
          .calledWith(resultA.name, "Cerveja Hb Original 500ml")
          .mockReturnValue(false);
        mockMatcher.matches
          .calledWith(resultB.name, "Cerveja Hb Original 500ml")
          .mockReturnValue(true);

        //when
        const scrapedBeers = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(scrapedBeers).toStrictEqual([resultB]);
      });
    });
  });
});
