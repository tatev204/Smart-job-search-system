# Build stage
FROM golang:1.24-alpine AS builder
RUN apk add --no-cache git gcc musl-dev
WORKDIR /app

# Միայն mod ֆայլերը՝ cache-ը օգտագործելու համար
COPY go.mod go.work go.work.sum ./
COPY api/go.mod ./api/
COPY scraperdip/go.mod ./scraperdip/
COPY logger/go.mod ./logger/
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main main.go

# Final stage
FROM alpine:latest
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev

ENV CHROME_BIN=/usr/bin/chromium-browser
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 8088 8080 8070
CMD ["./main"]