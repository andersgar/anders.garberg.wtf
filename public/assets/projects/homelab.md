# Homelab and smart home

A home setup that has grown since 2024: two Raspberry Pi 5s (16 GB and 8 GB) and a NAS, all on a Tailscale network, running around thirty containers in Docker Compose. It started as a place to keep photos and files, and it is where I learn Linux, networking and operations by having to keep things running.

## What runs there

The NAS is the source of truth for photos, files, media and backups. It runs Immich as the photo server for the family, the media stack with Jellyfin, Syncthing for mirroring to the Pis, and nightly restic backups to cloud storage through Backrest.

The main Pi runs the network side: Pi-hole for DNS and ad blocking, a reverse proxy with Authelia in front of the internal services, Samba and Syncthing, and a Cloudflare tunnel for the few things that are reachable from outside. The second Pi runs Home Assistant and a Matter server, so Thread devices from the IKEA hub show up in Home Assistant directly. Everything is reachable over Tailscale SSH, and the Pis back themselves up to the NAS before the NAS backs up to the cloud.

One small service of my own is a domain watcher: a container that polls whois for a domain I would like to own, and sends a push notification when the registration changes.

## Smart home

Home Assistant runs the house: ventilation, heaters, lights, alarm and a wall tablet with its own dashboard. A few of the pieces are mine:

- A patched Flexit ventilation integration that adds a heat mode the official one lacks.
- A bus departure board and a scooter map on the tablet, fed by Entur's open APIs. Both are now published as HACS cards on GitHub, [bus-board-card](https://github.com/andersgar/bus-board-card) and [scooter-map-card](https://github.com/andersgar/scooter-map-card), with support for other transit providers and GBFS feeds.
- A dishwasher tracker that reads the power curve from a smart plug and works out which programme is running and when it will finish, since the machine has no smart interface of its own.
- A live power tile that shows what each appliance is drawing right now and what it costs at the current Nord Pool price.
- A watchdog that notices when the SmartThings link goes quiet and reloads it, after a few door sensors sat stale for days without anyone noticing.
- A plant moisture sensor on an ESP microcontroller, written in C++ with Arduino.