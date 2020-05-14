const Geocodio = require("../index.js");

describe("geocoder", () => {
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

  it("Can single reverse geocode: string", () => {
    expect.assertions(1);

    return geocoder.reverse("38.886665,-77.094733").then(response => {
      expect(response.results[0].formatted_address).toEqual(
        "1109 N Highland St, Arlington, VA 22201"
      );
    });
  });

  it("Can single reverse geocode: array", () => {
    expect.assertions(1);

    return geocoder.reverse([38.886665, -77.094733]).then(response => {
      expect(response.results[0].formatted_address).toEqual(
        "1109 N Highland St, Arlington, VA 22201"
      );
    });
  });

  it("Can batch forward geocode", () => {
    expect.assertions(2);

    return geocoder
      .geocode([
        "1109 N Highland St, Arlington VA",
        "525 University Ave, Toronto, ON, Canada"
      ])
      .then(response => {
        expect(
          response.results[0].response.results[0].formatted_address
        ).toEqual("1109 N Highland St, Arlington, VA 22201");
        expect(
          response.results[1].response.results[0].formatted_address
        ).toEqual("525 University Ave, Toronto, ON M5G");
      });
  });

  it("Can batch forward geocode with keys", () => {
    expect.assertions(2);

    return geocoder
      .geocode({
        SomeIdentifier: "1109 N Highland St, Arlington VA",
        SomeOtherIdentifier: "525 University Ave, Toronto, ON, Canada"
      })
      .then(response => {
        const res = response.results;

        expect(
          res.SomeIdentifier.response.results[0].formatted_address
        ).toEqual("1109 N Highland St, Arlington, VA 22201");
        expect(
          res.SomeOtherIdentifier.response.results[0].formatted_address
        ).toEqual("525 University Ave, Toronto, ON M5G");
      });
  });

  it("Can batch forward geocode components", () => {
    expect.assertions(2);

    return geocoder
      .geocode([
        { street: "1109 N Highland St", postal_code: "22201" },
        {
          street: "525 University Ave",
          city: "Toronto",
          state: "Ontario",
          country: "Canada"
        }
      ])
      .then(response => {
        expect(
          response.results[0].response.results[0].formatted_address
        ).toEqual("1109 N Highland St, Arlington, VA 22201");
        expect(
          response.results[1].response.results[0].formatted_address
        ).toEqual("525 University Ave, Toronto, ON M5G");
      });
  });

  it("Can batch reverse geocode: string", () => {
    expect.assertions(2);

    return geocoder
      .reverse(["35.9746000,-77.9658000", "32.8793700,-96.6303900"])
      .then(response => {
        expect(
          response.results[0].response.results[0].formatted_address
        ).toEqual("101 E Washington St, Nashville, NC 27856");
        expect(
          response.results[1].response.results[0].formatted_address
        ).toEqual("3034 S 1st St, Garland, TX 75041");
      });
  });

  it("Can batch reverse geocode: array", () => {
    expect.assertions(2);

    return geocoder
      .reverse([
        ["35.9746000", "-77.9658000"],
        ["32.8793700", "-96.6303900"]
      ])
      .then(response => {
        expect(
          response.results[0].response.results[0].formatted_address
        ).toEqual("101 E Washington St, Nashville, NC 27856");
        expect(
          response.results[1].response.results[0].formatted_address
        ).toEqual("3034 S 1st St, Garland, TX 75041");
      });
  });

  it("Can append fields: forward, single", () => {
    expect.assertions(1);

    return geocoder
      .geocode("1109 N Highland St, Arlington VA", ["timezone"])
      .then(response => {
        expect(response.results[0].fields.timezone.abbreviation).toEqual("EST");
      });
  });

  it("Can append fields: reverse, single", () => {
    expect.assertions(1);

    return geocoder
      .reverse("38.886665,-77.094733", ["timezone"])
      .then(response => {
        expect(response.results[0].fields.timezone.abbreviation).toEqual("EST");
      });
  });

  it("Can append fields: forward, batch", () => {
    expect.assertions(1);

    return geocoder
      .geocode(["1109 N Highland St, Arlington VA"], ["timezone"])
      .then(response => {
        expect(
          response.results[0].response.results[0].fields.timezone.abbreviation
        ).toEqual("EST");
      });
  });

  it("Can append fields: reverse, batch", () => {
    expect.assertions(1);

    return geocoder
      .reverse(["38.886665,-77.094733"], ["timezone"])
      .then(response => {
        expect(
          response.results[0].response.results[0].fields.timezone.abbreviation
        ).toEqual("EST");
      });
  });

  it("Can limit results", () => {
    expect.assertions(1);

    return geocoder.geocode("Arlington, VA").then(response => {
      expect(response.results.length).toBeGreaterThan(1);
    });
  });

  it("Can limit results", () => {
    expect.assertions(1);

    return geocoder.geocode("Arlington, VA", [], 1).then(response => {
      expect(response.results.length).toEqual(1);
    });
  });
});
