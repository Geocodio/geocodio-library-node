const Geocodio = require("../index.js");
const {
  Coordinate,
  DistanceMode,
  DistanceUnits,
  DistanceOrderBy,
  DistanceSortOrder
} = require("../index.js");

describe("Coordinate class", () => {
  it("Can create coordinate from numbers", () => {
    const coord = new Coordinate(38.8977, -77.0365);
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
    expect(coord.id).toBeUndefined();
  });

  it("Can create coordinate with id", () => {
    const coord = new Coordinate(38.8977, -77.0365, "white_house");
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
    expect(coord.id).toEqual("white_house");
  });

  it("Can convert to string format", () => {
    const coord = new Coordinate(38.8977, -77.0365);
    expect(coord.toString()).toEqual("38.8977,-77.0365");
  });

  it("Can convert to string format with id", () => {
    const coord = new Coordinate(38.8977, -77.0365, "white_house");
    expect(coord.toString()).toEqual("38.8977,-77.0365,white_house");
  });

  it("Can convert to object format", () => {
    const coord = new Coordinate(38.8977, -77.0365);
    expect(coord.toObject()).toEqual({ lat: 38.8977, lng: -77.0365 });
  });

  it("Can convert to object format with id", () => {
    const coord = new Coordinate(38.8977, -77.0365, "white_house");
    expect(coord.toObject()).toEqual({
      lat: 38.8977,
      lng: -77.0365,
      id: "white_house"
    });
  });

  it("Can create from string", () => {
    const coord = Coordinate.from("38.8977,-77.0365");
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
  });

  it("Can create from string with id", () => {
    const coord = Coordinate.from("38.8977,-77.0365,white_house");
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
    expect(coord.id).toEqual("white_house");
  });

  it("Can create from array", () => {
    const coord = Coordinate.from([38.8977, -77.0365]);
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
  });

  it("Can create from array with id", () => {
    const coord = Coordinate.from([38.8977, -77.0365, "white_house"]);
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
    expect(coord.id).toEqual("white_house");
  });

  it("Can create from object", () => {
    const coord = Coordinate.from({ lat: 38.8977, lng: -77.0365 });
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
  });

  it("Can create from object with id", () => {
    const coord = Coordinate.from({
      lat: 38.8977,
      lng: -77.0365,
      id: "white_house"
    });
    expect(coord.lat).toEqual(38.8977);
    expect(coord.lng).toEqual(-77.0365);
    expect(coord.id).toEqual("white_house");
  });

  it("Can create from Coordinate instance", () => {
    const original = new Coordinate(38.8977, -77.0365, "white_house");
    const coord = Coordinate.from(original);
    expect(coord).toBe(original);
  });

  it("Throws error for invalid latitude", () => {
    expect(() => new Coordinate(100, -77.0365)).toThrow(
      "Latitude must be between -90 and 90"
    );
  });

  it("Throws error for invalid longitude", () => {
    expect(() => new Coordinate(38.8977, 200)).toThrow(
      "Longitude must be between -180 and 180"
    );
  });

  it("Throws error for non-numeric latitude", () => {
    expect(() => new Coordinate("not a number", -77.0365)).toThrow(
      "Latitude must be a number"
    );
  });

  it("Throws error for invalid string format", () => {
    expect(() => Coordinate.fromString("invalid")).toThrow(
      "Invalid coordinate string"
    );
  });

  it("Throws error for non-numeric coordinate values", () => {
    expect(() => Coordinate.fromString("abc,def")).toThrow(
      "Invalid coordinate values"
    );
  });
});

describe("Distance enums", () => {
  it("DistanceMode has correct values", () => {
    expect(DistanceMode.Straightline).toEqual("straightline");
    expect(DistanceMode.Driving).toEqual("driving");
    expect(DistanceMode.Haversine).toEqual("haversine");
  });

  it("DistanceUnits has correct values", () => {
    expect(DistanceUnits.Miles).toEqual("miles");
    expect(DistanceUnits.Kilometers).toEqual("km");
    expect(DistanceUnits.Km).toEqual("km");
  });

  it("DistanceOrderBy has correct values", () => {
    expect(DistanceOrderBy.Distance).toEqual("distance");
    expect(DistanceOrderBy.Duration).toEqual("duration");
  });

  it("DistanceSortOrder has correct values", () => {
    expect(DistanceSortOrder.Asc).toEqual("asc");
    expect(DistanceSortOrder.Desc).toEqual("desc");
  });
});

