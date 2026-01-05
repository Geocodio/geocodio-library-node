"use strict";

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

// Distance API Enums
const DistanceMode = {
  Straightline: "straightline",
  Driving: "driving",
  Haversine: "haversine" // Alias for straightline (backward compat)
};

const DistanceUnits = {
  Miles: "miles",
  Kilometers: "km",
  Km: "km" // Alias
};

const DistanceOrderBy = {
  Distance: "distance",
  Duration: "duration"
};

const DistanceSortOrder = {
  Asc: "asc",
  Desc: "desc"
};

// Coordinate class for distance calculations
class Coordinate {
  constructor(lat, lng, id) {
    if (typeof lat !== "number" || isNaN(lat)) {
      throw new Error(`Latitude must be a number, got ${typeof lat}`);
    }

    if (typeof lng !== "number" || isNaN(lng)) {
      throw new Error(`Longitude must be a number, got ${typeof lng}`);
    }

    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude must be between -90 and 90, got ${lat}`);
    }

    if (lng < -180 || lng > 180) {
      throw new Error(`Longitude must be between -180 and 180, got ${lng}`);
    }

    this.lat = lat;
    this.lng = lng;
    this.id = id || undefined;
  }

  static from(input) {
    if (input instanceof Coordinate) {
      return input;
    }

    if (typeof input === "string") {
      return Coordinate.fromString(input);
    }

    if (Array.isArray(input)) {
      return Coordinate.fromArray(input);
    }

    if (typeof input === "object" && input !== null) {
      return new Coordinate(input.lat, input.lng, input.id);
    }

    throw new Error(`Invalid coordinate input: ${input}`);
  }

  static fromString(input) {
    const parts = input.split(",").map(p => p.trim());
    if (parts.length < 2) {
      throw new Error(`Invalid coordinate string: ${input}`);
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    const id = parts[2] || undefined;

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(`Invalid coordinate values in string: ${input}`);
    }

    return new Coordinate(lat, lng, id);
  }

  static fromArray(input) {
    if (input.length < 2) {
      throw new Error(`Coordinate array must have at least 2 elements`);
    }

    const lat = parseFloat(input[0]);
    const lng = parseFloat(input[1]);
    const id = input[2] === undefined ? undefined : String(input[2]);

    return new Coordinate(lat, lng, id);
  }

  // For GET requests (string format): "lat,lng" or "lat,lng,id"
  toString() {
    let str = `${this.lat},${this.lng}`;
    if (this.id !== undefined) {
      str += `,${this.id}`;
    }

    return str;
  }

  // For POST requests (object format): {lat, lng, id?}
  toObject() {
    const obj = {
      lat: this.lat,
      lng: this.lng
    };
    if (this.id !== undefined) {
      obj.id = this.id;
    }

    return obj;
  }
}

class Geocodio {
  constructor(apiKey, hostname, apiVersion) {
    this.apiKey = apiKey || process.env.GEOCODIO_API_KEY || null;
    this.hostname =
      hostname || process.env.GEOCODIO_HOSTNAME || "api.geocod.io";
    this.apiVersion = apiVersion || process.env.GEOCODIO_API_VERSION || "v1.9";

    this.SINGLE_TIMEOUT_MS = 5000;
    this.BATCH_TIMEOUT_MS = 30 * 60 * 1000;

    this.HTTP_HEADERS = {
      "User-Agent": "geocodio-library-node/1.12.0",
      Authorization: `Bearer ${this.apiKey}`
    };

    this.ADDRESS_COMPONENT_PARAMETERS = [
      "street",
      "city",
      "state",
      "postal_code",
      "country"
    ];

    this.list = this.list();
  }

  // Helper: Serialize params with array support (e.g., destinations[])
  serializeParams(params) {
    const parts = [];

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];

        if (Array.isArray(value)) {
          value.forEach(v => {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
          });
        } else if (value !== undefined && value !== null && value !== "") {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
    }

    return parts.join("&");
  }

  geocode(query, fields = [], limit = null, distanceOptions = null) {
    return this.handleRequest("geocode", query, fields, limit, distanceOptions);
  }

  reverse(query, fields = [], limit = null, distanceOptions = null) {
    return this.handleRequest("reverse", query, fields, limit, distanceOptions);
  }

  // Distance API - Single origin to multiple destinations (GET)
  distance(origin, destinations, options = {}) {
    const url = this.formatUrl("distance");
    const originCoord = Coordinate.from(origin);

    const queryParameters = {
      origin: originCoord.toString()
    };

    // Add destinations as array params
    const destStrings = destinations.map(d => Coordinate.from(d).toString());
    queryParameters["destinations[]"] = destStrings;

    // Add distance options
    this.addDistanceOptionsToParams(queryParameters, options);

    return this.handleResponse(
      axios.get(url, {
        params: queryParameters,
        timeout: this.SINGLE_TIMEOUT_MS,
        headers: this.HTTP_HEADERS,
        paramsSerializer: params => this.serializeParams(params)
      })
    );
  }

  // Distance Matrix API - Multiple origins × destinations (POST)
  distanceMatrix(origins, destinations, options = {}) {
    const url = this.formatUrl("distance-matrix");

    // Convert to object format for POST requests
    const originsObjects = origins.map(o => Coordinate.from(o).toObject());
    const destObjects = destinations.map(d => Coordinate.from(d).toObject());

    const body = {
      origins: originsObjects,
      destinations: destObjects
    };

    // Add distance options to body
    this.addDistanceOptionsToBody(body, options);

    return this.handleResponse(
      axios.post(url, body, {
        timeout: this.BATCH_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Async Distance Matrix Job - Create
  createDistanceMatrixJob(name, origins, destinations, options = {}) {
    const url = this.formatUrl("distance-jobs");

    const body = {
      name
    };

    // Origins can be array of coordinates or list ID (number)
    if (typeof origins === "number") {
      body.origins = origins;
    } else {
      body.origins = origins.map(o => Coordinate.from(o).toObject());
    }

    // Destinations can be array of coordinates or list ID (number)
    if (typeof destinations === "number") {
      body.destinations = destinations;
    } else {
      body.destinations = destinations.map(d => Coordinate.from(d).toObject());
    }

    // Add distance options to body
    this.addDistanceOptionsToBody(body, options);

    // Add callback URL if provided
    if (options.callbackUrl) {
      body.callback_url = options.callbackUrl;
    }

    return this.handleResponse(
      axios.post(url, body, {
        timeout: this.SINGLE_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Async Distance Matrix Job - Get Status
  distanceMatrixJobStatus(id) {
    const url = this.formatUrl(`distance-jobs/${id}`);

    return this.handleResponse(
      axios.get(url, {
        timeout: this.SINGLE_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Async Distance Matrix Job - List All
  distanceMatrixJobs(page = null) {
    const url = this.formatUrl("distance-jobs");

    const params = {};
    if (page !== null) {
      params.page = page;
    }

    return this.handleResponse(
      axios.get(url, {
        params,
        timeout: this.SINGLE_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Async Distance Matrix Job - Get Results
  getDistanceMatrixJobResults(id) {
    const url = this.formatUrl(`distance-jobs/${id}/download`);

    return this.handleResponse(
      axios.get(url, {
        timeout: this.BATCH_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Async Distance Matrix Job - Download to File
  downloadDistanceMatrixJob(id, filePath) {
    const url = this.formatUrl(`distance-jobs/${id}/download`);
    const writer = fs.createWriteStream(filePath);

    return this.handleResponse(
      axios({
        method: "get",
        url,
        headers: this.HTTP_HEADERS,
        responseType: "stream"
      }).then(response => {
        return new Promise((resolve, reject) => {
          response.data.pipe(writer);
          let error = null;
          writer.on("error", err => {
            error = err;
            writer.close();
            reject(err);
          });
          writer.on("close", () => {
            if (!error) {
              resolve(true);
            }
          });
        });
      })
    );
  }

  // Async Distance Matrix Job - Delete
  deleteDistanceMatrixJob(id) {
    const url = this.formatUrl(`distance-jobs/${id}`);

    return this.handleResponse(
      axios.delete(url, {
        timeout: this.SINGLE_TIMEOUT_MS,
        headers: this.HTTP_HEADERS
      })
    );
  }

  // Helper: Add distance options to GET query parameters
  addDistanceOptionsToParams(params, options) {
    if (options.mode) {
      params.mode = options.mode;
    }

    if (options.units) {
      params.units = options.units;
    }

    if (options.maxResults !== undefined) {
      params.max_results = options.maxResults;
    }

    if (options.maxDistance !== undefined) {
      params.max_distance = options.maxDistance;
    }

    if (options.maxDuration !== undefined) {
      params.max_duration = options.maxDuration;
    }

    if (options.minDistance !== undefined) {
      params.min_distance = options.minDistance;
    }

    if (options.minDuration !== undefined) {
      params.min_duration = options.minDuration;
    }

    if (options.orderBy) {
      params.order_by = options.orderBy;
    }

    if (options.sortOrder) {
      params.sort = options.sortOrder;
    }
  }

  // Helper: Add distance options to POST body
  addDistanceOptionsToBody(body, options) {
    if (options.mode) {
      body.mode = options.mode;
    }

    if (options.units) {
      body.units = options.units;
    }

    if (options.maxResults !== undefined) {
      body.max_results = options.maxResults;
    }

    if (options.maxDistance !== undefined) {
      body.max_distance = options.maxDistance;
    }

    if (options.maxDuration !== undefined) {
      body.max_duration = options.maxDuration;
    }

    if (options.minDistance !== undefined) {
      body.min_distance = options.minDistance;
    }

    if (options.minDuration !== undefined) {
      body.min_duration = options.minDuration;
    }

    if (options.orderBy) {
      body.order_by = options.orderBy;
    }

    if (options.sortOrder) {
      body.sort = options.sortOrder;
    }
  }

  // Helper: Add distance options for geocode/reverse
  addDistanceOptionsToGeocodeParams(params, distanceOptions) {
    if (!distanceOptions) return;

    if (
      distanceOptions.destinations &&
      distanceOptions.destinations.length > 0
    ) {
      const destStrings = distanceOptions.destinations.map(d =>
        Coordinate.from(d).toString()
      );
      params["destinations[]"] = destStrings;
    }

    if (distanceOptions.distanceMode) {
      params.distance_mode = distanceOptions.distanceMode;
    }

    if (distanceOptions.distanceUnits) {
      params.distance_units = distanceOptions.distanceUnits;
    }

    if (distanceOptions.distanceMaxResults !== undefined) {
      params.distance_max_results = distanceOptions.distanceMaxResults;
    }

    if (distanceOptions.distanceMaxDistance !== undefined) {
      params.distance_max_distance = distanceOptions.distanceMaxDistance;
    }

    if (distanceOptions.distanceMaxDuration !== undefined) {
      params.distance_max_duration = distanceOptions.distanceMaxDuration;
    }

    if (distanceOptions.distanceMinDistance !== undefined) {
      params.distance_min_distance = distanceOptions.distanceMinDistance;
    }

    if (distanceOptions.distanceMinDuration !== undefined) {
      params.distance_min_duration = distanceOptions.distanceMinDuration;
    }

    if (distanceOptions.distanceOrderBy) {
      params.distance_order_by = distanceOptions.distanceOrderBy;
    }

    if (distanceOptions.distanceSortOrder) {
      params.distance_sort = distanceOptions.distanceSortOrder;
    }
  }

  handleRequest(
    endpoint,
    query,
    fields = [],
    limit = null,
    distanceOptions = null
  ) {
    const url = this.formatUrl(endpoint);

    let queryParameters = {
      fields: fields.join(",")
    };

    if (limit) {
      queryParameters.limit = limit;
    }

    // Add distance options for geocode/reverse
    this.addDistanceOptionsToGeocodeParams(queryParameters, distanceOptions);

    query = this.preprocessQuery(query, endpoint);

    let response = null;
    const hasDistanceOptions =
      distanceOptions &&
      distanceOptions.destinations &&
      distanceOptions.destinations.length > 0;

    if (this.isSingleQuery(query)) {
      response = this.performSingleRequest(
        url,
        query,
        queryParameters,
        hasDistanceOptions
      );
    } else {
      query = this.preprocessQueryList(query, endpoint);
      response = this.performBatchRequest(url, query, queryParameters);
    }

    return this.handleResponse(response);
  }

  handleResponse(response) {
    return response
      .then(response => response.data)
      .catch(error => {
        if (error.response) {
          const errorMessage =
            error.response.data.message || error.response.data.error || "Error";
          const code = error.response.status || 0;

          const decoratedError = new Error(errorMessage);
          decoratedError.code = code;

          throw decoratedError;
        } else {
          throw error;
        }
      });
  }

  formatUrl(endpoint) {
    return `https://${this.hostname}/${this.apiVersion}/${endpoint}`;
  }

