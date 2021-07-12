# Alvin Observer UI Client

React frontend client for overlaying the Alvin Observer camera controls over
the existing Sealog interface.

This repo contains multiple services:

- React frontend
- Node JS socket-io server example
- Go service to convert and stream camera feeds

## How to use

A docker-compose file is included at the project root to run all the apps in a Docker network.

Just run the following command from the repo root to start a development version on your local machine:

`docker-compose up`
