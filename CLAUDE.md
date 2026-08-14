# Project Implementation Guide

## 1. 專案定位

這是一套建立在 **Streamer.bot** 之上的 Self-hosted 直播互動系統。

核心目標不是取代 Streamer.bot，而是在其上建立：

* 跨平台 Viewer / Identity
* Persistent viewer state
* 貨幣、成就等社群資料
* Dashboard
* Overlay
* Plugin ecosystem
* Discord 與其他平台延伸整合

基本分工：

```text
Streamer.bot
= 直播平台 / 工具整合
= Commands
= Actions
= Triggers
= OBS / Twitch / YouTube 等實際操作

本專案
= Viewer Identity
= Persistent State
= Event / Action Binding
= Currency / Achievement
= Plugin Runtime
= Overlay
= Dashboard
```

**不要重新實作 Streamer.bot 已經成熟的 Command / Action engine。**

---

# 2. Streamer.bot 的角色

Streamer.bot 是系統的重要 dependency，而不是暫時性的 workaround。

TypeScript Runtime 使用 `@streamerbot/client` 透過 WebSocket 與 Streamer.bot 溝通。

基本方向：

```text
Twitch / YouTube / OBS / ...
              │
              ▼
         Streamer.bot
              │
        WebSocket Events
              ▼
       TypeScript Runtime
```

反方向：

```text
TypeScript Runtime
        │
     DoAction
        ▼
   Streamer.bot
        │
        ▼
Twitch / YouTube / OBS / ...
```

Streamer.bot 主要負責：

* Twitch / YouTube 等平台連線
* Commands
* Triggers
* Actions / Sub-actions
* OBS 等直播工具控制
* 平台特定操作

本專案透過 Streamer.bot WebSocket：

* 訂閱事件
* 取得 Command / Action 資訊
* 執行 Action
* 將 Streamer.bot event normalize 成內部事件

---

# 3. Viewer / Identity 是核心 Domain

不要將 Twitch User、YouTube User、Discord User 當成三種 Viewer。

核心模型應為：

```text
Viewer
├── Identity: Twitch
├── Identity: YouTube
└── Identity: Discord
```

`Viewer` 是平台無關的人。

`Identity` 才代表某個平台上的帳號。

Viewer 未來可能包含：

* display name / nickname
* avatar
* first seen
* last message
* tags
* roles
* metadata
* currencies
* achievements
* plugin data

Identity 則保存：

* platform
* platform user ID
* platform display name
* platform metadata

必須預留：

* identity linking
* unlinking
* viewer merging
* merge correction

未來同一個人的 YouTube / Twitch / Discord Identity 應能指向同一 Viewer。

---

# 4. Event Binding Layer

不要重新建立 Streamer.bot Trigger system。

Runtime 接收 Streamer.bot events 後，應先 normalize 成內部事件。

例如：

```text
Twitch.ChatMessage ─┐
                    ├─> chat.message
YouTube.Message ────┘
```

內部事件至少需要保留：

```text
type
source/platform
viewer
identity
timestamp
normalized payload
raw payload
```

需要考慮不同平台「語義相同但參數名稱/格式不同」的 parameter mapping。

同時不要丟棄 platform-specific event。

Plugin 未來應可以訂閱：

```text
chat.message
```

也可以在必要時使用：

```text
twitch.xxx
youtube.xxx
```

Discord 未來也應進入相同事件模型。

---

# 5. Action Binding Layer

不要重新實作 Action engine。

Streamer.bot Action 才是真正執行：

* 發送 Twitch / YouTube 訊息
* OBS 操作
* 播放音效
* TTS
* 其他直播操作

Runtime 負責：

* 取得 Streamer.bot Action list
* 儲存 Action mapping / binding
* 透過 `DoAction` 執行 Action
* 將 Plugin 所需能力映射至對應 Action

概念：

```text
Plugin
  ↓
Core API
  ↓
Action Binding
  ↓
Streamer.bot DoAction
  ↓
Streamer.bot Action
```

