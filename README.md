# ocpi-tool

A tool for exporting data from OCPI platforms

## The vision

A lot of parties are interested in data on charging station usage. These parties range from public bodies to research institutions to commercial business analysis firms.

To get access to this data, they often request custom APIs to be developed by Charge Point Operators (CPOs), or request direct access to the CPO's database systems. These methods work, but they have serious drawbacks. They amount to a lot of extra work for the CPO's IT staff and make it easy for sensitive personally identifiable data to be over-shared.

This tool aims to enable CPOs to run easy, secure data exports from their OCPI interface.

OCPI is a network protocol used between CPOs and other EV charging market parties to facilitate roaming integrations. When you use an app or card from the one company to charge on a charging station operated by another company, these companies may well be using OCPI under the hood to make your charge session happen. OCPI is developed by the [EV Roaming Foundation](https://evroaming.org/) and widely implemented by EV charging companies in both Europe and North America.

While doing a full OCPI integration with a data consumer is a lot of work on their end as well, this tool will enable CPOs to easily create scripts that use the OCPI interface as a source for an ETL ([Extract-Transform-Load](https://en.wikipedia.org/wiki/Extract,_transform,_load)) pipeline that can deliver properly cleaned and formatted data to external parties.

The advantage of the tool for the data consumer is that they can receive data in whatever custom format they ask from the CPO, and they don't have to do a full OCPI integration or any other programmatic integration with the CPO. The advantage of the tool for the CPO is that they don't have to add new interfaces to their core systems for new types of data exports; instead they can use the existing OCPI interface, avoiding tight-coupling their  data exports to their data exports.

## How it works

###

1. The CPO sets up an OCPI connection for the partner interested in their data. The other partner doesn't actually have to use this connection; it just exists so we have a way to track access happening for them

2. The CPO runs the tool to set it up to extract data for the consumer partner:

```bash
ocpi  login http://example.org/url-to-version-endpoint --token token-for-partner-from-step-1
```

3. The CPO extracts all data from a given module

```bash
ocpi get sessions
```

While just dumping a bunch of JSON to your console is not immediately useful by itself, it will come to life when you start piping it to further shell tools. The [`jq`](https://stedolan.github.io/jq/) tool will be especially useful. Like in this command to compute the average charge session duration:

```bash
ocpi get sessions | jq -s 'map(select(has("end_datetime")) | (.end_datetime | fromdate) - (.start_datetime | fromdate)) | add / length'
```

## How it hopefully will work in the future

This is a simple proof of concept for now.

Things we have to add:

  * Built-in filtering of potential PII, by having a default profile of fields that can be safely exported. Other fields should be withheld from exports unless specifically enabled

Things we hope to add:

  * Joining data, like adding charging station information to exported charging session objects

  * Persistent state, so you can export all data since the last export, or run weekly exports

  * A continuous export mode, where the tool keeps indefinitely and streams new data to standard out or writes periodic export files

  * Support for more output formats, like CSV, or documentation of ways to use `jq` to make these

  * Whatever you think of. Pull requests welcome!

## Copyright and acknowledgements

The contents of this repository are © 2023 EV Roaming Foundation, except the contents of [src/schemas](src/schemas), which are based on those in [ChargeMap's OCPI implementation](https://github.com/ChargeMap/ocpi-protocol). The parts of which the EV Roaming Foundation holds the copyright are licensed to you under the [MIT license](LICENSE).
