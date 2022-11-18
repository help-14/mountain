# Installation

- Download [docker-compose.yml](https://github.com/help-14/mountain/blob/main/blob/main/docker-compose.yml)
- Type in terminal `docker compose up -d`
- You can comment out watchtowner part if you already have one

```
services:
  mountain:
    container_name: mountain
    image: help14/mountain
    restart: unless-stopped
    user: root # optional, if you have permission problem
    volumes:
      - ./serve:/serve
    ports:
      - "7002:8080"
    environment:
      - SERVE_PATH=/serve
  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_LABEL_ENABLE=true
      - WATCHTOWER_INCLUDE_RESTARTING=true
    command: --interval 30
```