  preprocessQueryList(query, endpoint) {
    for (const key in query) {
      if (
        Array.isArray(query) ||
        Object.prototype.hasOwnProperty.call(query, key)
      ) {
        query[key] = this.preprocessQuery(query[key], endpoint);
      }
    }

    return query;
  }

  preprocessQuery(query, endpoint) {
    // Convert lat/lon to a comma-separated string
    const queryIsCoordinateArray = Array.isArray(query) && query.length === 2;

    if (endpoint === "reverse" && queryIsCoordinateArray) {
      const [latitude, longitude] = query;

      if (this.isNumeric(latitude) && this.isNumeric(longitude)) {
        query = `${latitude},${longitude}`;
      }
    }

    return query;
  }

  isSingleQuery(query) {
    if (typeof query === "object") {
      const addressComponentKeys = Object.keys(query).filter(value =>
        this.ADDRESS_COMPONENT_PARAMETERS.includes(value)
      );

      return addressComponentKeys.length >= 1;
    }

    return true;
  }

  performSingleRequest(
    url,
    query,
    queryParameters,
    useArrayParamsSerializer = false
  ) {
    if (typeof query === "object") {
      queryParameters = {
        ...queryParameters,
        ...query
      };
    } else {
      queryParameters.q = query;
    }

    const axiosConfig = {
      params: queryParameters,
      timeout: this.SINGLE_TIMEOUT_MS,
      headers: this.HTTP_HEADERS
    };

    // Use custom params serializer when we have array parameters (e.g., destinations[])
    if (useArrayParamsSerializer) {
      axiosConfig.paramsSerializer = params => this.serializeParams(params);
    }

    return axios.get(url, axiosConfig);
  }

