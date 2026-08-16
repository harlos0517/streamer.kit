# Streamer.kit — Implementation Guide

## 1. Project Goal

Streamer.kit is a **self-hosted, plugin-oriented streaming interaction runtime**.

Streamer.bot remains the **Integration Host**, responsible for:

* Twitch / YouTube and other platform connections
* Platform authentication
* OBS and streaming-tool integrations
* Native platform events
* WebSocket Requests
* Streamer.bot Actions / CPH API
* User-defined complex workflows

Streamer.kit is responsible for:

* Viewer / Identity
* Runtime Events
* Runtime Commands
* Service Registry
* Plugin Runtime / SDK
* Permission and Scope
* External Actions / Capabilities
* Plugin Persistence
* Dashboard / Overlay clients
* Official and third-party Plugins

The architectural goal is:

> **Keep the Runtime kernel small. Build streaming features as Plugins whenever possible.**

---

# Part 0 — Repository Structure

## 0.1 Repository

Streamer.kit 使用 pnpm workspace。

初期保持簡單：

```text
streamer-kit/
├── apps/
│   ├── server/
│   ├── dashboard/
│   └── overlay-host/
│
├── packages/
│   ├── core/
│   ├── plugin-sdk/
│   └── shared/
│
└── plugins/
    ├── currency/
    ├── achievement/
    └── checkin/
```

原則：

> **Workspace package 用來建立真正的 dependency boundary；Runtime 內部的 architecture boundary 使用 module / directory 即可。**

不要為了架構圖中的每個 subsystem 建立獨立 package。

---

## 0.2 Apps

### `apps/server`

Streamer.kit 的 executable host。

負責：

* Runtime bootstrap
* Environment / configuration
* 啟動 `@streamer-kit/core`
* HTTP / WebSocket API
* Process lifecycle

`server` 負責把 Runtime 跑起來，不實作 Runtime business logic。

### `apps/dashboard`

官方 React 管理介面。

透過 HTTP / WebSocket API 操作 Runtime。

不直接依賴 Core implementation 或 Database。

### `apps/overlay-host`

提供 OBS Browser Source 使用的 Overlay frontend。

透過 WebSocket 接收 Runtime / Plugin 的 Overlay events。

非初期 MVP，可延後實作。

---

## 0.3 `packages/core`

Streamer.kit Runtime 本體。

Core functionality 統一放在此 package，以 module / directory 區隔：

```text
packages/core/src/
├── runtime/
├── streamerbot/
├── events/
├── commands/
├── services/
├── actions/
├── plugins/
├── permissions/
├── viewer/
├── persistence/
└── template/
```

主要負責：

* Streamer.bot Adapter
* Event Bus / Event Registry / Normalization
* Commands Service
* Service Registry
* Actions / Runtime Capabilities
* Plugin Runtime / lifecycle
* Permission / Principal
* Viewer / Identity
* Core Database
* Plugin Storage
* Scoped Plugin Database
* Plugin migrations
* Template Service

Database implementation 初期直接放在：

```text
packages/core/src/persistence/
```

目前不需要獨立 `packages/database`。

若未來 persistence infrastructure 形成真正獨立的 dependency boundary，再考慮拆出。

---

## 0.4 `packages/plugin-sdk`

第三方與官方 Plugin 使用的公開 SDK。

提供：

* `Plugin`
* `PluginManifest`
* `PluginContext`
* `BasePlugin`
* `definePlugin()`
* Event / Command / Service / Action APIs
* Permission definitions
* Plugin Storage interface
* Plugin Database interface
* Settings / Logger interfaces

Plugin developer 原則上只需要依賴：

```text
@streamer-kit/plugin-sdk
```

`plugin-sdk` 只包含公開 contract 與 helpers，不包含 Runtime implementation。

---

## 0.5 `packages/shared`

只保存真正需要跨 application / package 共用的 lightweight contracts，例如：

