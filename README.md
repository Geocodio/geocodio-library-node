# geocod.io Node library [![NPM version][npm-image]][npm-url]
> Library for performing forward and reverse address geocoding for addresses or coordinates in the US and Canada.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  * [Single geocoding](#single-geocoding)
  * [Batch geocoding](#batch-geocoding)
  * [Field appends](#field-appends)
  * [Address components](#address-components)
  * [Limit results](#limit-results)
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
