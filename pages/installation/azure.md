# Azure Installation

<img src="https://i.imgur.com/FzxknCi.png">

<img src="https://i.imgur.com/f6fWph4.png">

This is a sample `docker-compose.yml` for Azure Web App - Linux Container.

```
version: '3.3'

services:
  mountain:
    container_name: mountain
    image: help14/mountain:dev
    restart: always
    volumes:
      - serve:/serve
    ports:
      - "8000:8080"
    environment:
      - SERVE_PATH=/serve

volumes:
  serve:
```