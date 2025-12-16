# geocod.io Node library [![NPM version][npm-image]][npm-url]
> Library for performing forward and reverse address geocoding for addresses or coordinates in the US and Canada, with support for distance calculations.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Single geocoding](#single-geocoding)
  * [Batch geocoding](#batch-geocoding)
  * [Field appends](#field-appends)
  * [Address components](#address-components)
  * [Limit results](#limit-results)
  * [Distance calculation](#distance-calculation)
  * [Distance matrix](#distance-matrix)
  * [Async distance jobs](#async-distance-jobs)
  * [Geocoding with distance](#geocoding-with-distance)
  * [Lists](#lists)
     * [Create A List](#create-a-list)
     * [Get List Status](#get-list-status)
     * [Get All Lists](#get-all-lists)
     * [Download A List](#download-a-list)
     * [Delete A List](#delete-a-list)
- [Testing](#testing)
- [Changelog](#changelog)
- [Security](#security)
- [License](#license)

<!-- tocstop -->

## Installation

You can install the package via npm or yarn (pick one):

```bash
$ npm install --save geocodio-library-node
$ yarn add geocodio-library-node
```

## Usage

> Don't have an API key yet? Sign up at [https://dash.geocod.io](https://dash.geocod.io) to get an API key. The first 2,500 lookups per day are free.

### Single geocoding

```javascript
const Geocodio = require('geocodio-library-node');
const geocoder = new Geocodio('YOUR_API_KEY');
// const geocoder = new Geocodio('YOUR_API_KEY', 'api.enterprise.geocod.io'); // optionally overwrite the API hostname

geocoder
  .geocode('1109 N Highland St, Arlington, VA')
  .then(response => {
    console.log(response);
  })
    /*
    response => {
      "input": {
        "address_components": {
          "number": "1109",
          "predirectional": "N",
          "street": "Highland",
          "suffix": "St",
          "formatted_street": "N Highland St",
          "city": "Arlington",
          "state": "VA",
          "country": "US"
        },
        "formatted_address": "1109 N Highland St, Arlington, VA"
      },
      "results": [
        {
          "address_components": {
            "number": "1109",
            "predirectional": "N",
            "street": "Highland",
            "suffix": "St",
            "formatted_street": "N Highland St",
            "city": "Arlington",
            "county": "Arlington County",
            "state": "VA",
            "zip": "22201",
            "country": "US"
          },
          "formatted_address": "1109 N Highland St, Arlington, VA 22201",
          "location": {
            "lat": 38.886672,
            "lng": -77.094735
          },
          "accuracy": 1,
          "accuracy_type": "rooftop",
          "source": "Arlington"
        },
        {
          "address_components": {
            "number": "1109",
            "predirectional": "N",
            "street": "Highland",
            "suffix": "St",
            "formatted_street": "N Highland St",
            "city": "Arlington",
            "county": "Arlington County",
            "state": "VA",
            "zip": "22201",
            "country": "US"
          },
          "formatted_address": "1109 N Highland St, Arlington, VA 22201",
          "location": {
            "lat": 38.886665,
            "lng": -77.094733
          },
          "accuracy": 1,
          "accuracy_type": "rooftop",
          "source": "Virginia Geographic Information Network (VGIN)"
        }
      ]
    }
    */
  .catch(error => {
    console.error(error);
  });

geocoder.reverse('38.9002898,-76.9990361')
  .then(response => { ... })
  .catch(err => { ... });

geocoder.reverse([38.9002898, -76.9990361])
  .then(response => { ... })
  .catch(err => { ... });
```

> Note: You can read more about accuracy scores, accuracy types, input formats and more at https://www.geocod.io/docs/

### Batch geocoding

To batch geocode, simply pass an array of addresses or coordinates instead of a single string

```javascript
geocoder.geocode([
      '1109 N Highland St, Arlington VA',
      '525 University Ave, Toronto, ON, Canada',
      '4410 S Highway 17 92, Casselberry FL',
      '15000 NE 24th Street, Redmond WA',
      '17015 Walnut Grove Drive, Morgan Hill CA'
  ])
  .then(response => { ... })
  .catch(err => { ... });

geocoder.reverse([
      '35.9746000,-77.9658000',
      '32.8793700,-96.6303900',
      '33.8337100,-117.8362320',
      '35.4171240,-80.6784760'
  ])
  .then(response => { ... })
  .catch(err => { ... });

// Optionally supply a custom key that will be returned along with results
geocoder.geocode({
      'MyId1': '1109 N Highland St, Arlington VA',
      'MyId2': '525 University Ave, Toronto, ON, Canada',
      'MyId3': '4410 S Highway 17 92, Casselberry FL',
      'MyId4': '15000 NE 24th Street, Redmond WA',
      'MyId5': '17015 Walnut Grove Drive, Morgan Hill CA'
  })
  .then(response => { ... })
  .catch(err => { ... });
```

### Field appends

Geocodio allows you to append additional data points such as congressional districts, census codes, timezone, ACS survey results and [much much more](https://www.geocod.io/docs/#fields).

To request additional fields, simply supply them as an array as the second parameter

```javascript
geocoder.geocode(
      [
          '1109 N Highland St, Arlington VA',
          '525 University Ave, Toronto, ON, Canada'
      ],
      [ 'cd', 'timezone' ]
  )
  .then(response => { ... })
  .catch(err => { ... });

geocoder.reverse('38.9002898,-76.9990361', ['census2010'])
  .then(response => { ... })
  .catch(err => { ... });
```

### Address components

For forward geocoding requests it is possible to supply [individual address components](https://www.geocod.io/docs/#single-address) instead of a full address string. This works for both single and batch geocoding requests.

```javascript
geocoder.geocode({
      street: '1109 N Highland St',
      city: 'Arlington',
      state: 'VA',
      postal_code: '22201'
  })
  .then(response => { ... })
  .catch(err => { ... });

geocoder.geocode([
      {
          street: '1109 N Highland St',
          city: 'Arlington',
          state: 'VA'
      },
      {
          street: '525 University Ave',
          city: 'Toronto',
          state: 'ON',
          country: 'Canada',
      },
  ])
  .then(response => { ... })
  .catch(err => { ... });
```

### Limit results

Optionally limit the number of maximum geocoding results by using the third parameter on `geocode(...)` or `reverse(...)`

```javascript
// Only get the frst result
geocoder.geocode('1109 N Highland St, Arlington, VA', [], 1)
  .then(response => { ... })
  .catch(err => { ... });

// Return up to 5 geocoding results
geocoder.reverse('38.9002898,-76.9990361', ['timezone'], 5)
  .then(response => { ... })
  .catch(err => { ... });
```

### Distance calculations

Calculate distances from a single origin to multiple destinations, or compute full distance matrices.

#### Coordinate format with custom IDs

You can add custom identifiers to coordinates using the `lat,lng,id` format. The ID will be returned in the response, making it easy to match results back to your data:

```javascript
// String format with ID
'37.7749,-122.4194,warehouse_1'

// Array format with ID
[37.7749, -122.4194, 'warehouse_1']

// Object format with ID
{ lat: 37.7749, lng: -122.4194, id: 'warehouse_1' }

// Using the Coordinate class
new Coordinate(37.7749, -122.4194, 'warehouse_1')

// The ID is returned in the response:
/*
{
  "query": "37.7749,-122.4194,warehouse_1",
  "location": [37.7749, -122.4194],
  "id": "warehouse_1",
  "distance_miles": 3.2,
  "distance_km": 5.1
}
*/
```

#### Distance mode and units

The SDK provides enums for type-safe distance configuration:

```javascript
const {
  Geocodio,
  Coordinate,
  DistanceMode,
  DistanceUnits,
  DistanceOrderBy,
  DistanceSortOrder
} = require('geocodio-library-node');

// Available modes
DistanceMode.Straightline  // Default - great-circle (as the crow flies)
DistanceMode.Driving       // Road network routing with duration
DistanceMode.Haversine     // Alias for Straightline

// Available units
DistanceUnits.Miles        // Default
DistanceUnits.Kilometers   // or DistanceUnits.Km

// Sorting options
DistanceOrderBy.Distance   // Default
DistanceOrderBy.Duration

DistanceSortOrder.Asc      // Default
DistanceSortOrder.Desc
```

> **Note:** The default mode is `straightline` (great-circle distance). Use `DistanceMode.Driving` if you need road network routing with duration estimates.

#### Add distance to geocoding requests

You can add distance calculations to existing geocode or reverse geocode requests. Each geocoded result will include a `destinations` array with distances to each destination.

```javascript
const geocoder = new Geocodio('YOUR_API_KEY');

// Geocode an address and calculate distances to store locations
geocoder.geocode(
    '1600 Pennsylvania Ave NW, Washington DC',
    [],     // fields
    null,   // limit
    {       // distance options
      destinations: [
        '38.9072,-77.0369,store_dc',
        '39.2904,-76.6122,store_baltimore',
        '39.9526,-75.1652,store_philly'
      ],
      distanceMode: DistanceMode.Driving,
      distanceUnits: DistanceUnits.Miles
    }
  )
  .then(response => {
    console.log(response.results[0].destinations);
    /*
    [
      {
        "query": "38.9072,-77.0369,store_dc",
        "location": [38.9072, -77.0369],
        "id": "store_dc",
        "distance_miles": 0.8,
        "distance_km": 1.3,
        "duration_seconds": 180
      },
      ...
    ]
    */
  });

// Reverse geocode with distances
geocoder.reverse(
    '38.8977,-77.0365',
    [],
    null,
    {
      destinations: ['38.9072,-77.0369,capitol', '38.8895,-77.0353,monument'],
      distanceMode: DistanceMode.Straightline
    }
  )
  .then(response => { ... });

// With filtering - find nearest 3 stores within 50 miles
geocoder.geocode(
    '1600 Pennsylvania Ave NW, Washington DC',
    [],
    null,
    {
      destinations: [
        '38.9072,-77.0369,store_1',
        '39.2904,-76.6122,store_2',
        '39.9526,-75.1652,store_3',
        '40.7128,-74.0060,store_4'
      ],
      distanceMode: DistanceMode.Driving,
      distanceMaxResults: 3,
      distanceMaxDistance: 50.0,
      distanceOrderBy: DistanceOrderBy.Distance,
      distanceSortOrder: DistanceSortOrder.Asc
    }
  )
  .then(response => { ... });
```

#### Single origin to multiple destinations

```javascript
const geocoder = new Geocodio('YOUR_API_KEY');

// Calculate distances from one origin to multiple destinations
geocoder.distance(
    '37.7749,-122.4194,headquarters',  // Origin with ID
    [
      '37.7849,-122.4094,customer_a',
      '37.7949,-122.3994,customer_b',
      '37.8049,-122.4294,customer_c'
    ]
  )
  .then(response => {
    console.log(response);
    /*
    {
      "origin": {
        "query": "37.7749,-122.4194,headquarters",
        "location": [37.7749, -122.4194],
        "id": "headquarters"
      },
      "destinations": [
        {
          "query": "37.7849,-122.4094,customer_a",
          "location": [37.7849, -122.4094],
          "id": "customer_a",
          "distance_miles": 0.9,
          "distance_km": 1.4
        },
        ...
      ]
    }
    */
  });

// Use driving mode for road network routing (includes duration)
geocoder.distance(
    '37.7749,-122.4194',
    ['37.7849,-122.4094'],
    { mode: DistanceMode.Driving }
  )
  .then(response => {
    console.log(response.destinations[0].duration_seconds); // e.g., 180
  });

// With all filtering and sorting options
geocoder.distance(
    '37.7749,-122.4194,warehouse',
    [
      '37.7849,-122.4094,store_1',
      '37.7949,-122.3994,store_2',
      '37.8049,-122.4294,store_3'
    ],
    {
      mode: DistanceMode.Driving,
      units: DistanceUnits.Kilometers,
      maxResults: 2,
      maxDistance: 10.0,
      orderBy: DistanceOrderBy.Distance,
      sortOrder: DistanceSortOrder.Asc
    }
  )
  .then(response => { ... });

// Using Coordinate class
const origin = new Coordinate(37.7749, -122.4194, 'warehouse');
const destinations = [
  new Coordinate(37.7849, -122.4094, 'store_1'),
  new Coordinate(37.7949, -122.3994, 'store_2')
];

geocoder.distance(origin, destinations)
  .then(response => { ... });

// Array format for coordinates (with or without ID)
geocoder.distance(
    [37.7749, -122.4194],                    // Without ID
    [[37.7849, -122.4094, 'dest_1']]         // With ID as third element
  )
  .then(response => { ... });
```

#### Distance matrix (multiple origins × destinations)

```javascript
// Calculate full distance matrix with custom IDs
geocoder.distanceMatrix(
    [
      '37.7749,-122.4194,warehouse_sf',
      '37.8049,-122.4294,warehouse_oak'
    ],
    [
      '37.7849,-122.4094,customer_1',
      '37.7949,-122.3994,customer_2'
    ]
  )
  .then(response => {
    console.log(response);
    /*
    {
      "mode": "driving",
      "results": [
        {
          "origin": {
            "query": "37.7749,-122.4194,warehouse_sf",
            "location": [37.7749, -122.4194],
            "id": "warehouse_sf"
          },
          "destinations": [
            {
              "query": "37.7849,-122.4094,customer_1",
              "location": [37.7849, -122.4094],
              "id": "customer_1",
              "distance_miles": 0.9,
              "distance_km": 1.4
            },
            ...
          ]
        },
        {
          "origin": { ..., "id": "warehouse_oak" },
          "destinations": [...]
        }
      ]
    }
    */
  });

// With driving mode and kilometers
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    ['37.7849,-122.4094'],
    { mode: DistanceMode.Driving, units: DistanceUnits.Kilometers }
  )
  .then(response => { ... });

// Using object format
const origins = [
  { lat: 37.7749, lng: -122.4194, id: 'warehouse_sf' },
  { lat: 37.8049, lng: -122.4294, id: 'warehouse_oak' }
];

const destinations = [
  { lat: 37.7849, lng: -122.4094, id: 'customer_1' },
  { lat: 37.7949, lng: -122.3994, id: 'customer_2' }
];

geocoder.distanceMatrix(origins, destinations)
  .then(response => { ... });
```

#### Nearest mode (find closest destinations)

```javascript
// Find up to 2 nearest destinations from each origin
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    ['37.7849,-122.4094', '37.7949,-122.3994', '37.8049,-122.4294'],
    { maxResults: 2 }
  )
  .then(response => { ... });

// Filter by maximum distance (in miles or km depending on units)
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    [...destinations],
    { maxDistance: 2.0 }
  )
  .then(response => { ... });

// Filter by minimum and maximum distance
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    [...destinations],
    { minDistance: 1.0, maxDistance: 10.0 }
  )
  .then(response => { ... });

// Filter by duration (seconds, driving mode only)
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    [...destinations],
    {
      mode: DistanceMode.Driving,
      maxDuration: 300,  // 5 minutes
      minDuration: 60    // 1 minute minimum
    }
  )
  .then(response => { ... });

// Sort by duration descending
geocoder.distanceMatrix(
    ['37.7749,-122.4194'],
    [...destinations],
    {
      mode: DistanceMode.Driving,
      maxResults: 5,
      orderBy: DistanceOrderBy.Duration,
      sortOrder: DistanceSortOrder.Desc
    }
  )
  .then(response => { ... });
```

#### Async distance matrix jobs

For large distance matrix calculations, use async jobs that process in the background.

```javascript
// Create a new distance matrix job
geocoder.createDistanceMatrixJob(
    'My Distance Calculation',
    ['37.7749,-122.4194', '37.8049,-122.4294'],
    ['37.7849,-122.4094', '37.7949,-122.3994'],
    {
      mode: DistanceMode.Driving,
      units: DistanceUnits.Miles,
      callbackUrl: 'https://example.com/webhook'  // Optional
    }
  )
  .then(response => {
    console.log(response);
    // { id: 123, status: 'ENQUEUED', total_calculations: 4 }
  });

// Or use list IDs from previously uploaded lists
geocoder.createDistanceMatrixJob(
    'Distance from List',
    12345,       // Origins list ID
    67890,       // Destinations list ID
    { mode: DistanceMode.Straightline }
  )
  .then(response => { ... });

// Check job status
geocoder.distanceMatrixJobStatus(123)
  .then(response => {
    console.log(response.data.status);   // 'ENQUEUED', 'PROCESSING', 'COMPLETED', or 'FAILED'
    console.log(response.data.progress); // 0-100
  });

// List all jobs (paginated)
geocoder.distanceMatrixJobs()
  .then(response => { ... });

geocoder.distanceMatrixJobs(2)  // Page 2
  .then(response => { ... });

// Get results when complete (same format as distanceMatrix response)
geocoder.getDistanceMatrixJobResults(123)
  .then(response => {
    console.log(response.results);
  });

// Or download to a file for very large results
geocoder.downloadDistanceMatrixJob(123, 'results.json')
  .then(() => console.log('Downloaded!'));

// Delete a job
geocoder.deleteDistanceMatrixJob(123)
  .then(() => console.log('Deleted!'));
```

### Lists

List methods are nested within `.list`. To access list methods, be sure to to run `geocoder.list` and then include the task method you would like to utilize. 

#### Create A List

To create and upload a new list using an existing .CSV file, run `geocoder.list.create(...)` and pass in your filename/file path.

You may also need to pass in some additional parameters:
* Direction: Use the default string `"forward"`.
* Format: Use the default string `"{{A}} {{B}} {{C}} {{D}}"`
* Callback: A callback URL. 

```javascript
geocoder.list.create(
  `${__dirname}/stubs/sample_list.csv`,
  "forward",
  "{{A}} {{B}} {{C}} {{D}}",
  "https://example.com/my-callback"
)
```

#### Get List Status

To retrieve the current status of your list, pass your list's ID into `geocoder.list.status(...)`. 

```javascript
geocoder.list.status(1234567)
  .then(response => { ... })
  .catch(err => { ... });
```

#### Get All Lists

To retrieve all available lists, run `geocoder.list.all()`. You do not need to pass anything into this function. 

```javascript
geocoder.list.all()
  .then(response => { ... })
  .catch(err => { ... });
```

#### Download A List

To download a list, run `geocoder.list.download(...)` and pass in the ID of the list you'd like to download, as well as a string that includes a filename. Be sure to include a `.csv` file extension. 

```javascript
geocoder.list.download(1234567, "geocoded_file.csv")
   .then(response => { ...})
   .catch(err => { ... });
```

#### Delete A List

To delete a list, run `geocoder.list.deleteList(...)` and pass in the ID of the list you'd like to delete. 

```javascript
geocoder.list.delete(1234567)
  .then(response => { ... })
  .catch(err => { ... });
```

## Testing

```bash
$ npm test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security

If you discover any security related issues, please email security@geocod.io instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

[npm-image]: https://img.shields.io/npm/v/geocodio-library-node
[npm-url]: https://npmjs.org/package/geocodio-library-node
