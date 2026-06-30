# 智能会议室预约管理系统（Meeting Room Manager）

> 实训项目七 · 前后端分离 · Spring Boot + MySQL + 原生 HTML/CSS/JS

面向企业内部员工与管理员的会议室资源管理平台，提供会议室浏览、在线预约、审批、签到、纪要、使用统计等一体化能力。

---

## 技术栈

| 端 | 技术选型 |
|---|---|
| 后端 | Java 17、Spring Boot 3.2、MyBatis Plus 3.5、Lombok、jjwt、Jakarta Validation、Hutool |
| 数据库 | MySQL 8.0（OrbStack docker-compose 启动） |
| 前端 | 原生 HTML5 + CSS3 + JavaScript（ES2017+，无构建工具，MPA 多页面） |
| 部署 | docker-compose（开发态 MySQL）、Maven、Python `http.server`（开发态前端） |

---

## 目录结构

```
meeting-room-manager/
├── docker-compose.yml           # MySQL 一键起（OrbStack）
├── backend/                     # Spring Boot 后端
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/xhs/meetingroom/
│       │   ├── MeetingRoomApplication.java
│       │   ├── config/          # MyBatisPlus / CORS 配置
│       │   ├── common/          # Result / 异常 / 常量
│       │   ├── controller/      # REST 接口（按业务域分包）
│       │   ├── service/         # 业务接口与实现
│       │   ├── mapper/          # MyBatis Plus Mapper
│       │   ├── entity/ dto/ vo/ enums/
│       │   ├── interceptor/ handler/ util/
│       └── main/resources/
│           ├── application.yml / application-dev.yml
│           ├── mapper/          # XML SQL 映射
│           └── db/migration/    # SQL 初始化脚本（容器启动时自动执行）
├── frontend/                    # 原生静态前端
│   ├── index.html               # 入口页（探测后端连通性）
│   ├── pages/                   # 业务页面（user / room / reservation / meeting / admin）
│   ├── styles/                  # CSS（base / components / pages 同构）
│   ├── scripts/                 # JS（common / api / components / pages 同构）
│   └── vendor/                  # 第三方库（按需）
└── .trellis/                    # 项目规范与任务追踪（Trellis）
    ├── spec/                    # 开发规范（必读）
    └── tasks/                   # 任务追踪
```

详细规范见 [`.trellis/spec/backend/index.md`](.trellis/spec/backend/index.md) 与 [`.trellis/spec/frontend/index.md`](.trellis/spec/frontend/index.md)。

---

## 快速开始

### 前置依赖
- [OrbStack](https://orbstack.dev/)（或 Docker Desktop）
- JDK 17+
- Maven 3.8+
- Python 3（用于本地起前端静态服务，亦可换 `npx http-server`、VS Code Live Server 等）

### 1. 启动 MySQL（OrbStack docker-compose）

```bash
docker-compose up -d mysql
docker ps                       # 看到 meeting-room-mysql 容器为 healthy
```

参数：
- 端口：`3306`
- 账号 / 密码：`root` / `root`
- 库名：`meeting_room_db`
- 字符集：`utf8mb4` / `utf8mb4_0900_ai_ci`
- 数据持久化卷：`meeting-room-mysql-data`
- 容器启动时自动执行 `backend/src/main/resources/db/migration/` 下的 `.sql`（S2 任务会添加建表脚本）

停止：

```bash
docker-compose down              # 停容器
docker-compose down -v           # 停容器 + 删数据（慎用）
```

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

启动成功后：

```bash
curl http://localhost:8080/api/v1/ping
# {"code":0,"message":"OK","data":"pong"}

curl http://localhost:8080/api/v1/system/info
# {"code":0,"message":"OK","data":{"app":"meeting-room-backend","version":"0.0.1-SNAPSHOT","serverTime":"2026-06-30 15:00:00"}}
```

### 3. 启动前端

```bash
cd frontend
python3 -m http.server 5500
```

浏览器访问：<http://localhost:5500/>

看到「后端 ping：pong」即说明前后端联调成功。

---

## API 约定

- 所有业务接口前缀：`/api/v1`
- 统一响应：`Result<T> = { code: number, message: string, data: T }`
  - `code = 0` 成功，非 0 见 [`ResultCode`](backend/src/main/java/com/xhs/meetingroom/common/result/ResultCode.java)
- 鉴权：`Authorization: Bearer <jwt>`（登录后由前端 `MR.Auth` 注入）
- 错误码分段：用户 2xxx / 会议室 3xxx / 预约 4xxx / 审批 5xxx / 会议 6xxx / 公告 7xxx / 统计 8xxx / 系统管理 9xxx

---

## 开发规范

**在动手写代码前，请务必阅读：**

| 范围 | 文档 |
|------|------|
| 后端总览 | [`.trellis/spec/backend/index.md`](.trellis/spec/backend/index.md) |
| 后端目录与分包 | [`directory-structure`](.trellis/spec/backend/directory-structure.md) |
| 后端数据库 | [`database-guidelines`](.trellis/spec/backend/database-guidelines.md) |
| 后端错误处理 | [`error-handling`](.trellis/spec/backend/error-handling.md) |
| 后端日志 | [`logging-guidelines`](.trellis/spec/backend/logging-guidelines.md) |
| 后端代码质量 | [`quality-guidelines`](.trellis/spec/backend/quality-guidelines.md) |
| 前端总览 | [`.trellis/spec/frontend/index.md`](.trellis/spec/frontend/index.md) |
| 前端目录与加载顺序 | [`directory-structure`](.trellis/spec/frontend/directory-structure.md) |
| 前端组件 / Hook / 状态 / 类型 / 质量 | `.trellis/spec/frontend/*.md` |
| 跨层思考指南 | [`guides/cross-layer-thinking-guide`](.trellis/spec/guides/cross-layer-thinking-guide.md) |

---

## 项目进度（Trellis 任务追踪）

- 父任务：[`.trellis/tasks/06-30-01-meeting-room-system/prd.md`](.trellis/tasks/06-30-01-meeting-room-system/prd.md)
- 当前子任务：[`06-30-project-scaffold`](.trellis/tasks/06-30-project-scaffold/prd.md) — S1 项目骨架
- 子任务路线图：S1 骨架 → S2 建表 → S3 用户/JWT → S4 会议室 → S5 预约 → S6 审批 → S7 会议/签到 → S8 公告 → S9 用户管理 → S10 预约管理 → S11 统计 → S12 联调与部署

---

## License

实训项目，仅供学习交流。
