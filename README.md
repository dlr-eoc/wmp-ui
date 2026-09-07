![ukis-logo](ukis-logo.png) UKIS Workflow Management Platform UI (WMP-UI)
=========================================

## WMP-UI

The WMP-UI is the Angular-based user interface for the UKIS Workflow Management Platform (WMP). It provides a modern and intuitive interface for deploying, executing, and monitoring business processes built on the Operaton (Camunda 7) process engine.

## Technology Stack

- Angular framework
- TypeScript
- HTML5/CSS3
- RESTful API communication with WMP backend

## Prerequisites

- Node.js >= (^20.19.0 || ^22.12.0 || ^24.0.0)
- npm >= 9
- Git (for cloning the repository)

## Getting started

### Local development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wmp-ui
   ```

2. Install dependencies:
   ```npm install```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser at http://localhost:4200
   - The application will automatically reload if you change any source files.

### Kerberos
If you want to use Kerberos, please make sure, your browser is properly configured. In a Firefox you need to visit
`about:config` and alter the values for the following properties:

```
network.negotiate-auth.delegation-uris=<WMP-Server-URL>
network.negotiate-auth.trusted-uris=<WMP-Server-URL>
```

## Development

### Contributing

The German Aerospace Center (Deutsches Zentrum für Luft- und Raumfahrt e.V.) and 
Werum Software & Systems AG welcomes contributions from the community. For more detailed 
information, see our guide on [contributing](CONTRIBUTING.md) if you're interested in 
getting involved.

Commercial support can be requested from the German company Werum Software & Systems AG. For further details, please contact our sales support team at sales@werum.de.

### Troubleshooting

If you run into any problems, please check the [ukis-wmp-ui troubleshooting guide](TROUBLESHOOTING.md)

## License

The source files in this repository are made available under the 
[Apache License Version 2.0](./LICENSE).

WMP-UI uses and includes third-party dependencies published under various licenses. By downloading 
and using WMP-UI artifacts, you agree to their terms and conditions.

## What is UKIS?
The DLR project Environmental and Crisis Information System (the German abbreviation is UKIS, standing for [Umwelt- und Kriseninformationssysteme](https://www.dlr.de/en/eoc/about-us/german-remote-sensing-data-center/geo-risks-and-civil-security/information-systems-and-geomatics/ukis) aims at harmonizing the development of information systems at the German Remote Sensing Data Center (DFD) and setting up a framework of modularized and generalized software components.

UKIS is intended to ease and standardize the process of setting up specific information systems and thus bridging the gap from EO product generation and information fusion to the delivery of products and information to end users.

Furthermore, the intention is to save and broaden know-how that was and is invested and earned in the development of information systems and components in several ongoing and future DFD projects.

## Related links

[ukis-wmp](https://github.com/dlr-eoc/ukis-wmp)