const Geocodio = require("../index.js");

describe("error handling", () => {
  it("Throws error with invalid API key", () => {
    expect.assertions(2);

    const geocoder = new Geocodio("BAD_API_KEY");

    return geocoder.geocode("20003").catch(err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual("Invalid API key");
    });
  });

  it("Throws error with bad query", () => {
    expect.assertions(2);

    const geocoder = new Geocodio();

    return geocoder.geocode(" ").catch(err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual("Could not parse address");
    });
  });
});
