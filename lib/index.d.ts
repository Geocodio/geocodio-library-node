declare module 'geocodio-library-node' {
  // Distance API Enums
  export enum DistanceMode {
    Straightline = 'straightline',
    Driving = 'driving',
    Haversine = 'haversine'  // Alias for straightline (backward compat)
  }

  export enum DistanceUnits {
    Miles = 'miles',
    Kilometers = 'km',
    Km = 'km'  // Alias
  }

  export enum DistanceOrderBy {
    Distance = 'distance',
    Duration = 'duration'
  }

  export enum DistanceSortOrder {
    Asc = 'asc',
    Desc = 'desc'
  }

  // Coordinate class for distance calculations
  export class Coordinate {
    readonly lat: number;
    readonly lng: number;
    readonly id?: string;

    constructor(lat: number, lng: number, id?: string);

    static from(input: CoordinateInput): Coordinate;
    static fromString(input: string): Coordinate;
    static fromArray(input: [number, number] | [number, number, string]): Coordinate;

    toString(): string;
    toObject(): { lat: number; lng: number; id?: string };
  }

  // Coordinate input types (accept multiple formats)
  export type CoordinateInput =
    | Coordinate
    | string                           // "lat,lng" or "lat,lng,id"
    | [number, number]                 // [lat, lng]
    | [number, number, string]         // [lat, lng, id]
    | { lat: number; lng: number; id?: string };

  // Distance API Response Types
  export interface DistanceDestination {
    query: string;
    location: [number, number];
    id?: string;
    distance_miles: number;
    distance_km: number;
    duration_seconds?: number;  // Only with driving mode
  }

  export interface DistanceOrigin {
    query: string;
    location: [number, number];
    id?: string;
  }

  export interface DistanceResponse {
    origin: DistanceOrigin;
    mode: string;
    destinations: DistanceDestination[];
  }

  export interface DistanceMatrixResult {
    origin: DistanceOrigin;
    destinations: DistanceDestination[];
  }

  export interface DistanceMatrixResponse {
    mode: string;
    results: DistanceMatrixResult[];
  }

  // Distance options
  export interface DistanceOptions {
    mode?: DistanceMode | 'straightline' | 'driving' | 'haversine';
    units?: DistanceUnits | 'miles' | 'kilometers';
    maxResults?: number;
    maxDistance?: number;
    maxDuration?: number;
    minDistance?: number;
    minDuration?: number;
    orderBy?: DistanceOrderBy | 'distance' | 'duration';
    sortOrder?: DistanceSortOrder | 'asc' | 'desc';
  }

  // Distance Job Types
  export interface DistanceJobResponse {
    id: number;
    identifier: string;
    status: 'ENQUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    name: string;
    created_at: string;
    origins_count: number;
    destinations_count: number;
    total_calculations: number;
  }

  export interface DistanceJobStatusResponse {
    data: {
      id: number;
      identifier: string;
      name: string;
      status: 'ENQUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      progress: number;
      download_url?: string;
      total_calculations: number;
      calculations_completed: number;
    };
  }

  export interface DistanceJobsListResponse {
    current_page: number;
    data: Array<{
      id: number;
      identifier: string;
      name: string;
      status: 'ENQUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      progress: number;
      total_calculations: number;
      calculations_completed: number;
      created_at: string;
    }>;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  }

  export interface DistanceJobOptions extends DistanceOptions {
    callbackUrl?: string;
  }

  // Geocode with distance options
  export interface GeocodeDistanceOptions {
    destinations?: CoordinateInput[];
    distanceMode?: DistanceMode | 'straightline' | 'driving' | 'haversine';
    distanceUnits?: DistanceUnits | 'miles' | 'kilometers';
    distanceMaxResults?: number;
    distanceMaxDistance?: number;
    distanceMaxDuration?: number;
    distanceMinDistance?: number;
    distanceMinDuration?: number;
    distanceOrderBy?: DistanceOrderBy | 'distance' | 'duration';
    distanceSortOrder?: DistanceSortOrder | 'asc' | 'desc';
  }

  // Enhanced geocoded address with distance info
  export interface GeocodedAddressWithDistance extends GeocodedAddress {
    destinations?: DistanceDestination[];
  }

  export interface SingleGeocodeResponseWithDistance extends SingleGeocodeResponse {
    results: GeocodedAddressWithDistance[];
  }

  export interface ReverseGeocodeResponseWithDistance extends ReverseGeocodeResponse {
    results: GeocodedAddressWithDistance[];
  }

  export interface AddressComponents {
    number?: string;
    predirectional?: string;
    prefix?: string;
    street?: string;
    suffix?: string;
    postdirectional?: string;
    secondaryunit?: string;
    secondarynumber?: string;
    formatted_street?: string;
    city?: string;
    county?: string;
    state?: string;
    zip?: string;
    country?: string;
    postal_code?: string; // Alternative to zip used in some API calls
  }

  export type AddressInputComponents = Pick<AddressComponents, "street" | "city" | "county" | "state" | "postal_code" | "country">

  export type GeocodeAccuracyType =
    | 'rooftop'
    | 'point'
    | 'range_interpolation'
    | 'nearest_rooftop_match'
    | 'street_center'
    | 'place'
    | 'state';

  export interface Location {
    lat: number;
    lng: number;
  }

  export interface Legislator {
    type: string;
    bio: {
      last_name: string;
      first_name: string;
      birthday: string;
      gender: string;
      party: string;
    };
    contact: {
      url: string;
      address: string;
      phone: string;
      contact_form?: string;
    };
    social: {
      rss_url?: string;
      twitter?: string;
      facebook?: string;
      youtube?: string;
      youtube_id?: string;
    };
    references: {
      bioguide_id?: string;
      thomas_id?: string;
      opensecrets_id?: string;
      lis_id?: string;
      cspan_id?: string;
      govtrack_id?: string;
      votesmart_id?: string;
      ballotpedia_id?: string;
      washington_post_id?: string;
      icpsr_id?: string;
      wikipedia_id?: string;
    };
    source: string;
  }

  export interface CongressionalDistrict {
    name: string;
    district_number: number;
    ocd_id: string;
    congress_number: string;
    congress_years: string;
    proportion: number;
    current_legislators: Legislator[];
  }

  export interface StateLegislativeDistrict {
    name: string;
    district_number: string;
    ocd_id: string;
    is_upcoming_state_legislative_district: boolean;
    proportion: number;
  }

  export interface StateLegislativeDistricts {
    senate?: StateLegislativeDistrict[];
    house?: StateLegislativeDistrict[];
  }

  export interface SchoolDistrict {
    name: string;
    lea_code: string;
    grade_low: string;
    grade_high: string;
  }

  export interface SchoolDistricts {
    elementary?: SchoolDistrict;
    secondary?: SchoolDistrict;
    unified?: SchoolDistrict;
  }

  export interface Timezone {
    name: string;
    utc_offset: number;
    observes_dst: boolean;
    abbreviation: string;
    source: string;
  }

  export interface MetroArea {
    name: string;
    area_code: string;
    type?: 'metropolitan' | 'micropolitan';
  }

  export interface StatisticalArea {
    name: string;
    area_code: string;
  }

  export interface Census {
    census_year: number;
    state_fips: string;
    county_fips: string;
    tract_code: string;
    block_code: string;
    block_group: string;
    full_fips: string;
    place: { name: string; fips: string; }
    metro_micro_statistical_area?: MetroArea;
    combined_statistical_area?: StatisticalArea;
    metropolitan_division?: StatisticalArea;
    county_subdivision: {
      name: string;
      fips: string;
      fips_class: {
        class_code: string;
        description: string;
      }
    }
    source: string;
  }

  export interface RecordType {
    code: string;
    description: string;
  }

  export interface CarrierRoute {
    id: string;
    description: string;
  }

  export interface FacilityCode {
    code: string;
    description: string;
  }

  export interface Zip4 {
    record_type: RecordType;
    carrier_route: CarrierRoute;
    building_or_firm_name: string;
    plus4: string[];
    zip9: string[];
    government_building: boolean;
    facility_code: FacilityCode;
    city_delivery: boolean;
    valid_delivery_area: boolean;
    exact_match: boolean;
  }

  export interface Fields {
    congressional_districts?: CongressionalDistrict[];
    state_legislative_districts?: StateLegislativeDistricts;
    school_districts?: SchoolDistricts;
    timezone?: Timezone;
    census?: {
      [key: string]: Census;
    }
    zip4?: Zip4;
    [key: string]: unknown;
  }

  export interface GeocodedAddress {
    address_components: AddressComponents;
    address_lines: string[];
    formatted_address: string;
    location: Location;
    accuracy: number;
    accuracy_type: GeocodeAccuracyType;
    source?: string;
    fields?: Fields;
  }

  export type FieldOption =
    | 'cd'
    | 'cd113'
    | 'cd114'
    | 'cd115'
    | 'cd116'
    | 'cd117'
    | 'cd118'
    | 'cd119'
    | 'stateleg'
    | 'stateleg-next'
    | 'school'
    | 'census'
    | 'census2000'
    | 'census2010'
    | 'census2011'
    | 'census2012'
    | 'census2013'
    | 'census2014'
    | 'census2015'
    | 'census2016'
    | 'census2017'
    | 'census2018'
    | 'census2019'
    | 'census2020'
    | 'census2021'
    | 'census2022'
    | 'census2023'
    | 'census2024'
    | 'acs-demographics'
    | 'acs-economics'
    | 'acs-families'
    | 'acs-housing'
    | 'acs-social'
    | 'zip4'
    | 'ffiec'
    | 'riding'
    | 'provriding'
    | 'provriding-next'
    | 'statcan'
    | 'timezone';

  export interface SingleGeocodeResponse {
    input: {
      address_components: AddressComponents;
      formatted_address: string;
    };
    results: GeocodedAddress[];
    _warnings?: string[];
  }

  export interface BatchGeocodeResponse<Q extends string | AddressInputComponents, T extends Array<Q> | Record<string, Q>> {
    results: T extends Array<Q> ? Array<{
      query: Q;
      response: SingleGeocodeResponse;
    }> : Record<keyof T, {
      response: SingleGeocodeResponse;
    }>;
  }

  export interface ReverseGeocodeResponse {
    results: GeocodedAddress[];
    _warnings?: string[];
  }

  export interface BatchReverseGeocodeResponse<Q extends string | [number, number], T extends Array<Q> | Record<string, Q>> {
    results: T extends Array<Q> ? Array<{
      query: Q;
      response: ReverseGeocodeResponse;
    }> : Record<keyof T, {
      response: ReverseGeocodeResponse;
    }>;
  }

  // List API types
  export interface ListResponse {
    id: number;
    file: {
      filename: string;
    };
  }

  export default class Geocodio {
    constructor(apiKey?: string, hostname?: string, apiVersion?: string);

    // Geocoding methods
    geocode(query: string | AddressInputComponents, fields?: FieldOption[], limit?: number): Promise<SingleGeocodeResponse>;
    geocode<Q extends string | AddressInputComponents, T extends Array<Q> | Record<string, Q>>(query: T, fields?: FieldOption[], limit?: number): Promise<BatchGeocodeResponse<Q, T>>;

    // Geocode with distance
    geocode(
      query: string | AddressInputComponents,
      fields?: FieldOption[],
      limit?: number,
      distanceOptions?: GeocodeDistanceOptions
    ): Promise<SingleGeocodeResponseWithDistance>;

    // Reverse geocoding methods
    reverse(query: string | [number, number], fields?: FieldOption[], limit?: number): Promise<ReverseGeocodeResponse>;
    reverse<Q extends string | [number, number], T extends Array<Q> | Record<string, Q>>(query: T, fields?: FieldOption[], limit?: number): Promise<BatchReverseGeocodeResponse<Q, T>>;

    // Reverse with distance
    reverse(
      query: string | [number, number],
      fields?: FieldOption[],
      limit?: number,
      distanceOptions?: GeocodeDistanceOptions
    ): Promise<ReverseGeocodeResponseWithDistance>;

    // Distance API - Single origin to multiple destinations (GET)
    distance(
      origin: CoordinateInput,
      destinations: CoordinateInput[],
      options?: DistanceOptions
    ): Promise<DistanceResponse>;

    // Distance Matrix API - Multiple origins × destinations (POST)
    distanceMatrix(
      origins: CoordinateInput[],
      destinations: CoordinateInput[],
      options?: DistanceOptions
    ): Promise<DistanceMatrixResponse>;

    // Async Distance Matrix Job methods
    createDistanceMatrixJob(
      name: string,
      origins: CoordinateInput[] | number,  // Array or list ID
      destinations: CoordinateInput[] | number,
      options?: DistanceJobOptions
    ): Promise<DistanceJobResponse>;

    distanceMatrixJobStatus(id: string | number): Promise<DistanceJobStatusResponse>;

    distanceMatrixJobs(page?: number): Promise<DistanceJobsListResponse>;

    getDistanceMatrixJobResults(id: string | number): Promise<DistanceMatrixResponse>;

    downloadDistanceMatrixJob(id: string | number, filePath: string): Promise<void>;

    deleteDistanceMatrixJob(id: string | number): Promise<void>;

    // List API
    list: {
      create(filename: string, direction: string, format: string, callback: string): Promise<ListResponse>;
      status(listId: number): Promise<unknown>;
      all(): Promise<unknown>;
      download(listId: number, output: string): Promise<unknown>;
      delete(listId: number): Promise<unknown>;
      deleteList(listId: number): Promise<unknown>; // Alias for delete
    };
  }
}
