FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /usr/local/bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /usr/local/bin/worker ./cmd/worker

FROM alpine:3.22

RUN adduser -D -g "" monad

COPY --from=builder /usr/local/bin/api /usr/local/bin/api
COPY --from=builder /usr/local/bin/worker /usr/local/bin/worker

USER monad

EXPOSE 3000

CMD ["/usr/local/bin/api"]
