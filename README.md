# URI adapter for Integreat

Adapter to support URI templates in
[Integreat](https://github.com/integreat-io/integreat).

[![npm Version](https://img.shields.io/npm/v/integreat-adapter-uri.svg)](https://www.npmjs.com/package/integreat-adapter-uri)
[![Maintainability](https://api.codeclimate.com/v1/badges/8479515be4b8f560d0a5/maintainability)](https://codeclimate.com/github/integreat-io/integreat-adapter-uri/maintainability)

## Getting started

### Prerequisits

Requires node v18 and Integreat v1.0.

### Installing and using

Install from npm:

```
npm install integreat-adapter-uri
```

Example of use:

```javascript
import integreat from 'integreat'
import httpTransporter from 'integreat-transporter-http'
import uriAdapter from 'integreat-adapter-uri'
import defs from './config.js'

const great = Integreat.create(defs, {
  transporters: { http: httpTransporter },
  adapters: { uri: uriAdapter },
})

// ... and then dispatch actions as usual
```

Example service configuration:

```javascript
{
  id: 'store',
  transporter: 'http',
  adapters: ['uri'],
  options: {,
  endpoints: [
    { options: { uri: 'https://api.com/{payload.id}' } } // Will be expanded to e.g. https://api.com/123
  ]
}
```

### URI transformer

The package also includes a transformer, that works exactly like the adapter,
except it is intended for use in mutation pipelines with
`{ $transform: 'uri' }`. You may use it like this:

Example of use:

```javascript
import integreat from 'integreat'
import httpTransporter from 'integreat-transporter-http'
import uriTransformer from 'integreat-adapter-uri/transformer.js'
import defs from './config.js'

const great = Integreat.create(defs, {
  transporters: { http: httpTransporter },
  transformers: { uri: uriTransformer },
})

// In a mutation pipeline:

const mutation = ['meta.options.uri', { $transform: 'uri' }]
```

### Running the tests

The tests can be run with `npm test`.

## Contributing

Please read
[CONTRIBUTING](https://github.com/integreat-io/integreat-adapter-uri/blob/master/CONTRIBUTING.md)
for details on our code of conduct, and the process for submitting pull
requests.

## License

This project is licensed under the ISC License - see the
[LICENSE](https://github.com/integreat-io/integreat-adapter-uri/blob/master/LICENSE)
file for details.
