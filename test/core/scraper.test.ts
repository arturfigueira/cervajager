import { mock } from "jest-mock-extended";
import { SourceScraper, Scraper } from "../../src/core";
import { Source } from "../../src/core/scrapedBeer";

describe("Scraper", () => {
  describe("By Name", () => {
    describe("Invalid Inputs", () => {
      const testCases = ["", "  ", null, undefined];
      test.each(testCases)(
        "When beerName is %p, it should thrown an error",
        (beerName: string) => {
          //given
          const mockedExtScraper = mock<SourceScraper>();
          const scraper = new Scraper([mockedExtScraper]);

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
        const scraper = new Scraper([mockA, mockB]);
        const source = mock<Source>();

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
        const scraper = new Scraper([mockA]);
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

        //when
        const scrapedBeers = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(scrapedBeers).toStrictEqual([resultB]);
      });
    });
  });
});