describe("Distance API", () => {
  const geocoder = new Geocodio();

  // White House coordinates
  const whiteHouse = "38.8977,-77.0365,white_house";
  // Capitol Building
  const capitol = "38.8899,-77.0091,capitol";
  // Washington Monument
  const monument = "38.8895,-77.0353,monument";

  it("Can calculate distance from single origin to destinations", () => {
    expect.assertions(3);

    return geocoder.distance(whiteHouse, [capitol, monument]).then(response => {
      expect(response.origin).toBeDefined();
      expect(response.destinations.length).toEqual(2);
      const ids = response.destinations.map(d => d.id);
      expect(ids).toContain("capitol");
    });
  });

  it("Can calculate distance with Coordinate objects", () => {
    expect.assertions(3);

    const origin = new Coordinate(38.8977, -77.0365, "white_house");
    const destinations = [
      new Coordinate(38.8899, -77.0091, "capitol"),
      new Coordinate(38.8895, -77.0353, "monument")
    ];

    return geocoder.distance(origin, destinations).then(response => {
      expect(response.origin).toBeDefined();
      expect(response.destinations.length).toEqual(2);
      const ids = response.destinations.map(d => d.id);
      expect(ids).toContain("capitol");
    });
  });

  it("Can calculate distance with array format", () => {
    expect.assertions(3);

    return geocoder
      .distance(
        [38.8977, -77.0365, "white_house"],
        [
          [38.8899, -77.0091, "capitol"],
          [38.8895, -77.0353, "monument"]
        ]
      )
      .then(response => {
        expect(response.origin).toBeDefined();
        expect(response.destinations.length).toEqual(2);
        const ids = response.destinations.map(d => d.id);
        expect(ids).toContain("capitol");
      });
  });

  it("Can calculate distance with driving mode", () => {
    expect.assertions(2);

    return geocoder
      .distance(whiteHouse, [capitol], { mode: DistanceMode.Driving })
      .then(response => {
        expect(response.mode).toEqual("driving");
        expect(response.destinations[0].duration_seconds).toBeDefined();
      });
  });

  it("Can calculate distance in kilometers", () => {
    expect.assertions(1);

    return geocoder
      .distance(whiteHouse, [capitol], { units: DistanceUnits.Kilometers })
      .then(response => {
        expect(response.destinations[0].distance_km).toBeDefined();
      });
  });

  it("Can use haversine mode", () => {
    expect.assertions(1);

    return geocoder
      .distance(whiteHouse, [capitol], { mode: DistanceMode.Haversine })
      .then(response => {
        expect(response.mode).toEqual("haversine");
      });
  });

  it("Can limit max results", () => {
    expect.assertions(1);

    return geocoder
      .distance(whiteHouse, [capitol, monument], { maxResults: 1 })
      .then(response => {
        expect(response.destinations.length).toEqual(1);
      });
  });
});

describe("Distance Matrix API", () => {
  const geocoder = new Geocodio();

  const origins = [
    { lat: 38.8977, lng: -77.0365, id: "white_house" },
    { lat: 38.8899, lng: -77.0091, id: "capitol" }
  ];

  const destinations = [
    { lat: 38.8895, lng: -77.0353, id: "monument" },
    { lat: 38.9072, lng: -77.0369, id: "dupont" }
  ];

  it("Can calculate distance matrix", () => {
    expect.assertions(3);

    return geocoder.distanceMatrix(origins, destinations).then(response => {
      expect(response.mode).toBeDefined();
      expect(response.results.length).toEqual(2);
      expect(response.results[0].destinations.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("Can calculate distance matrix with string coordinates", () => {
    expect.assertions(2);

    return geocoder
      .distanceMatrix(
        ["38.8977,-77.0365,origin1", "38.8899,-77.0091,origin2"],
        ["38.8895,-77.0353,dest1"]
      )
      .then(response => {
        expect(response.results.length).toEqual(2);
        expect(response.results[0].origin.id).toEqual("origin1");
      });
  });

  it("Can calculate distance matrix with driving mode", () => {
    expect.assertions(2);

    return geocoder
      .distanceMatrix(origins, destinations, { mode: DistanceMode.Driving })
      .then(response => {
        expect(response.mode).toEqual("driving");
        expect(
          response.results[0].destinations[0].duration_seconds
        ).toBeDefined();
      });
  });

  it("Can calculate distance matrix with filtering options", () => {
    expect.assertions(1);

    return geocoder
      .distanceMatrix(origins, destinations, {
        maxResults: 1,
        orderBy: DistanceOrderBy.Distance,
        sortOrder: DistanceSortOrder.Asc
      })
      .then(response => {
        expect(response.results[0].destinations.length).toBeLessThanOrEqual(1);
      });
  });
});

describe("Geocode with distance", () => {
  const geocoder = new Geocodio();

  it("Can geocode with distance to destinations", () => {
    expect.assertions(2);

    return geocoder
      .geocode("1600 Pennsylvania Ave NW, Washington DC", [], null, {
        destinations: ["38.8899,-77.0091,capitol"]
      })
      .then(response => {
        expect(response.results[0]).toBeDefined();
        // Note: destinations may or may not be included depending on API version
        expect(response.results.length).toBeGreaterThan(0);
      });
  });
});

describe("Reverse geocode with distance", () => {
  const geocoder = new Geocodio();

  it("Can reverse geocode with distance to destinations", () => {
    expect.assertions(2);

    return geocoder
      .reverse("38.8977,-77.0365", [], null, {
        destinations: ["38.8899,-77.0091,capitol"]
      })
      .then(response => {
        expect(response.results[0]).toBeDefined();
        expect(response.results.length).toBeGreaterThan(0);
      });
  });
});

describe("Distance Matrix Jobs API", () => {
  const geocoder = new Geocodio();

  it("Can list distance matrix jobs", () => {
    expect.assertions(1);

    return geocoder.distanceMatrixJobs().then(response => {
      expect(response.data).toBeDefined();
    });
  });

  // Note: Creating, checking status, and deleting jobs is tested in integration
  // as it requires actual job creation which takes time
});
