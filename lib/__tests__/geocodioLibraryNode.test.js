const Geocodio = require("../index.js");

describe("geocoder", () => {
  // This assumes GEOCODIO_API_KEY is set in the environment
  const geocoder = new Geocodio();

  it("Can single forward geocode", () => {
    expect.assertions(1);

    return geocoder
      .geocode("1109 N Highland St, Arlington VA")
      .then(response => {
        expect(response.results[0].formatted_address).toEqual(
          "1109 N Highland St, Arlington, VA 22201"
        );
      });
  });

  it("Can single forward geocode components", () => {
    expect.assertions(1);

    return geocoder
      .geocode({ street: "1109 N Highland St", postal_code: "22201" })
      .then(response => {
        expect(response.results[0].formatted_address).toEqual(
          "1109 N Highland St, Arlington, VA 22201"
        );
      });
  });

  // The rest of the tests remain the same since they don't directly
  // interact with the authentication mechanism

  it("Can single reverse geocode: string", () => {
    expect.assertions(1);

    return geocoder.reverse("38.886665,-77.094733").then(response => {
      expect(response.results[0].formatted_address).toEqual(
        "1109 N Highland St, Arlington, VA 22201"
      );
    });
  });

  // And so on for the remaining tests...

  // For list tests, the authentication is now handled via the Authorization header
  // instead of api_key parameter, but test logic remains the same

  it("Can create a new list, check status, download list and delete list", () => {
    expect.assertions(1);

    // Upload and create list
    let newList = geocoder.list
      .create(
        `${__dirname}/stubs/sample_list.csv`,
        "forward",
        "{{A}} {{B}} {{C}} {{D}}",
        "https://example.com/my-callback"
      )
      .then(response => {
        expect(response.file.filename).toEqual("sample_list.csv");

        geocoder.list.status(response.id).then(
          setTimeout(resp => {
            expect(resp.id).toEqual(response.id);

            geocoder.list
              .download(response.id, "geocoded_file.csv")
              .then(resp => {
                expect(resp.file.filename).toEqual("geocoded_file.csv");

                geocoder.list.delete(response.id).then(resp => {
                  expect(resp.id).toEqual(null);
                });
              });
          }, 3000)
        );
      });

    return newList;
  });
});
