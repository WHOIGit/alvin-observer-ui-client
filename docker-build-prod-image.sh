#!/bin/sh
docker buildx build -f compose/Dockerfile -t ghcr.io/whoigit/alvin-observer-ui:stable --platform linux/amd64 --push .
