# 第一阶段: 构建阶段
FROM golang:1.21.1 AS builder
ENV GOPROXY=https://goproxy.cn,https://goproxy.io,direct
LABEL maintainer="Kevin Zang"

WORKDIR /build
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o gin-player .

# 第二阶段: 运行阶段
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

# 复制构建产物和必要的静态文件
COPY --from=builder /build/gin-player .
COPY --from=builder /build/templates ./templates
COPY --from=builder /build/js ./js
COPY --from=builder /build/jpg ./jpg
COPY --from=builder /build/css ./css
COPY --from=builder /build/jessibuca-pro ./jessibuca-pro
COPY --from=builder /build/dash ./dash

# 设置时区为上海
ENV TZ=Asia/Shanghai

EXPOSE 8087

CMD ["./gin-player"]
