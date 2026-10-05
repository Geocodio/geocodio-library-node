const axios = require("axios");
const Geocodio = require("../index.js");

/*
 * Warnings passthrough
 *
 * The API reports non-fatal advisories under a `_warnings` key -- an
 * unrecognized field name, a superseded API version, an append that was
 * skipped. The library resolves with the decoded response body verbatim, so
 * the key is already available to callers. These tests lock that in: they
 * fail if a future refactor drops the key on any response shape.
 *
 * The shapes are the ones the OpenAPI specification models (see the
 * `Warnings` schema): top-level on single geocode/reverse, per result,
 * per batch item, and on the lists and distance-jobs responses.
 */

const respondWith = (method, data) =>
  jest.spyOn(axios, method).mockResolvedValue({ status: 200, data });

const rejectWith = (method, status, data) => {
  const error = new Error(`Request failed with status code ${status}`);
  error.response = { status, data };

  return jest.spyOn(axios, method).mockRejectedValue(error);
};

describe("warnings", () => {
  const geocoder = new Geocodio("test-key");

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("geocoding responses", () => {
    it("preserves top-level warnings on a single forward geocode", async () => {
      respondWith("get", {
        results: [
          { formatted_address: "1109 N Highland St, Arlington, VA 22201" }
        ],
        _warnings: ["The field congress is not recognized. Did you mean cd?"]
      });

      const response = await geocoder.geocode(
        "1109 N Highland St, Arlington VA",
        ["congress"]
      );

      expect(response._warnings).toEqual([
        "The field congress is not recognized. Did you mean cd?"
      ]);
    });

    it("preserves top-level warnings on a single reverse geocode", async () => {
      respondWith("get", {
        results: [
          { formatted_address: "1109 N Highland St, Arlington, VA 22201" }
        ],
        _warnings: [
          "Ignoring parameter zipcode as it was not expected. Did you mean postal_code?"
        ]
      });

      const response = await geocoder.reverse("38.886665,-77.094733");

      expect(response._warnings).toEqual([
        "Ignoring parameter zipcode as it was not expected. Did you mean postal_code?"
      ]);
    });

    it("preserves per-result warnings", async () => {
      respondWith("get", {
        results: [
          {
            formatted_address: "Arlington, VA 22201",
            accuracy_type: "place",
            _warnings: [
              "ffiec field was skipped since result is not street-level"
            ]
          }
        ]
      });

      const response = await geocoder.geocode("22201", ["ffiec"]);

      expect(response.results[0]._warnings).toEqual([
        "ffiec field was skipped since result is not street-level"
      ]);
    });

    it("preserves per-item warnings on a batch forward geocode", async () => {
      const item = query => ({
        query,
        response: {
          results: [{ formatted_address: query }],
          _warnings: ["The field congress is not recognized. Did you mean cd?"]
        }
      });

      respondWith("post", {
        results: [
          item("1109 N Highland St, Arlington VA"),
          item("525 University Ave, Toronto, ON, Canada")
        ]
      });

      const response = await geocoder.geocode(
        [
          "1109 N Highland St, Arlington VA",
          "525 University Ave, Toronto, ON, Canada"
        ],
        ["congress"]
      );

      expect(response.results[0].response._warnings).toEqual([
        "The field congress is not recognized. Did you mean cd?"
      ]);
      expect(response.results[1].response._warnings).toEqual([
        "The field congress is not recognized. Did you mean cd?"
      ]);
    });

    it("preserves per-item warnings on a batch reverse geocode", async () => {
      respondWith("post", {
        results: [
          {
            query: "35.9746000,-77.9658000",
            response: {
              results: [
                {
                  formatted_address: "101 W Washington St, Nashville, NC 27856"
                }
              ],
              _warnings: [
                "There is a newer API version available, please consider upgrading to v2."
              ]
            }
          }
        ]
      });

      const response = await geocoder.reverse(["35.9746000,-77.9658000"]);

      expect(response.results[0].response._warnings).toEqual([
        "There is a newer API version available, please consider upgrading to v2."
      ]);
    });

    it("does not invent a warnings key when the API sends none", async () => {
      respondWith("get", {
        results: [
          { formatted_address: "1109 N Highland St, Arlington, VA 22201" }
        ]
      });

      const response = await geocoder.geocode(
        "1109 N Highland St, Arlington VA"
      );

      expect(response).not.toHaveProperty("_warnings");
      expect(response._warnings || []).toEqual([]);
    });
  });

  describe("lists responses", () => {
    it("preserves warnings on list status", async () => {
      respondWith("get", {
        id: 42,
        status: { state: "COMPLETED" },
        _warnings: [
          "The fields parameter should contain a comma-separated list of fields instead of an array"
        ]
      });

      const response = await geocoder.list.status(42);

      expect(response._warnings).toEqual([
        "The fields parameter should contain a comma-separated list of fields instead of an array"
      ]);
    });

    it("preserves warnings when listing all lists", async () => {
      respondWith("get", {
        data: [],
        total: 0,
        _warnings: [
          "The fields parameter should contain a comma-separated list of fields instead of an array"
        ]
      });

      const response = await geocoder.list.all();

      expect(response._warnings).toEqual([
        "The fields parameter should contain a comma-separated list of fields instead of an array"
      ]);
    });

    it("preserves warnings when deleting a list", async () => {
      respondWith("delete", {
        success: true,
        _warnings: [
          "There is a newer API version available, please consider upgrading to v2."
        ]
      });

      const response = await geocoder.list.delete(42);

      expect(response._warnings).toEqual([
        "There is a newer API version available, please consider upgrading to v2."
      ]);
    });
  });

  describe("distance matrix job responses", () => {
    it("preserves warnings when creating a job", async () => {
      respondWith("post", {
        identifier: "dmj_abc123",
        status: "ENQUEUED",
        _warnings: [
          "There is a newer API version available, please consider upgrading to v2."
        ]
      });

      const response = await geocoder.createDistanceMatrixJob(
        "Store coverage",
        [[38.886665, -77.094733]],
        [[38.897675, -77.036547]]
      );

      expect(response._warnings).toEqual([
        "There is a newer API version available, please consider upgrading to v2."
      ]);
    });

    it("preserves warnings on job status", async () => {
      respondWith("get", {
        data: { identifier: "dmj_abc123", status: "COMPLETED" },
        _warnings: [
          "The fields parameter should contain a comma-separated list of fields instead of an array"
        ]
      });

      const response = await geocoder.distanceMatrixJobStatus("dmj_abc123");

      expect(response._warnings).toEqual([
        "The fields parameter should contain a comma-separated list of fields instead of an array"
      ]);
    });

    it("preserves warnings when listing jobs", async () => {
      respondWith("get", {
        data: [],
        total: 0,
        _warnings: [
          "The fields parameter should contain a comma-separated list of fields instead of an array"
        ]
      });

      const response = await geocoder.distanceMatrixJobs();

      expect(response._warnings).toEqual([
        "The fields parameter should contain a comma-separated list of fields instead of an array"
      ]);
    });

    it("preserves warnings when deleting a job", async () => {
      respondWith("delete", {
        success: true,
        _warnings: [
          "There is a newer API version available, please consider upgrading to v2."
        ]
      });

      const response = await geocoder.deleteDistanceMatrixJob("dmj_abc123");

      expect(response._warnings).toEqual([
        "There is a newer API version available, please consider upgrading to v2."
      ]);
    });
  });

  describe("error responses", () => {
    it("exposes warnings attached to an error response", async () => {
      expect.assertions(3);

      rejectWith("get", 422, {
        error: "Could not geocode address. Postal code or city required.",
        _warnings: ["The field congress is not recognized. Did you mean cd?"]
      });

      try {
        await geocoder.geocode("1109 N Highland St", ["congress"]);
      } catch (err) {
        expect(err.message).toEqual(
          "Could not geocode address. Postal code or city required."
        );
        expect(err.code).toEqual(422);
        expect(err.warnings).toEqual([
          "The field congress is not recognized. Did you mean cd?"
        ]);
      }
    });

    it("reports no warnings when the error response carries none", async () => {
      expect.assertions(1);

      rejectWith("get", 403, { error: "Invalid API key" });

      try {
        await geocoder.geocode("1109 N Highland St, Arlington VA");
      } catch (err) {
        expect(err.warnings).toEqual([]);
      }
    });
  });
});