* HTTP API DTO
* WebSocket protocol types
* Common serialization schemas
* Generic shared types

不要把沒有明確 owner 的程式碼全部丟進 `shared`。

---

## 0.6 `plugins/*`

功能性 domain 優先實作為 Plugin。

初期：

```text
plugins/
├── currency/      # official.currency
├── achievement/   # official.achievement
└── checkin/       # official.checkin
```

官方 Plugin 與第三方 Plugin 原則上使用相同的公開 SDK。

Plugin 之間不直接 import implementation，而是透過：

```text
Events
或
Service Registry
```

溝通。

---

## 0.7 Dependency Rules

主要 dependency direction：

```text
apps/server
    ↓
packages/core
    ↓
packages/plugin-sdk
    ↓
packages/shared

plugins/*
    ↓
packages/plugin-sdk

apps/dashboard ──────→ packages/shared
apps/overlay-host ───→ packages/shared
```

最重要的限制：

```text
plugins/*          ✗ packages/core
plugin-sdk         ✗ packages/core

dashboard          ✗ packages/core
overlay-host       ✗ packages/core
```

第三方 Plugin 不應知道 Runtime internal implementation。

---

## 0.8 Core Boundary

Core 包含 Runtime 成立所需要的 foundation：

```text
Events
Commands
Services
Actions
Plugin Runtime
Permission / Principal
Persistence
Streamer.bot Integration
Viewer / Identity
```

功能性 domain 優先成為 Plugin：

```text
Currency
Achievement
Check-in
Fishing
Gacha
Quest
Song Request
...
```

簡單判斷：

> **移除這個功能後，Streamer.kit Plugin Runtime 是否仍能正常成立？**

如果可以，通常優先做成 Plugin。

Repository structure 可以隨實作演進，不需要為了符合文件而過度拆分 package。

# Part 1 — Events / Commands

## 1.1 Goal

建立 Runtime 的輸入系統：

> 外部世界發生的事情如何進入 Streamer.kit，以及聊天室文字如何轉換成 semantic operation。

完成後必須能建立：

```text
Twitch / YouTube
       ↓
  Streamer.bot
       ↓
Streamer.bot Adapter
       ↓
 Event Normalizer
       ↓
   Event Bus
       ↓
Commands Service
       ↓
Semantic Input Event
```

---

## 1.2 Streamer.bot Adapter

使用：

```text
@streamerbot/client
```

建立獨立 Adapter，負責：

* Connection lifecycle
* Event subscription
* Raw event forwarding
* WebSocket request invocation
* `GetActions`
* `DoAction`
* Streamer.bot-specific payload mapping

其他 Runtime module 不直接依賴 `@streamerbot/client`。

```text
Runtime / Plugin
      ↓
Streamer.bot Adapter
      ↓
@streamerbot/client
```

---

## 1.3 Raw Events

Streamer.bot 原始事件統一使用 namespace：

```text
streamerbot.*
```

例如：

```text
streamerbot.twitch.chatMessage
streamerbot.youtube.message
streamerbot.obs.sceneChanged
```

Raw Event：

* 保留原始 payload
* 不保證 platform-neutral
* 可能隨 Streamer.bot API 改變
* Plugin 可以訂閱
* 一般 Plugin 不應優先使用

---

## 1.4 Runtime Events

Runtime 將平台事件 normalize 成穩定的 Runtime Event。

例如：

```text
Twitch.ChatMessage
YouTube.Message
        ↓
    chat.message
```

概念：

```ts
interface ChatMessageEvent {
  viewerId: string
  identityId: string

  platform: 'twitch' | 'youtube'

  message: string
  timestamp: Date

  rawEvent: unknown
}
```

Normalization 應發生在 Event Bus 之前：

```text
Raw Event
    ↓
Adapter
    ↓
Normalizer
    ↓
Runtime Event
    ↓
Event Bus
```

Event Bus 不負責理解 Streamer.bot payload。

---

## 1.5 Event Bus

