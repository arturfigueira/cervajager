import { mock } from "jest-mock-extended";
import { SourceScraper, Scraper, Source, ScrapeError } from "../../src/core";

describe("Scraper", () => {
  describe("constructor", () => {
    describe("Invalid Inputs", () => {
      it("When specifying an empty source list, it should thrown an error", () => {
        return expect(() => new Scraper([])).toThrow();
      });

      it("When specifying null source list, it should thrown an error", () => {
        return expect(() => new Scraper(null)).toThrow();
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
          const scraper = new Scraper([mockedExtScraper]);

          //then
          return expect(() => scraper.byName(beerName)).rejects.toBeDefined();
        }
      );
    });

    describe("Searching", () => {
      it("When searched, the result should contain a single ordered by price list (asc)", async () => {
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
        const result = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(result.scrapedBeers).toStrictEqual([resultB, resultA]);
      });

      it("When searched, the result should contain capitalize beer names", async () => {
        //given
        const mockA = mock<SourceScraper>();
        const scraper = new Scraper([mockA]);
        const source = mock<Source>();

        const resultA = {
          name: "Hb ORIGINAL 500ml",
          price: 30.99,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };
        const resultB = {
          name: "hb Original 500ml",
          price: 30.85,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };
        const resultC = {
          name: "hb Original 500 ML",
          price: 30.85,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };

        mockA.scrapeByName.mockResolvedValue([resultA, resultB, resultC]);

        //when
        const result = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(result.scrapedBeers.map((b) => b.name)).toStrictEqual([
          "Hb Original 500ml",
          "Hb Original 500ml",
          "Hb Original 500ml",
        ]);
      });

      it("When searched, the result should contain a list of failed sources", async () => {
        //given
        const mockA = mock<SourceScraper>();
        const mockB = mock<SourceScraper>();
        const scraper = new Scraper([mockA, mockB]);

        mockA.scrapeByName.mockResolvedValue([]);
        mockB.scrapeByName.mockRejectedValue("Test Error");
        mockB.getSource.mockReturnValue({ name: "My Test" });

        //when
        const result = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].reason).toBe("Test Error");
        return expect(result.errors[0].source).toStrictEqual({
          name: "My Test",
        });
      });

      it("When searched, out of stock or unavailable beers should be a the end of result list", async () => {
        //given
        const mockA = mock<SourceScraper>();
        const scraper = new Scraper([mockA]);
        const source = mock<Source>();

        const resultC = {
          name: "Paulaner Helles 500ml",
          price: 30.77,
          currency: "R$",
          found: true,
          available: true,
          source: source,
        };
        const resultB = {
          name: "Kwak Ale 500ml",
          price: NaN,
          currency: "R$",
          found: true,
          available: false,
          source: source,
        };
        const resultA = {
          name: "Hb Original 500ml",
          price: NaN,
          currency: "R$",
          found: false,
          available: false,
          source: source,
        };

        mockA.scrapeByName.mockResolvedValue([resultA, resultB, resultC]);

        //when
        const result = await scraper.byName("Cerveja Hb Original 500ml");

        //then
        return expect(result.scrapedBeers).toStrictEqual([
          resultC,
          resultA,
          resultB,
        ]);
      });
    });
  });
});

describe("ScrapeError", () => {
  describe("toString", () => {
    it("When concatenated to a string, it should execute the overridden toString method", () => {
      //given
      const error = new ScrapeError("My Test Error", { name: "My Source" });

      //when
      const text = "" + error;

      //then
      expect(text).toStrictEqual("ScrapeError [ My Source ] : My Test Error");
    });

    it("When interpolated into a string, it should execute the overridden toString method", () => {
      //given
      const error = new ScrapeError("My Test Error", { name: "My Source" });

      //when
      const text = `this is a ${error}`;

      //then
      expect(text).toStrictEqual(
        "this is a ScrapeError [ My Source ] : My Test Error"
      );
    });

    it("When joining from an array, it should execute the overridden toString method", () => {
      //given
      const error = new ScrapeError("My Test Error", { name: "My Source" });
      const errors = [error, error];

      //when
      const text = errors.join(",");

      //then
      expect(text).toStrictEqual(
        "ScrapeError [ My Source ] : My Test Error,ScrapeError [ My Source ] : My Test Error"
      );
    });
  });
});
