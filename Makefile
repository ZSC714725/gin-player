.PHONY: build run clean docker-build docker-run docker-stop docker-clean help

# 变量定义
APP_NAME=gin-player
DOCKER_IMAGE=$(APP_NAME):latest
DOCKER_CONTAINER=$(APP_NAME)
PORT=8087

# 默认目标
help:
	@echo "可用的命令:"
	@echo "  make build         - 编译Go程序"
	@echo "  make run           - 运行程序"
	@echo "  make clean         - 清理编译产物"
	@echo "  make docker-build  - 构建Docker镜像"
	@echo "  make docker-run    - 运行Docker容器"
	@echo "  make docker-stop   - 停止Docker容器"
	@echo "  make docker-clean  - 清理Docker容器和镜像"
	@echo "  make docker-logs   - 查看Docker容器日志"
	@echo "  make compose-up    - 使用docker-compose启动"
	@echo "  make compose-down  - 使用docker-compose停止"

# 编译程序
build:
	@echo "编译 $(APP_NAME)..."
	@go build -o $(APP_NAME) .
	@echo "编译完成!"

# 运行程序
run: build
	@echo "启动 $(APP_NAME) 在端口 $(PORT)..."
	@./$(APP_NAME)

# 清理编译产物
clean:
	@echo "清理编译产物..."
	@rm -f $(APP_NAME)
	@echo "清理完成!"

# 构建Docker镜像
docker-build:
	@echo "构建Docker镜像 $(DOCKER_IMAGE)..."
	@docker build -t $(DOCKER_IMAGE) .
	@echo "镜像构建完成!"

# 运行Docker容器
docker-run:
	@echo "启动Docker容器 $(DOCKER_CONTAINER)..."
	@docker run -d -p $(PORT):$(PORT) --name $(DOCKER_CONTAINER) $(DOCKER_IMAGE)
	@echo "容器已启动在端口 $(PORT)"
	@echo "访问: http://localhost:$(PORT)/index.html"

# 停止Docker容器
docker-stop:
	@echo "停止Docker容器..."
	@docker stop $(DOCKER_CONTAINER) 2>/dev/null || true
	@docker rm $(DOCKER_CONTAINER) 2>/dev/null || true
	@echo "容器已停止"

# 清理Docker容器和镜像
docker-clean: docker-stop
	@echo "清理Docker镜像..."
	@docker rmi $(DOCKER_IMAGE) 2>/dev/null || true
	@echo "清理完成!"

# 查看Docker日志
docker-logs:
	@docker logs -f $(DOCKER_CONTAINER)

# 使用docker-compose启动
compose-up:
	@echo "使用docker-compose启动服务..."
	@docker-compose up -d
	@echo "服务已启动!"
	@echo "访问: http://localhost:$(PORT)/index.html"

# 使用docker-compose停止
compose-down:
	@echo "使用docker-compose停止服务..."
	@docker-compose down
	@echo "服务已停止!"

# 查看compose日志
compose-logs:
	@docker-compose logs -f