提供基本 publish / subscribe：

```ts
events.on(...)
events.emit(...)
```

Event 的語義是：

> 某件事情發生了，或要求觸發某件事情；不期待特定 listener 回傳結果。

Event 不應假設某個 listener 一定存在。

---

## 1.6 Input / Output Events

Plugin event 分為兩類。

### Input Event

表示：

> 請觸發某項 capability。

例如：

```text
checkin.requested
```

可能由：

* Command
* Dashboard
* Scheduler
* Discord
* Other Plugin

發出。

### Output Event

表示：

> 某件事情已經完成或發生。

例如：

```text
checkin.completed
```

只能由真正擁有該 domain 的 Plugin / Service 發出。

---

## 1.7 Event Registry / Ownership

Event Registry 至少記錄：

```text
event id
owner
type: input | output
schema
version
emit policy
```

例如：

```text
checkin.requested

owner: official.checkin
type: input
emit: public
```

以及：

```text
checkin.completed

owner: official.checkin
type: output
emit: owner-only
```

Runtime 必須阻止其他 Plugin 偽造 owner-only output event。

---

## 1.8 Commands Service

一般聊天室 Command 由 Streamer.kit 管理，而不是 Streamer.bot Command System。

流程：

```text
chat.message
     ↓
Commands Service
     ↓
trigger / alias matching
permission / cooldown
argument parsing
     ↓
command.triggered
     ↓
target semantic event
```

Command Model：

```text
id
pluginId?

trigger
aliases

enabled
platforms?

cooldown?
permission?

targetEvent

userConfigurable
metadata
```

---

## 1.9 Command Registration

Plugin manifest 可以宣告 default commands：

```ts
commands: [
  {
    id: 'checkin',
    defaultTrigger: '!簽到',
    aliases: ['!checkin'],
    targetEvent: 'checkin.requested',
    userConfigurable: true,
  },
]
```

安裝時：

```text
Install Plugin
      ↓
Register Events
      ↓
Register Default Commands
      ↓
Persist Commands
```

使用者之後可以修改：

```text
!簽到
!簽
!每日
!checkin
```

Plugin 不知道也不需要知道實際 trigger text。

---

## 1.10 Service Registry Foundation

這個階段建立 Service Registry 的最小骨架。

Service 的語義是：

> 我要某個 capability 做事情或查詢資料，而且需要結果。

例如：

```ts
checkin.checkIn(...)
currency.getBalance(...)
```

判斷原則：

```text
Event
= publish / subscribe
= 不期待特定 receiver / return value

Service
= request / response
= 明確依賴某個 capability
```

Business logic 原則上放在 Service / Domain layer：

```text
Input Event
    ↓
Event Handler
    ↓
Service Method
    ↓
Business Logic
```

---

## Part 1 Acceptance Goal

必須能完成：

```text
Twitch.ChatMessage / YouTube.Message
              ↓
         chat.message
              ↓
       Commands Service
              ↓
      command.triggered
              ↓
      semantic input event
```

此階段不要求 Check-in 真正執行。

---

# Part 2 — Actions

## 2.1 Goal

建立 Runtime 對直播外部環境進行操作的統一 capability layer。

Plugin 不應知道操作最後是：

* Streamer.bot WebSocket Request
* CPH API
* Bridge Action
* User-defined Streamer.bot Action

Plugin 只看到穩定 Runtime API。

例如：

```ts
ctx.chat.send(...)
ctx.obs.setScene(...)
ctx.obs.setSourceVisibility(...)
ctx.actions.execute(...)
```

---

## 2.2 Three Execution Strategies

Action Runtime 依序使用三種策略：

```text
1. Native Streamer.bot WS Request
2. Runtime Bridge → CPH
3. User-defined Streamer.bot Action
```

三者是 implementation strategy，而不是 Plugin API。

---

## 2.3 Native Requests

如果 Streamer.bot 已提供對應 WebSocket Request：

> 直接使用。

