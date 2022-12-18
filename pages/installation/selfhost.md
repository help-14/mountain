# Self-host Installation

- Download [docker-compose.yml](https://github.com/help-14/mountain/blob/main/blob/main/docker-compose.yml)
- Type in terminal `docker compose up -d`
- You can comment out watchtowner part if you already have one

```
services:
  mountain:
    container_name: mountain
    image: help14/mountain
    restart: unless-stopped
    #user: root # optional, if you have permission problem
    volumes:
      - ./serve:/serve
      - ./data:/data
    ports:
      - "7002:8080"
    environment:
      - SERVE_PATH=/serve
      - LOG_PATH=/data/log.txt # optional, can comment this

  watchtower: # only needed to update if you haven't had one
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