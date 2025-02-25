declare module 'geocodio-library-node' {
  export interface AddressComponents {
    number?: string;
    predirectional?: string;
    street?: string;
    suffix?: string;
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
    | 'street'
    | 'intersection'
    | 'city'
    | 'state'
    | 'county';

  export interface GeocodedAddress {
    address_components: AddressComponents;
    formatted_address: string;
    location: {
      lat: number;
      lng: number;
    };
    accuracy: number;
    accuracy_type: GeocodeAccuracyType;
    source?: string;
    fields?: Fields;
  }

  export interface Fields {
    timezone?: {
      abbreviation: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export interface SingleGeocodeResponse {
    input: {
      address_components: AddressComponents;
      formatted_address: string;
    };
    results: GeocodedAddress[];
  }

  export interface BatchGeocodeResponse {
    results: {
      [key: string]: {
        response: SingleGeocodeResponse;
      };
    };
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

    geocode(query: string | AddressComponents, fields?: string[], limit?: number): Promise<SingleGeocodeResponse>;
    geocode(query: (string | AddressComponents)[] | Record<string, string | AddressComponents>, fields?: string[], limit?: number): Promise<BatchGeocodeResponse>;

    reverse(query: string | [number, number], fields?: string[], limit?: number): Promise<SingleGeocodeResponse>;
    reverse(query: (string | [number, number])[], fields?: string[], limit?: number): Promise<BatchGeocodeResponse>;

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