例如：

```ts
ctx.chat.send({
  platform: 'youtube',
  message: 'Hello',
})
```

底層：

```text
Plugin
  ↓
Chat Capability
  ↓
Streamer.bot WS Request
  ↓
Platform
```

不要要求使用者為基本操作建立 Streamer.bot Action。

---

## 2.4 CPH Bridge

若功能只有 CPH API、沒有 WS Request：

```text
Plugin
  ↓
Runtime Capability
  ↓
DoAction(Runtime Bridge, args)
  ↓
Bridge C#
  ↓
CPH API
```

Bridge 必須使用有限且 versioned 的 operation contract。

例如：

```text
obs.scene.set
obs.source.visibility
```

不要提供：

```text
callAnyCPHMethod(...)
```

---

## 2.5 User-defined Actions

Streamer.bot Action 用於使用者自行建立的複雜 workflow。

例如：

```text
Legendary Fish
     ↓
Sound Effect
     ↓
OBS Filter
     ↓
VTube Studio
     ↓
Delay
     ↓
Chat Message
```

Plugin 只呼叫 logical action：

```ts
ctx.actions.execute('legendaryCatch', {
  viewerName,
  fishName,
  rarity,
})
```

Runtime 根據：

```text
Plugin ID
+
Logical Action ID
```

解析對應 Streamer.bot Action UUID。

Plugin 不直接操作任意 Action UUID。

---

## 2.6 Action Parameters

所有 Action strategy 使用 structured parameters。

傳往 Streamer.bot 時優先使用 flat structure：

```ts
{
  viewerId,
  viewerName,
  fishId,
  fishName,
  fishRarity,
}
```

而不是：

```ts
{
  viewer: {...},
  fish: {...},
}
```

方便 Streamer.bot argument stack、CPH 與 user-defined Action 使用。

---

## 2.7 Template Service

Runtime 提供共用 Template Service。

使用者可編輯：

```text
{{viewer.name}} 簽到成功！
今天獲得 {{reward}} {{currency.name}}
```

Plugin：

```ts
const message = ctx.template.render(template, data)

await ctx.chat.send({
  platform,
  message,
})
```

Template 可共用於：

* Chat
* Discord
* OBS Text
* Overlay
* TTS
* Notifications
* Action arguments

Template language 不允許任意 JavaScript evaluation。

---

## Part 2 Acceptance Goal

必須能完成：

```text
Plugin
   ↓
Runtime Capability
   ↓
┌─────────┬─────────┬─────────────┐
Native    Bridge    User Action
   ↓         ↓           ↓
          Streamer.bot
```

至少驗證：

```text
chat.send()
```

以及一個 CPH Bridge operation。

---

# Part 3 — Plugin SDK

## 3.1 Goal

將 Runtime foundation 暴露成穩定、公開、第三方可使用的 Plugin API。

官方 Plugin 不使用 hidden API。

---

## 3.2 Plugin Interface

Runtime 最底層只依賴：

```ts
interface Plugin {
  manifest: PluginManifest

  setup(ctx: PluginContext): Promise<void> | void

  start?(): Promise<void> | void
  stop?(): Promise<void> | void
}
```

Runtime 不依賴：

```ts
instanceof BasePlugin
```

---

## 3.3 BasePlugin

SDK 提供：

```ts
abstract class BasePlugin implements Plugin
```

協助：

* Context storage
* Lifecycle boilerplate
* Registration helpers
* Common utilities

但不是 Runtime contract。

---

## 3.4 Functional Plugin API

同時提供：

```ts
definePlugin({
  manifest,

  setup(ctx) {
    ...
  },
})
```

因此：

```text
            Plugin Interface
                  ▲
          ┌───────┴───────┐
          │               │
     BasePlugin       definePlugin()
```

第三方不被迫採用 OOP。

---

## 3.5 Plugin Manifest

Manifest 描述 Plugin contract：

