# geocod.io Node library [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Library for performing forward and reverse address geocoding for addresses or coordinates in the US and Canada.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Single geocoding](#single-geocoding)
  * [Batch geocoding](#batch-geocoding)
  * [Field appends](#field-appends)
  * [Address components](#address-components)
  * [Limit results](#limit-results)
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
// const geocoder = new Geocodio('YOUR_API_KEY', 'api-hipaa.geocod.io'); // optionally overwrite the API hostname

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

[npm-image]: https://badge.fury.io/js/geocodio-library-node.svg
[npm-url]: https://npmjs.org/package/geocodio-library-node
[travis-image]: https://travis-ci.org/Geocodio/geocodio-library-node.svg?branch=master
[travis-url]: https://travis-ci.org/Geocodio/geocodio-library-node
[daviddm-image]: https://david-dm.org/Geocodio/geocodio-library-node.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Geocodio/geocodio-library-node
