declare module 'geocodio-library-node' {
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
    place_fips: string;
    tract_code: string;
    block_code: string;
    block_group: string;
    full_fips: string;
    metro_micro_statistical_area?: MetroArea;
    combined_statistical_area?: StatisticalArea;
    metropolitan_division?: StatisticalArea;
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
    census?: Census;
    zip4?: Zip4;
    [key: string]: unknown;
  }

  export interface GeocodedAddress {
    address_components: AddressComponents;
    formatted_address: string;
    location: Location;
    accuracy: number;
    accuracy_type: GeocodeAccuracyType;
    source?: string;
    fields?: Fields;
  }

  export type FieldOption =
    | 'cd'
    | 'cd116'
    | 'cd115'
    | 'cd114'
    | 'cd113'
    | 'stateleg'
    | 'school'
    | 'timezone'
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
    | 'provriding'
    | 'riding'
    | 'zip4'
    | 'acs-demographics'
    | 'acs-economics'
    | 'acs-families'
    | 'acs-housing'
    | 'acs-social';

  export interface SingleGeocodeResponse {
    input: {
      address_components: AddressComponents;
      formatted_address: string;
    };
    results: GeocodedAddress[];
  }

  export interface BatchGeocodeResponse {
    results: Array<{
      query: string;
      response: SingleGeocodeResponse;
    }> | Record<string, {
      response: SingleGeocodeResponse;
    }>;
  }

  export interface ReverseGeocodeResponse {
    results: GeocodedAddress[];
  }

  export interface BatchReverseGeocodeResponse {
    results: Array<{
      query: string;
      response: ReverseGeocodeResponse;
    }> | Record<string, {
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

    geocode(query: string | AddressComponents, fields?: FieldOption[], limit?: number): Promise<SingleGeocodeResponse>;
    geocode(query: (string | AddressComponents)[] | Record<string, string | AddressComponents>, fields?: FieldOption[], limit?: number): Promise<BatchGeocodeResponse>;

    reverse(query: string | [number, number], fields?: FieldOption[], limit?: number): Promise<ReverseGeocodeResponse>;
    reverse(query: (string | [number, number])[] | Record<string, string | [number, number]>, fields?: FieldOption[], limit?: number): Promise<BatchReverseGeocodeResponse>;

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