```ts
interface PluginManifest {
  id: string
  name: string
  version: string

  permissions?: PermissionDefinition

  events?: EventDefinitions
  commands?: CommandDefinition[]

  services?: ServiceDefinition[]
  actions?: ActionDefinition[]

  database?: DatabaseDefinition
  settings?: SettingsDefinition

  dependencies?: PluginDependencyDefinition[]
}
```

---

## 3.6 PluginContext

PluginContext 提供 Runtime foundation：

```ts
interface PluginContext {
  plugin: {
    id: string
    version: string
  }

  events: EventAPI
  services: ServiceAPI
  commands: CommandAPI

  viewer: ViewerAPI

  chat: ChatAPI
  obs: ObsAPI
  actions: ActionAPI

  template: TemplateAPI

  storage: PluginStorage
  database?: PluginDatabase

  logger: Logger
}
```

注意：

```text
currency
achievement
quest
fishing
...
```

不直接成為 PluginContext property。

它們是 Plugin-provided Services。

---

## 3.7 Service-providing Plugins

Plugin 可以向 Service Registry 註冊 capability。

例如：

```text
official.currency
```

提供：

```text
currency.getBalance
currency.add
currency.subtract
currency.transfer
```

其他 Plugin 透過 Service Registry 使用：

```ts
const currency = ctx.services.get('currency')
```

Plugin 不直接 import 另一個 Plugin implementation。

---

## 3.8 Plugin Dependencies

Plugin 應優先依賴 capability，而不是特定 implementation。

例如：

```text
requires service:
currency >= 1
```

而不是：

```text
requires plugin:
official.currency
```

因此未來可以替換 Service provider。

---

## 3.9 Permissions

Permission 表示：

> Plugin 可以使用哪些 Runtime capabilities。

例如：

```text
viewer:read
viewer:write

storage:read
storage:write

database:read
database:write

chat:send

obs:read
obs:control

streamerbot:action.execute
```

Plugin-provided Service 可以定義自己的 permission，例如：

```text
currency:read
currency:write

achievement:read
achievement:write
```

---

## 3.10 Required / Optional Permissions

Manifest：

```text
required:
  viewer:read
  database:write

optional:
  chat:send
```

Required permission 未授權：

```text
Plugin cannot start
```

Optional permission 未授權：

```text
Plugin starts in degraded mode
```

Plugin 更新若增加 permission，必須重新取得授權。

---

## 3.11 Authorization Boundary

公開 Service / Capability method 自己就是 authorization boundary。

```text
Plugin
   ↓
Service / Capability Method
   ↓
Authorization
   ↓
Handler
```

不要要求 caller 自己先 guard。

不要在 business logic 各處重複 permission check。

---

## 3.12 Request Principal

每個 Service call 都帶 principal：

```ts
type Principal =
  | PluginPrincipal
  | UserPrincipal
  | SystemPrincipal
```

Service-to-Service call 保留原始 principal。

例如：

```text
Check-in Plugin
      ↓
Check-in Service
      ↓
Currency Service
```

Currency Service 看到的 caller 仍應是：

```text
official.checkin
```

避免 confused deputy。

---

## 3.13 Permission vs Scope

Permission：

> 能做什麼？

Scope：

> 能對哪些 resource 做？

例如：

```text
database:write
```

不代表可以修改所有 database schema。

Scope 優先透過 API design 結構性限制，而不是到處 runtime check。

---

## 3.14 Permission Is Not Sandbox

目前 Permission System 只控制：

> Plugin 透過官方 Runtime API 可以做什麼。

如果 Plugin 和 Runtime 執行於同一個 Node.js process：

```ts
import fs from 'node:fs'
```

目前無法阻止。

因此初期不得宣稱第三方 Plugin 已被 security sandbox。

真正 sandbox 留待未來：

* Separate process
* Worker isolation
* Restricted IPC
* Container / VM

---

## Part 3 Acceptance Goal