如果 Streamer.bot WebSocket 原生提供適合的操作，可以考慮直接使用；否則以 Action 為主要 extension mechanism。

---

# 6. Streamer.bot Import

Streamer.bot WebSocket API 可以 discovery / execute Action，但不應假設能完整建立 Action graph。

Plugin 可以附帶 Streamer.bot Import package / import string。

例如：

```text
plugin/
├── manifest
├── runtime
├── dashboard
└── streamerbot/
    └── import
```

安裝 Plugin 時：

```text
Install Plugin
      ↓
檢查 required Streamer.bot Actions
      ↓
不存在
      ↓
提示使用者 Import
      ↓
Streamer.bot Import
      ↓
Runtime discovery
      ↓
建立 Action binding
```

不要要求每個 Plugin 重複建立通用 Action。

共通能力應盡量由 Core 提供。

---

# 7. Plugin Architecture

Plugin ecosystem 是長期核心目標之一。

Plugin 不應直接操作 Core database。

應透過穩定的 Plugin SDK，例如：

```text
viewer
events
currency
achievement
overlay
actions
storage
logger
```

未來可能提供：

```text
events.on(...)
viewer.get(...)
currency.add(...)
currency.remove(...)
actions.execute(...)
overlay.emit(...)
storage.get(...)
storage.set(...)
```

Plugin API 應考慮 capability / permission：

```text
viewer:read
viewer:write
currency:read
currency:write
overlay:emit
streamerbot:execute-action
```

官方 Plugin 原則上也應只使用公開 Plugin API。

不要替官方 Plugin 提供第三方 Plugin 無法使用的 hidden API。

第一個 reference Plugin 預計為：

**簽到 Plugin**

用來驗證：

* Event / Command binding
* Viewer
* Plugin storage
* Currency
* Transaction
* Action/reply
* Plugin settings
* Streamer.bot import

---

# 8. Currency

Currency 是 Core capability，而不是 Plugin。

需要：

* multiple currencies
* wallet / balance
* add
* subtract
* transfer
* transaction history

不要只保存：

```text
balance = 100
```

需要 transaction ledger。

每次變更應能知道：

```text
viewer
currency
amount
reason/source
timestamp
plugin/module
metadata
```

Balance 可以 cache，但 transaction history 應作為可追蹤的事實來源。

---

# 9. Achievement

Achievement 屬於 Core capability。

具體如何取得成就可以由 Plugin 決定。

未來可能與：

* Viewer profile
* Overlay
* Discord
* Plugin
* Dashboard

整合。

---

# 10. Overlay System

Overlay 應視為 Runtime client，而不是寫死在 OBS integration 中。

概念：

```text
Plugin / Core
      │
 overlay.emit()
      ▼
   Runtime
      │
  WebSocket
      ▼
Overlay Web App
      │
      ▼
OBS Browser Source
```

Overlay 應允許第三方自行開發。

未來可支援：

* alerts
* leaderboard
* progress
* gacha animation
* poll
* now playing
* custom widgets

---

# 11. Dashboard

Dashboard 是 Runtime 的官方 GUI，不是 Core 本身。

預計使用 React。

Dashboard 可能管理：

* Viewer
* Identity
* Currency
* Transactions
* Achievement
* Event binding
* Action binding
* Plugins
* Overlay
* Streamer.bot connection
* Settings
* Logs

Plugin 未來可考慮註冊自己的 Dashboard settings/page。

Core API 不應依賴官方 Dashboard，理論上第三方可以自行製作 Dashboard。

---

# 12. Optional / Official Plugins

預計功能包含但不限於：

## Channel Management

* mod
* ban
* shoutout
* raid

## Community Interaction

* nickname / title
* first commenter
* EXP / level
* check-in
* poll
* landing / raid detection
* donation

  * Twitch
  * YouTube
  * 綠界
  * 歐付寶
* wheel / gacha
* prediction / slot machine
* overtime
* music / video request
* song request
* fishing
* AI response
* custom message board
* Live2D

