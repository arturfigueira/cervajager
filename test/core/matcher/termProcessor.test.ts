import { TermProcessor } from "../../../src/core/matcher/termProcessor";

describe("TermProcessor", () => {
  const termProcessor = new TermProcessor();

  describe("Process", () => {
    const vesselCases = [
      ["Warsteiner Premium Lata 500ml", "500ml premium warsteiner"],
      ["Delacruz Pilsen Garrafa 500ml", "500ml delacruz pilsen"],
      ["Barrilete Paulaner Hefeweiss 5L", "5l hefeweiss paulaner"],
      ["Heineken Barril 5L", "5l heineken"],
    ];
    test.each(vesselCases)(
      "When term contains the vessel, it should be removed: %p should be %p",
      (term: string, expectedResult: string) => {
        //when
        const processedTerm = termProcessor.process(term);

        //then
        expect(processedTerm).toBe(expectedResult);
      }
    );
    it("When term contains category, it should be removed", () => {
      //given
      const term = "Cerveja Artesanal Delacruz Pilsen 500ml";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("500ml delacruz pilsen");
    });
    it("When term contains nationality, it should be removed", () => {
      //given
      const term = "Hofbrau Alemã Original 500ml";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("500ml hofbrau original");
    });
    it("When term contains abbreviations, it should be reverted to full-form", () => {
      //given
      const term = "HB Original 500ml";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("500ml hofbrau original");
    });
    const volumeExamples = [
      ["500 mililitros", "500ml"],
      ["500mililitros", "500ml"],
      ["5 litros", "5l"],
      ["5litros", "5l"],
      ["1 litro", "1l"],
      ["1litro", "1l"],
    ];
    test.each(volumeExamples)(
      "When term contains volumetry, it should be abbreviated: %p should be %p",
      (original: string, abbreviated: string) => {
        //when
        const processedTerm = termProcessor.process(
          `Warsteiner Premium ${original}`
        );

        //then
        expect(processedTerm).toContain(abbreviated);
      }
    );
    it("When processed, a term should its words ordered", () => {
      //given
      const term = "Carolus Cuvee Van de Keizer Blauw 2017";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("2017 blauw carolus cuvee de keizer van");
    });
    it("When processed, underscore and hyphen should be converted to whitespace", () => {
      //given
      const term = "Beer-Name_Test";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("beer name test");
    });
    it("When processed, non-alphanumeric should be removed", () => {
      //given
      const term =
        "_!@#&()–[{}]:;',?/*abcdefghijklmnopqrstuvxz0123456789~$^+=<>'\"";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("abcdefghijklmnopqrstuvxz0123456789");
    });
    it("When processed, more than a single whitespace should be removed", () => {
      //given
      const term = "   Paulaner    Hefeweiss   500ml   ";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm.length).toBe(24);
    });
    it("When processed, a term should returns in lowercase", () => {
      //given
      const term = "Paulaner Hefeweiss 500ml";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("500ml hefeweiss paulaner");
    });
    it("When processed, a term should have diacritics removed", () => {
      //given
      const term = "Händen Beck's Löwenbräu Cuvée Cárcaju";

      //when
      const processedTerm = termProcessor.process(term);

      //then
      expect(processedTerm).toBe("becks carcaju cuvee handen lowenbrau");
    });
  });
});