建立一個完全只使用公開 SDK 的測試 Plugin，驗證：

```text
Plugin
├ Events
├ Commands
├ Services
├ Actions
├ Permission
├ Storage
└ Logger
```

Runtime 不需要知道 Plugin implementation。

---

# Part 4 — Database / Persistence

## 4.1 Goal

建立 Core 與 Plugin 都能使用、但 ownership 明確隔離的 persistence system。

技術：

```text
PostgreSQL
+
Drizzle ORM
```

---

## 4.2 Data Ownership

資料分成：

```text
PostgreSQL
│
├── core.*
│
├── plugin_currency.*
├── plugin_achievement.*
├── plugin_checkin.*
├── plugin_fishing.*
└── plugin_<id>.*
```

原則：

> Core owns Core data. Plugin owns Plugin data.

---

## 4.3 Core Data

Core 只保存 Runtime foundation 必須擁有的資料。

例如：

```text
viewer
identity

command

plugin
plugin_permission_grant

plugin_storage

event_registry
action_binding

migration metadata
runtime settings
```

不要因為官方 Plugin 很重要就把它的 domain data 放入 Core。

---

## 4.4 Plugin Storage

簡單 persistence：

```ts
ctx.storage.get(...)
ctx.storage.set(...)
ctx.storage.delete(...)
```

底層：

```text
core.plugin_storage
```

並自動 namespace 到 caller Plugin。

適合：

* Settings
* Small state
* Feature flags
* Cache
* Small JSON data

Plugin 無法指定其他 Plugin namespace。

---

## 4.5 Scoped Plugin Database

複雜 relational data 使用：

```ts
ctx.database
```

Plugin 只取得自己的 schema：

```text
official.fishing
        ↓
plugin_fishing.*
```

適合：

* Historical records
* Inventory
* By-viewer state
* Relational data
* Large datasets
* Complex queries

不要提供 unrestricted global DB handle。

---


---

## 4.6 Plugin Database SDK

第三方 Plugin 不直接取得 Core 使用的 Drizzle instance、Core table definitions 或 unrestricted database handle。

Drizzle 是 Runtime persistence infrastructure 的 implementation detail。

Plugin SDK 應提供受限且 scoped 的 Database API，例如：

```ts
const inventory = ctx.database.table('inventory', {
  id: db.id(),
  viewerId: db.string(),
  itemId: db.string(),
  amount: db.integer(),
  createdAt: db.createdAt(),
})
```

Plugin author 不需要直接：

```ts
pgTable(...)
uuid(...).defaultRandom().primaryKey()
timestamp(...).defaultNow().notNull()
```

SDK 可以包裝常用 Drizzle schema declaration，降低 boilerplate，例如：

```ts
db.id()
db.string()
db.integer()
db.boolean()
db.json<T>()
db.createdAt()
db.updatedAt()
```

這層 wrapper 的目標是：

> Simplify common schema declaration and enforce Plugin database scope.

不要重新發明完整 ORM。

特殊 schema / index / constraint 等需求，未來可以提供有限的 Drizzle escape hatch；但 escape hatch 仍不得繞過 Plugin scope。

### Database API Boundary

Core 與 Plugin 使用不同 API surface：

```text
Drizzle / PostgreSQL
        │
        ├── CoreDatabase
        │     └── Runtime internal only
        │
        └── PluginDatabase
              ├── scoped table declaration
              ├── scoped query
              ├── scoped migration
              └── no Core / other Plugin access
```

第三方 Plugin 不應能：

```ts
ctx.database.table('core.viewer')
ctx.database.table('plugin_other.inventory')
```

也不應直接 import：

```ts
coreTables.viewer
coreDatabase
runtimeDrizzle
```

`ctx.database.table('inventory', ...)` 必須由 Runtime 自動解析到 caller Plugin 自己的 schema：

```text
official.fishing
        +
inventory
        ↓
plugin_fishing.inventory
```

Plugin 不自行指定 physical schema name。

