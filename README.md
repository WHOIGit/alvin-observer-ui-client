# Alvin Observer UI Client

React frontend client for overlaying the Alvin Observer camera controls over
the existing Sealog interface.

This repo contains multiple services:

- React frontend
- Node JS socket-io server example
- Go service to convert and stream camera feeds

## Local development

Run the React frontend directly when working on UI code:

```sh
cd react-frontend
npm install
npm run dev
```

## Systemd Quadlet deployment

Production deployments use Podman Quadlet units instead of docker-compose.
Build the image locally on the target host:

```sh
podman build -f compose/Dockerfile -t alvin-observer-ui:latest
```

Copy the Quadlet files to the system container unit directory:

```sh
sudo install -d /opt/alvin-observer-ui-client
sudo install -m 0644 configEnv-pilot.js configEnv-observer.js /opt/alvin-observer-ui-client/
sudo install -m 0644 sealog.network pilot-ui.container observer-ui.container /etc/containers/systemd/
sudo systemctl daemon-reload
sudo systemctl enable --now sealog-network.service pilot-ui.service observer-ui.service
```

The generated services mount their runtime config from:

- `/opt/alvin-observer-ui-client/configEnv-pilot.js`
- `/opt/alvin-observer-ui-client/configEnv-observer.js`

The `sealog.network` unit creates or reuses the shared Podman network named
`sealog`. The container units join that network as `pilot-ui` and `observer-ui`,
respectively.

Because Caddy runs with `Network=host`, the UI containers also publish their
nginx ports on host loopback only:

- Observer UI: `127.0.0.1:18080`
- Pilot UI: `127.0.0.1:18081`

Caddy should proxy `/observer-ui/*` and `/pilot-ui/*` to those loopback ports.
