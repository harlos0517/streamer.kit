# Streamer.bot 直播互動整合系統
這是一套以 **Streamer.bot** 為基礎的開源/自架(Self-hosted) 直播互動系統，目標是建立一個跨平台、可持續記住觀眾狀態，並能自由擴充的直播社群互動環境。

系統將 Twitch、YouTube、Discord 等不同平台的帳號整合為統一的 **Viewer Identity**，讓觀眾的貨幣、成就、互動紀錄與其他資料能跨越不同平台與每一次直播持續存在。

專案保留 Streamer.bot 成熟的直播平台整合、Command 與 Action 系統，並在其上提供 Dashboard、Overlay、事件與動作綁定，以及模組化的 Plugin API。開發者可以自行製作簽到、抽卡、點歌、釣魚、AI 回覆等互動模組，直播主也能依照自己的社群需求自由組合與客製化。

簡單來說：

> **Streamer.bot 負責連接直播，而我們負責記住觀眾，並讓這些連接能組合成一個持續存在的互動世界。**

## 使用指南

不需要安裝 Node.js / pnpm，全部相依套件都在 image 裡建置。

### 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Windows / Mac 皆可，會要求啟用 WSL2 或 Hyper-V 當底層引擎，但不需要自己手動操作 WSL）
- 一份已經在跑、且 WebSocket Server 已啟用的 Streamer.bot（本工具是建立在 Streamer.bot 之上的擴充，不是替代品，見上方說明）

### 步驟

1. 取得原始碼（`git clone` 或直接下載壓縮檔並解壓縮）。
2. 複製環境變數範本並依需要調整：
   ```
   cp .env.example .env # cmd or powershell
   ```
   或是在檔案總管將 `.env.example` 複製一份並改名為 `.env`。
   主要對到 Streamer.bot 的 WebSocket Server 設定：`STREAMERBOT_WS_PORT`（預設 `8080`）、`STREAMERBOT_WS_PASSWORD`（如果有開密碼驗證）。
3. 啟動整套服務：
   ```
   docker compose up -d --build # cmd or powershell
   ```
   第一次會需要下載 base image 並建置，之後只有變動到的部分需要重建。目前啟動時會自動套用資料庫 migration 並建立預設貨幣。
4. 開啟：
   - Dashboard: http://localhost:5173

### 其他注意事項

- Streamer.bot 需要跟這個工具跑在**同一台機器**上。

## 架構

```text
Twitch / YouTube / OBS / ...
              │
              ▼
         Streamer.bot
              │
              ▼
         Streamer.kit
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
 Events    Services    Actions
    │         │          │
    └─────────┼──────────┘
              ▼
        Plugin Runtime
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Currency  Check-in  ...
```

Streamer.kit Core 主要提供：

* Viewer / Identity
* Events
* Commands
* Service Registry
* Actions / Streamer.bot Bridge
* Plugin Runtime / SDK
* Permission
* Persistence

實際直播功能則盡量以 Plugin 實作，例如：

* Currency
* Achievement
* Check-in
* Fishing
* Gacha
* Quest
* Song Request

官方 Plugin 與第三方 Plugin原則上使用相同的公開 SDK。

## Repository

```text
apps/
├── server/
├── dashboard/
└── overlay-host/

packages/
├── core/
├── plugin-sdk/
└── shared/

plugins/
├── currency/
├── achievement/
└── checkin/
```

`core` 是 Streamer.kit Runtime 本體。

`plugin-sdk` 是官方與第三方 Plugin 使用的公開介面。

`plugins` 則包含建立在 SDK 上的實際功能。

## Roadmap

### Phase 1 — Events / Commands

* [ ] Streamer.bot Adapter
* [ ] Viewer / Identity
* [ ] Raw / Runtime Events
* [ ] Event Bus / Registry
* [ ] Commands Service
* [ ] Command → Semantic Event
* [ ] Service Registry 基礎

目標：

```text
Chat
→ Streamer.bot
→ chat.message
→ Command
→ Semantic Event
```

### Phase 2 — Actions

* [ ] Native Streamer.bot Requests
* [ ] CPH Bridge
* [ ] User-defined Action Bindings
* [ ] Chat / OBS Capabilities
* [ ] Template Service

目標：

```text
Plugin
→ Runtime Capability
→ Native / Bridge / User Action
→ Streamer.bot
```

### Phase 3 — Plugin SDK

* [ ] Plugin Interface / Manifest
* [ ] Plugin lifecycle
* [ ] PluginContext
* [ ] `BasePlugin` / `definePlugin()`
* [ ] Events / Services / Commands / Actions API
* [ ] Permission / Principal
* [ ] Plugin dependency management

目標：

> Plugin 可以完全透過公開 SDK 使用 Runtime，不需要依賴 Core internals。

### Phase 4 — Persistence / Bundled Plugins

* [ ] Core Database
* [ ] Plugin Storage
* [ ] Scoped Plugin Database
* [ ] Plugin migrations
* [ ] Currency Plugin
* [ ] Achievement Plugin

目標：

```text
Plugin
→ Service Registry
→ Bundled Plugin
→ Scoped Database
```

### Phase 5 — Check-in

使用第一個完整功能驗證整套 Plugin architecture。

* [ ] `official.checkin`
* [ ] `!簽到`
* [ ] Check-in Service
* [ ] History / Streak
* [ ] Currency rewards
* [ ] Custom response template
* [ ] Check-in Events

完整流程：

```text
!簽到
→ Command
→ checkin.requested
→ Check-in Service
→ Plugin Database
→ Currency Service
→ checkin.completed
→ Chat
```

如果 Check-in 無法只使用公開 SDK 完成，應修正 SDK，而不是使用 Runtime internal API。

## Future

Runtime foundation 穩定後，再逐步加入：

* Dashboard
* Overlay SDK
* Fishing / Gacha / Quest
* Song Request
* Discord Integration
* Identity Linking / Viewer Merge
* Plugin Distribution / Updates
* Plugin Sandbox

## 技術

* TypeScript
* Node.js
* pnpm
* Fastify
* PostgreSQL
* Drizzle ORM
* React
* WebSocket
* `@streamerbot/client`
* Docker / Docker Compose

## 核心原則

> **保持 Core 小而穩定，讓功能透過 Plugin 持續擴充。**

* Streamer.bot 是 Integration Host
* Event 用於 publish / subscribe
* Service 用於 request / response
* Action 用於操作直播外部環境
* Plugin 之間透過 Event / Service 溝通
* Core owns Core data，Plugin owns Plugin data
* 官方 Plugin 與第三方 Plugin 使用相同 SDK
* 能做成 Plugin 的功能，優先做成 Plugin



## References
- [Streamer.bot WebSocket API](https://docs.streamer.bot/api/websocket)