這是結構性的 scope isolation：

> Plugin 不需要「記得不能碰 Core DB」；SDK 根本不提供這個 capability。

### Query Scope

Plugin query API 只能操作由該 Plugin Database scope 建立或取得的 table handle。

概念上：

```ts
await ctx.database.select(inventory)
await ctx.database.insert(inventory, data)
await ctx.database.update(inventory, data)
```

而不是提供：

```ts
ctx.database.raw('UPDATE core.viewer ...')
```

若未來提供 raw SQL，必須是明確的 advanced capability，且仍受到 schema scope 限制。

### Security Boundary

Plugin Database SDK 提供的是：

```text
Capability boundary
+
API contract
+
Accidental misuse prevention
```

它本身不是 hostile-code sandbox。

如果第三方 Plugin 與 Runtime 執行在同一個 Node.js process，而且能直接取得 database credentials，惡意 Plugin 仍可能繞過 SDK 自行連線。

真正的不可信任 Plugin isolation 留待未來搭配：

* Separate process
* Worker isolation
* Restricted IPC
* Database credential isolation

初期只保證：

> Plugins using the public SDK cannot access Core or another Plugin's database scope.

## 4.7 No Cross-module DB Contract

Plugin 不直接：

```text
JOIN core.viewer
```

也不建立：

```text
FOREIGN KEY → core.viewer
```

作為跨 module contract。

Plugin 保存：

```text
viewerId
achievementId
otherResourceId
```

時視為 opaque external reference。

需要 resource 時：

```ts
ctx.viewer.get(viewerId)
```

或：

```ts
ctx.services.get(...)
```

---

## 4.8 External References

External resource 可能：

* 被刪除
* 被 merge
* 所屬 Plugin disabled
* 所屬 Plugin uninstalled

Plugin 必須能處理 resource 不存在。

---

## 4.9 Plugin Migration

Plugin developer：

```text
Drizzle Schema
      ↓
drizzle-kit generate
      ↓
SQL Migrations
      ↓
Plugin Package
```

Plugin package：

```text
plugin/
├── manifest
├── src/
├── schema/
├── migrations/
└── streamerbot/
```

Runtime install：

```text
Install Plugin
      ↓
Create Plugin Schema
      ↓
Read Migration History
      ↓
Apply Pending Migrations
      ↓
Load Plugin
```

Production installation 不重新 generate migrations。

---

## 4.10 Bundled Plugins

官方 distribution 可以附帶 Plugin：

```text
plugins/
├── currency/
├── achievement/
└── checkin/
```

「Plugin」不代表一定 optional。

可以區分：

```text
Bundled Plugin
Official Plugin
Third-party Plugin
```

但三者原則上使用相同 SDK contract。

---

## 4.11 Currency Plugin

Currency 改為：

```text
official.currency
```

而不是 Runtime Core Service。

提供：

```text
Services
├ currency.getBalance
├ currency.add
├ currency.subtract
└ currency.transfer

Events
├ currency.balanceChanged
└ currency.transactionCreated
```

Database：

```text
plugin_currency.currency
plugin_currency.balance
plugin_currency.transaction
```

Transaction 必須保存 ledger，而不是只保存目前 balance。

---

## 4.12 Achievement Plugin

Achievement 同樣作為 bundled Plugin：

```text
official.achievement
```

可以訂閱其他 domain events：

```text
checkin.completed
fishing.catch.completed
command.triggered
```

並提供：

```text
achievement.get
achievement.unlock
achievement.getViewerProgress
```

因此 Achievement System 本身不污染 Runtime Core。

---

## Part 4 Acceptance Goal

至少驗證：

```text
Core
→ core.*

Plugin A
→ Plugin Storage
→ plugin_a.*

Plugin B
→ Plugin Storage
→ plugin_b.*
```

並確認：

```text
Plugin A
✗ plugin_b.*
✗ core.*
```

