import { UndiscoveredBeer } from "../../src/core";

describe("UndiscoveredBeer", () => {
  describe("constructor", () => {
    describe("Happy Path", () => {
      it("It should construct with available/found as false", () => {
        //given
        const beer = new UndiscoveredBeer("Heineken", { name: "Wonka" });

        //then
        expect(beer.available).toBeFalsy();
        return expect(beer.found).toBeFalsy();
      });
    });
  });
});
