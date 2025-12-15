# Homelab on Raspberry Pi 5

## Overview
A compact self-hosted lab running on a Raspberry Pi 5. It hosts media, network utilities, and small experiments while doubling as a sandbox for infrastructure-as-code workflows.

## Setup Highlights
- **Platform:** Raspberry Pi 5 with 8GB RAM, SSD boot, and VLAN-aware networking.
- **Stack:** Docker Compose, Traefik reverse proxy, automatic TLS via local CA, and Prometheus/Grafana for metrics.
- **Services:** Media server, DNS/ad-blocking, code-server playground, and temporary sandboxes for quick prototypes.

## Lessons Learned
- How to squeeze predictable performance out of ARM SBCs with cgroups, caching, and logging hygiene.
- Using Compose as a “lab notebook” to version and roll back services safely.
- Balancing convenience with resilience (backups, watchdogs, and healthchecks) on low-power hardware.