Currency Plugin 必須能透過自己的 migration 建立 schema，並透過 Service Registry 提供 currency capability。

---

# Part 5 — Reference Plugin: Check-in

## 5.1 Goal

使用真正 feature Plugin 驗證前四部分是否足以支援實際功能。

Check-in 不享有任何官方 Plugin 專用 API。

---

## 5.2 Plugin Contract

Plugin：

```text
official.checkin
```

Input Event：

```text
checkin.requested
```

Output Events：

```text
checkin.completed
checkin.streakChanged
```

Services：

```text
checkin.checkIn
checkin.getStatus
checkin.getStreak
```

Default Command：

```text
!簽到
→ checkin.requested
```

---

## 5.3 Persistence

Settings / message template：

```text
Plugin Storage
```

Check-in history：

```text
plugin_checkin.*
```

---

## 5.4 Dependencies

Check-in 依賴：

```text
Viewer capability
Currency service
Database capability
```

其中 Currency 是：

```text
Service dependency
```

而不是：

```text
import official.currency
```

---

## 5.5 Full Flow

最終必須完成：

```text
Viewer sends "!簽到"
        ↓
Streamer.bot
        ↓
Twitch / YouTube Event
        ↓
chat.message
        ↓
Commands Service
        ↓
command.triggered
        ↓
checkin.requested
        ↓
Check-in Plugin
        ↓
checkin.checkIn()
        │
        ├── Viewer API
        ├── Scoped Database
        └── Currency Service
        ↓
checkin.completed
        ↓
Template Service
        ↓
chat.send()
        ↓
Streamer.bot
        ↓
Chat
```

---

## 5.6 SDK Acceptance Rule

Check-in 不得：

* 直接查 Core DB
* 直接存取 Currency DB
* Import Runtime internals
* Import Currency implementation
* Hardcode Streamer.bot Action UUID
* 使用官方 Plugin 專屬 hidden API

如果 Check-in 無法只靠公開 SDK 完成：

> **Fix the SDK. Do not create a Check-in-specific backdoor.**

---

# Core Boundary

完成上述架構後，Runtime Core 應大致只有：

```text
Runtime Kernel
│
├── Streamer.bot Adapter
├── Event Runtime
├── Command Runtime
├── Service Registry
├── Action Runtime
├── Plugin Runtime
├── Permission / Principal
├── Persistence Infrastructure
│
├── Viewer
└── Identity
```

功能性 domain 則優先成為 Plugin：

```text
Bundled / Official Plugins
│
├── Currency
├── Achievement
└── Check-in

Future Plugins
│
├── Fishing
├── Gacha
├── Quest
├── Song Request
├── Donation
└── ...
```

判斷一項功能是否應進 Core 的簡單問題：

> **移除這個功能後，Plugin Runtime 是否仍然可以正常存在？**

如果答案是「可以」，它通常應優先考慮成為 Plugin。

---

# Architecture Principles

1. **Streamer.bot is the Integration Host.**
2. **Streamer.kit Core is a small Plugin Runtime kernel.**
3. **Runtime owns normal chat Commands.**
4. **Commands map user input to semantic Input Events.**
5. **Event = publish / subscribe.**
6. **Service = request / response.**
7. **Business logic belongs behind Services / domain APIs.**
8. **Plugin implementation is private; contracts are public.**
9. **Plugin-to-Plugin communication uses Events or Services.**
10. **Runtime capabilities hide Streamer.bot implementation details.**
11. **Native Request → CPH Bridge → User Action.**
12. **Core owns Core data; Plugin owns Plugin data.**
13. **No cross-module database contract.**
14. **Permission guards live at capability boundaries.**
15. **Permission and Scope are different concepts.**
16. **Permission is not a security sandbox.**
17. **Official Plugins use the same public SDK as third-party Plugins.**
18. **Depend on capabilities whenever possible, not implementations.**
19. **Plugin does not mean optional.**
20. **When a feature does not need to live in Core, build it as a Plugin.**
