#!/bin/sh
exec docker run --rm -d -it -p 8083:8083/tcp --net host video-stream-server
