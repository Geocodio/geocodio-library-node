const axios = require("axios");
const Geocodio = require("../index.js");
const { version } = require("../../package.json");

describe("user agent", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("reports the package version from package.json", async () => {
    const get = jest
      .spyOn(axios, "get")
      .mockResolvedValue({ status: 200, data: { results: [] } });

    await new Geocodio("test-key").geocode("1109 N Highland St, Arlington VA");

    expect(get.mock.calls[0][1].headers["User-Agent"]).toBe(
      `geocodio-library-node/${version}`
    );
  });
});
