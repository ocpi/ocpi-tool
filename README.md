# ocpi-tool

A tool for exporting data from OCPI platforms

## The vision

A lot of parties are interested in data on charging station usage. These parties range from public bodies to research institutions to commercial business analysis firms.

To get access to this data, they often request custom APIs to be developed by Charge Point Operators (CPOs), or request direct access to the CPO's database systems. These methods work, but they have serious drawbacks. They amount to a lot of extra work for the CPO's IT staff and make it easy for sensitive personally identifiable data to be over-shared.

This tool aims to enable CPOs to run easy, secure data exports from their OCPI interface.

OCPI is a network protocol used between CPOs and other EV charging market parties to facilitate roaming integrations. When you use an app or card from the one company to charge on a charging station operated by another company, these companies may well be using OCPI under the hood to make your charge session happen. OCPI is developed by the [EV Roaming Foundation](https://evroaming.org/) and widely implemented by EV charging companies in both Europe and North America.

While doing a full OCPI integration with a data consumer is a lot of work on their end as well, this tool will enable CPOs to easily create scripts that use the OCPI interface as a source for an ETL ([Extract-Transform-Load](https://en.wikipedia.org/wiki/Extract,_transform,_load)) pipeline that can deliver properly cleaned and formatted data to external parties.

The advantage of the tool for the data consumer is that they can receive data in whatever custom format they ask from the CPO, and they don't have to do a full OCPI integration or any other programmatic integration with the CPO. The advantage of the tool for the CPO is that they don't have to add new interfaces to their core systems for new types of data exports; instead they can use the existing OCPI interface, avoiding tight-coupling their data exports to their business logic.

## How it works

### Getting started

First clone the repo:

```bash
git clone git@github.com:ocpi/ocpi-tool.git
```

Assuming you have npm version 18 or later, you can build the tool like this:

```bash
npm ci

npm run build
```

And then you can run the tool like this:

```bash
node dist/index.js
```

If you run that you should see this output:

```
Usage: index [options] [command]

Options:
  -h, --help              display help for command

Commands:
  login [options] <url>   Log in to an OCPI platform
  get [options] <module>  Fetch a page of data of a certain OCPI module
  help [command]          display help for command
```

If you want to be able to use the tool as a globally installed `ocpi` command, you can do that like this:

```
npm ci && npm run build && npm pack

npm i ocpi-tool-0.0.1.tgz -g
```

If you don't do that, you'll have to read `node dist/index.js` where it says `ocpi` in the example commands below.

### Basic usage

1. The CPO sets up an OCPI connection for the partner interested in their data. The other partner doesn't actually have to use this connection; it just exists so we have a way to track access happening for them

2. The CPO runs the tool to set it up to extract data for the consumer partner:

```bash
ocpi  login http://example.org/url-to-version-endpoint --party-id XX-YYY --token token-for-partner-from-step-1
```

where `XX-YYY` is replaced by a party ID for the party consuming the output of the tool. OCPI, at least in version 2.2.1, requires a party ID to be presented in every request so the tool needs one in order to contact the platform it is getting data from.

3. The CPO extracts all data from a given module

```bash
ocpi get sessions
```

While just dumping a bunch of JSON to your console is not immediately useful by itself, it will come to life when you start piping it to further shell tools. The [`jq`](https://stedolan.github.io/jq/) tool will be especially useful. Like in this command to compute the average charge session duration:

```bash
ocpi get sessions | jq -s 'map(select(has("end_datetime")) | (.end_datetime | fromdate) - (.start_datetime | fromdate)) | add / length'
```

### Privacy filtering

You'll notice that when you run `ocpi get sessions`, or `ocpi get` with some other module name, a lot of fields show with `"#NA"` as their value. In fact, the output of the command is hardly useful because it consists mostly of `"#NA"` strings.

This happens because by default, the value of every field that the author of the tool deemed privacy sensitive is blanked out by overwriting it with `"#NA"`.

In order to get a useful export for your purposes, you have to actively disable the privacy filter for specific fields.

So for example, while `ocpi get sessions` may return this:

```json
{
  "id": "4283da431b2a4f8c9f421eaa53d0428b",
  "kwh": "#NA",
  "status": "#NA",
  "auth_id": "#NA",
  "currency": "EUR",
  "total_cost": "#NA",
  "auth_method": "WHITELIST",
  "end_datetime": "#NA",
  "last_updated": "#NA",
  "start_datetime": "#NA",
  "charging_periods": [
    {
      "dimensions": [
        {
          "type": "#NA",
          "volume": "#NA"
        }
      ],
      "start_date_time": "#NA"
    }
  ]
}
```

`ocpi get --privacy-pass start_datetime,end_datetime,charging_periods.dimensions.type sessions` will unblank the fields named as the argument to the `--privacy-pass` flag:

```json
{
  "id": "4283da431b2a4f8c9f421eaa53d0428b",
  "kwh": "#NA",
  "status": "#NA",
  "auth_id": "#NA",
  "currency": "EUR",
  "total_cost": "#NA",
  "auth_method": "WHITELIST",
  "end_datetime": "2023-01-13T12:44:52Z",
  "last_updated": "#NA",
  "start_datetime": "2023-01-13T12:44:41Z",
  "charging_periods": [
    {
      "dimensions": [
        {
          "type": "ENERGY",
          "volume": "#NA"
        }
      ],
      "start_date_time": "#NA"
    }
  ]
}
```

Note that in naming nested fields, you don't have to care about arrays. The `charging_periods.dimensions.type` privacy pass instruction works even though `charging_periods` and `dimensions` contain arrays actually.

Also you can totally unblank whole nested structures, like `charging_periods.dimensions` here which is an array of objects:

```bash
ocpi get --privacy-pass start_datetime,end_datetime,charging_periods.dimensions sessions
```

```json
{
  "id": "4283da431b2a4f8c9f421eaa53d0428b",
  "kwh": "#NA",
  "status": "#NA",
  "auth_id": "#NA",
  "currency": "EUR",
  "total_cost": "#NA",
  "auth_method": "WHITELIST",
  "end_datetime": "2023-01-13T12:44:52Z",
  "last_updated": "#NA",
  "start_datetime": "2023-01-13T12:44:41Z",
  "charging_periods": [
    {
      "dimensions": [
        {
          "type": "ENERGY",
          "volume": 16
        }
      ],
      "start_date_time": "#NA"
    }
  ]
}
```

If you feel your use case does not warrant any concern about legal obligations of Privacy by Design as they exist in modern civilized jurisdictions nor about the fines of up to 10% of yearly company revenue that may be the consequence of data leaks, then you can also unblank everything at once thus:

```
ocpi get --privacy-pass . sessions
```

```json
{
  "id": "4283da431b2a4f8c9f421eaa53d0428b",
  "kwh": 16,
  "status": "COMPLETED",
  "auth_id": "IEZZZC12E46L89",
  "currency": "EUR",
  "total_cost": 0,
  "auth_method": "WHITELIST",
  "end_datetime": "2023-01-13T12:44:52Z",
  "last_updated": "2023-01-13T12:44:52Z",
  "start_datetime": "2023-01-13T12:44:41Z",
  "charging_periods": [
    {
      "dimensions": [
        {
          "type": "ENERGY",
          "volume": 16
        }
      ],
      "start_date_time": "2023-01-13T12:44:42Z"
    }
  ]
}
```

## How it hopefully will work in the future

This is a simple proof of concept for now.

OCPI 2.2.1 support is not really tested. A known issue is that the cost fields in CDRs and sessions won't work because their types are different in 2.1.1 and 2.2.1 and the privacy filter can't deal with that yet.

Things we hope to add:

  * Finish and test OCPI 2.2.1 support

  * Publishing it to NPM

  * Cleaner error messages to the console

  * Joining data, like adding charging station information to exported charging session objects

  * Persistent state, so you can export all data since the last export, or run weekly exports

  * A continuous export mode, where the tool keeps running indefinitely and streams new data to standard out or writes periodic export files

  * Support for more output formats, like CSV, or documentation of ways to use `jq` to make these

  * Whatever you think of. Pull requests welcome!

## Copyright and acknowledgements

The contents of this repository are © 2023 EV Roaming Foundation, except the contents of [src/schemas](src/schemas), which are based on those in [ChargeMap's OCPI implementation](https://github.com/ChargeMap/ocpi-protocol). The parts of which the EV Roaming Foundation holds the copyright are licensed to you under the [MIT license](LICENSE).
