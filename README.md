# Streamer.bot 直播互動整合系統
這是一套以 **Streamer.bot** 為基礎的開源/自架(Self-hosted) 直播互動系統，目標是建立一個跨平台、可持續記住觀眾狀態，並能自由擴充的直播社群互動環境。

系統將 Twitch、YouTube、Discord 等不同平台的帳號整合為統一的 **Viewer Identity**，讓觀眾的貨幣、成就、互動紀錄與其他資料能跨越不同平台與每一次直播持續存在。

專案保留 Streamer.bot 成熟的直播平台整合、Command 與 Action 系統，並在其上提供 Dashboard、Overlay、事件與動作綁定，以及模組化的 Plugin API。開發者可以自行製作簽到、抽卡、點歌、釣魚、AI 回覆等互動模組，直播主也能依照自己的社群需求自由組合與客製化。

簡單來說：

> **Streamer.bot 負責連接直播，而我們負責記住觀眾，並讓這些連接能組合成一個持續存在的互動世界。**

## Roadmap
- 核心功能
  - Viewer / Identity
    - Viewer 作為平台無關的觀眾實體
    - Twitch / YouTube / Discord Identity
    - 帳號綁定 / 解綁 / 合併
    - 顯示名稱、頭像、初見、上次留言
    - 標籤 / 身分 / metadata
  - 事件整合綁定 (含指令)
    - 參數 mapping (同事件有不同參數)
  - 動作整合綁定
  - 貨幣系統
    - 多貨幣
    - 交易紀錄
    - 增減/轉賬
  - 成就
  - Overlay System
  - Dashboard
    - 設定
  - Plugin SDK
    - permission
  - Streamer.bot Integration Package
    - Action/Command/Trigger Import
- 頻道管理
  - mod
  - ban
  - shoutout
  - raid
- 頻道互動
  - 暱稱
  - 頭香
  - 經驗值
  - 簽到
  - 投票
  - 降落偵測
  - 斗內 (Twitch/YouTube/綠界/歐付寶等)
  - 轉盤/抽卡
  - 賭盤/拉霸機
  - 加班
  - 音樂/影片點播
  - 點歌系統
  - 釣魚
  - AI 回覆
  - 客製化留言板
  - Live2D
- Discord 串聯
  - 身分組同步
  - 聊天室/指令同步
  - 個人檔案/成就/錢包查看
- 其他

### MVP (v0.1)
- 觀眾留言偵測
- 建立身分/觀眾
- 更新初見/上次留言
- 增加貨幣
- 交易紀錄
- 後臺使用者列表

### v0.2
- Viewer A (YouTube)
- Viewer B (Twitch)
- 透過 linking flow 合併為 Viewer C
- Wallet / achievements / metadata 共用
- 原始 identities 保留
- 支援 unlink / merge correction

### v0.3
- Plugin SDK
- permission
- 簽到 Plugin


## References
- [Streamer.bot WebSocket API](https://docs.streamer.bot/api/websocket)
