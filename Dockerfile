## Build

FROM golang:1.18-alpine AS build

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN go mod download
RUN go build -o /bin

## Deploy

FROM alpine:latest
MAINTAINER Help-14 [mountain@help14.com]
LABEL maintainer="mountain@help14.com"

RUN mkdir /app

COPY --from=build /bin/mountain /app/
COPY ./templates /app/templates
COPY ./assets /app/assets

EXPOSE 8080

WORKDIR /app
ENTRYPOINT ./mountain