## Docker

To run the wmp-ui as a docker container following docker version (or greater) is required in order
to allow multi-stage builds: (see [Docker multi-stage build documentation](https://docs.docker.com/develop/develop-images/multistage-build/#version-compatibility))

Furthermore, following configuration needs to be configured in the instance in order to prevent
problems due to CORS restrictions.

```
operaton.bpm.run.cors.enabled = true
operaton.bpm.run.cors.allowed-origins = *
```

### Build the Docker image
using docker:

``` sh
docker build --tag wmp-ui .
```

using docker compose:

``` sh
docker compose build --no-cache
```

### Run the Docker image

Use the environment variable API_URL to set the url to the WMP-API (Camunda-Api)

using docker run:

```sh
docker run -e API_URL=http://localhost:8085 -p 4201:80 --rm wmp-ui
```

using docker compose (this will also build the image if it isn't already):

```sh
docker compose up
```