  performBatchRequest(url, queries, queryParameters) {
    return axios.post(url, queries, {
      params: queryParameters,
      timeout: this.BATCH_TIMEOUT_MS,
      headers: this.HTTP_HEADERS
    });
  }

  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  list() {
    const create = (filename, direction, format, callback) => {
      const form = new FormData();
      form.append("file", fs.createReadStream(filename));

      const headers = {
        ...this.HTTP_HEADERS,
        ...form.getHeaders()
      };

      return this.handleResponse(
        axios.post(this.formatUrl("lists"), form, {
          params: {
            direction,
            format,
            callback
          },
          headers: headers
        })
      );
    };

    const status = listId => {
      return this.handleResponse(
        axios.get(this.formatUrl(`lists/${listId}`), {
          headers: this.HTTP_HEADERS
        })
      );
    };

    const all = () => {
      return this.handleResponse(
        axios.get(this.formatUrl(`lists`), {
          headers: this.HTTP_HEADERS
        })
      );
    };

    const download = (listId, output) => {
      const writer = fs.createWriteStream(output);

      return this.handleResponse(
        axios({
          method: "get",
          url: this.formatUrl(`lists/${listId}/download`),
          headers: this.HTTP_HEADERS,
          responseType: "stream"
        }).then(response => {
          return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on("error", err => {
              error = err;
              writer.close();
              reject(err);
            });
            writer.on("close", () => {
              if (!error) {
                resolve(true);
              }
            });
          });
        })
      );
    };

    const deleteList = listId => {
      return this.handleResponse(
        axios.delete(this.formatUrl(`lists/${listId}`), {
          headers: this.HTTP_HEADERS
        })
      );
    };

    return {
      create,
      status,
      all,
      download,
      deleteList, // Kept for backwards compatibility
      delete: deleteList
    };
  }
}

// Default export for backward compatibility
module.exports = Geocodio;

// Named exports for ES modules and additional utilities
module.exports.Geocodio = Geocodio;
module.exports.Coordinate = Coordinate;
module.exports.DistanceMode = DistanceMode;
module.exports.DistanceUnits = DistanceUnits;
module.exports.DistanceOrderBy = DistanceOrderBy;
module.exports.DistanceSortOrder = DistanceSortOrder;
