FROM golang:1.21.1
ENV GOPROXY=https://goproxy.cn,https://goproxy.io,direct
LABEL maintainer="Kevin Zang"

WORKDIR /code
COPY . .
RUN go build .

EXPOSE 8080

CMD ./gin-player