## Discord Integration

* identity linking
* role synchronization
* chat / command integration
* viewer profile
* achievement display
* wallet query

這些原則上不應直接寫死進 Core。

---

# 13. n8n / External Automation

n8n 不屬於 Runtime Core。

它可以作為 optional external integration：

```text
Runtime
  │
Webhook / API
  ▼
n8n
  ├── Google services
  ├── Discord
  ├── Notion
  └── other services
```

高頻率的 chat event、viewer state、currency transaction 不應依賴 n8n。

---

# 14. 初步技術方向

目前預計：

```text
TypeScript
Node.js
pnpm workspace

Backend:
Fastify
PostgreSQL
Prisma
WebSocket

Frontend:
React

Integration:
@streamerbot/client

Deployment:
Docker / Docker Compose
```

初期不要加入不必要的 infrastructure，例如：

* Redis
* RabbitMQ
* Kafka
* Kubernetes

真的出現需求再增加。

Repository 可以考慮：

```text
apps/
├── server/
├── dashboard/
└── overlay-host/

packages/
├── core/
├── database/
├── shared/
├── plugin-sdk/
└── streamerbot-adapter/

plugins/
└── ...
```

實際結構可以依實作需求調整，不必為了符合此文件而過度抽象。

---

# 15. MVP v0.1

目前最重要的是完成一條完整 vertical slice。

Scenario：

```text
觀眾在 Twitch / YouTube 留言
        ↓
Streamer.bot 收到事件
        ↓
WebSocket event
        ↓
Runtime
        ↓
建立 / 找到 Identity
        ↓
建立 / 找到 Viewer
        ↓
更新 firstSeen / lastMessage
        ↓
增加測試貨幣
        ↓
建立 Transaction
        ↓
Dashboard 顯示 Viewer
```

v0.1 需要：

* Streamer.bot connection
* 留言 event detection
* Viewer
* Identity
* first seen
* last message
* Currency
* Transaction ledger
* Dashboard viewer list

不要為 v0.1 提前實作完整 Plugin、Achievement、Overlay 等系統。

---

# 16. v0.2

目標：

**Cross-platform Viewer Identity**

例如：

```text
YouTube Identity ─┐
                  ├── Viewer
Twitch Identity ──┘
```

需要驗證：

* account linking
* unlinking
* viewer merge
* shared wallet/state
* merge correction

跨平台後 Viewer 的 persistent state 不應因平台改變而消失。

---

# 17. v0.3

目標：

**Plugin SDK**

並實作第一個官方 reference Plugin：

**簽到**

簽到 Plugin 必須盡可能只使用公開 Plugin API。

如果實作簽到時發現 SDK 缺少必要 capability，優先思考是否應擴充通用 Plugin API，而不是替簽到 Plugin 增加特殊權限。

---

# 18. 架構原則

實作時優先遵守以下原則：

### 不重造 Streamer.bot

Streamer.bot 已經擅長的 Commands、Triggers、Actions、平台連線與直播工具控制，不要重新實作。

### Viewer-first

資料模型以 Viewer 為中心，而不是以 Twitch / YouTube 為中心。

### Platform-neutral

Core domain 不應大量出現 Twitch / YouTube 特有邏輯。

平台差異應盡量留在 Adapter / Mapping layer。

### Plugin-first

長期功能應優先思考：

> 這件事情能否由 Plugin API 完成？

而不是：

> 把它寫進 Core。

### API-first

Dashboard、Overlay、官方 Plugins 都是 Core API 的 client。

不要讓官方 frontend 擁有其他 client 無法使用的特殊能力。

### Self-host-first

整個系統應能由使用者自行部署、管理與保存資料。

### Keep MVP Small

目前不要因為 roadmap 很大，就提前建立複雜 abstraction。

v0.1 最重要的事情只有：

> **收到一則留言 → 認出一個 Viewer → 記住他 → 給他貨幣 → Dashboard 看得到。**

先讓這條完整跑通，再逐步建立其他 abstraction。
