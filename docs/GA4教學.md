# GA4 完整設定教學（2027 中興星空電影節「泱 Ripple」）

> 網站已透過 GTM（`GTM-TB3CFNB2`）載入 GA4，加強型評估和 Search Console 也已設定完成。
> 這份教學是接下來要一步一步完成的事。打勾的是已經完成的部分。

- [x] 網站裝好 GTM
- [x] GA4 加強型評估
- [x] Search Console 已連結
- [x] 網站程式送出自訂事件（`luma_open`、`calendar_add`、`interactive_play`、`venue_search`）
- [ ] 第一步：GA4 後台基本設定
- [ ] 第二步：在 GTM 把自訂事件轉發給 GA4
- [ ] 第三步：GA4 註冊自訂維度、設定關鍵事件
- [ ] 第四步：宣傳連結加上 UTM 參數
- [ ] 第五步：學會看報表
- [ ] 第六步（選用）：BigQuery 匯出

---

## 第一步：GA4 後台基本設定（約 10 分鐘）

以下都在 GA4 左下角的 ⚙「管理」裡。

### 1-1 資料保留期限改成 14 個月
1. 管理 → **資料收集和修改** → **資料保留**
2. 「事件資料保留」改成 **14 個月** → 儲存

> 預設只有 2 個月。不改的話，「探索」報表沒辦法拿明年和今年比較。

### 1-2 排除內部流量（自己人的瀏覽不算進去）
1. 先查自己的 IP：用 Google 搜尋「我的 IP」。學校網路和家裡的 IP 都要記下來。
2. 管理 → **資料串流** → 點你的網站串流 → **設定代碼設定** → **顯示全部** → **定義內部流量**
3. 建立規則：名稱填「團隊」，`traffic_type` 的值維持 `internal`，條件選「IP 位址等於」，填入剛剛查到的 IP → 建立
4. 回到 管理 → **資料收集和修改** → **資料篩選器**
5. 找到「Internal Traffic」篩選器，狀態預設是「測試」，改成 **啟用中** → 儲存

> 改成「啟用中」之後，被排除的資料**不能復原**。建議先維持「測試」狀態幾天，確認沒有誤刪再啟用。
> 手機用行動網路時 IP 會一直變，這部分排除不了，沒關係。

### 1-3 開啟 Google 信號（看年齡、性別、興趣）
1. 管理 → **資料收集和修改** → **資料收集**
2. 「Google 信號資料收集」→ **開始使用** → 啟用

> 開啟後，隱私說明裡要提到這件事。人數太少時 GA4 會隱藏部分資料，這是正常的。

---

## 第二步：在 GTM 把自訂事件轉發給 GA4（約 20 分鐘）

網站會把事件推到 `dataLayer`，但 GA4 還收不到，需要在 GTM 設定轉發。

### 網站送出的事件一覽

| 事件 | 什麼時候送 | 帶的參數 |
|---|---|---|
| `luma_open` | 點「訂閱活動提醒」按鈕（開啟 Luma 彈窗） | `source`：按鈕位置，例如 `header`、`program-xxx`、`quiz` |
| `calendar_add` | 點「Google 行事曆」或「Apple／Outlook」 | `method`：`google`／`ics`；`item`：哪個場次，`festival` 是整個活動，`all` 是完整時間表 |
| `interactive_play` | 互動遊戲的關鍵動作 | `game`：`quiz`／`labels`／`drift`／`home`／`echoes`；`action`：`start`／`complete`／`draw`／`open`／`share`／`share_card`；`item`：結果或項目 |
| `venue_search` | 場地地圖搜尋或點選地點 | `action`：`search`／`select`；`search_term`：搜尋字；`results`：結果數；`item`、`item_name`：選到的地點 |

### 2-0 確認 GTM 裡已經有 Google 代碼
1. 進入 tagmanager.google.com → 容器 `GTM-TB3CFNB2` → 左側「代碼」
2. 應該要有一個類型是 **Google 代碼** 的代碼，代碼 ID 是你的 GA4 評估 ID（`G-` 開頭），觸發條件是 **Initialization - All Pages** 或 **All Pages**
3. 如果沒有：新增 → 代碼設定選「Google 代碼」→ 代碼 ID 填 `G-xxxxxxx`，可以在 GA4 管理 → 資料串流裡找到 → 觸發條件選「Initialization - All Pages」→ 儲存

### 2-1 建立 8 個資料層變數
左側「變數」→「使用者定義的變數」→ 新增。每個都這樣設：
- 變數類型：**資料層變數**
- 資料層變數名稱：下表左欄的名稱，大小寫要完全一樣
- 變數名稱：下表右欄，方便辨認

| 資料層變數名稱 | 變數名稱（自己取） |
|---|---|
| `source` | DLV - source |
| `method` | DLV - method |
| `item` | DLV - item |
| `item_name` | DLV - item_name |
| `game` | DLV - game |
| `action` | DLV - action |
| `search_term` | DLV - search_term |
| `results` | DLV - results |

### 2-2 建立一個觸發條件（四個事件共用）
左側「觸發條件」→ 新增：
- 類型：**自訂事件**
- 事件名稱：`^(luma_open|calendar_add|interactive_play|venue_search)$`
- 勾選 **使用規則運算式比對**
- 觸發時機：所有自訂事件
- 名稱：「CE - 網站自訂事件」

### 2-3 建立一個 GA4 事件代碼
左側「代碼」→ 新增：
- 類型：**Google Analytics：GA4 事件**
- 評估 ID：填 `G-xxxxxxx`，跟 2-0 的一樣
- 事件名稱：點右邊的積木圖示，選內建變數 **`{{Event}}`**。這樣網站送什麼事件名稱，GA4 就收到什麼名稱，不用一個事件建一個代碼。
- 事件參數：新增 8 列

| 參數名稱 | 值 |
|---|---|
| `source` | `{{DLV - source}}` |
| `method` | `{{DLV - method}}` |
| `item` | `{{DLV - item}}` |
| `item_name` | `{{DLV - item_name}}` |
| `game` | `{{DLV - game}}` |
| `action` | `{{DLV - action}}` |
| `search_term` | `{{DLV - search_term}}` |
| `results` | `{{DLV - results}}` |

- 觸發條件：選「CE - 網站自訂事件」
- 名稱：「GA4 - 網站自訂事件」→ 儲存

> 某個事件沒用到的參數，值會是空的，GA4 不會收到，不用擔心。

### 2-4 預覽測試
1. GTM 右上角 **預覽** → 輸入網站網址 → Connect
2. 在打開的網站上點「訂閱活動提醒」、做一次心理測驗、在地圖搜尋
3. 回到 Tag Assistant 視窗，左側會出現 `luma_open`、`interactive_play` 等事件。點進去確認「GA4 - 網站自訂事件」顯示 **Tags Fired**。
4. 同時打開 GA4 → 管理 → **DebugView**，應該會看到事件和參數即時出現。

### 2-5 發布
GTM 右上角 **提交** → 版本名稱填「GA4 自訂事件」→ **發布**。
**沒有發布的話，一般訪客的資料都不會送出。**

---

## 第三步：GA4 註冊自訂維度、設定關鍵事件（約 10 分鐘）

### 3-1 註冊自訂維度
參數要先註冊成「自訂維度」，報表才能用。

管理 → **資料顯示** → **自訂定義** → **建立自訂維度**，範圍都選「**事件**」：

| 維度名稱（自己取） | 事件參數 |
|---|---|
| 按鈕位置 | `source` |
| 加入方式 | `method` |
| 項目 | `item` |
| 項目名稱 | `item_name` |
| 互動遊戲 | `game` |
| 互動動作 | `action` |
| 地圖搜尋字 | `search_term` |

> 如果 `search_term` 註冊時顯示已經存在或不能使用，就跳過，改用 GA4 內建的「搜尋字詞」維度。
> 註冊之後才會開始累積資料，之前送的不會補上。所以這一步越早做越好。
> `results` 是數字，可以到同一頁的「自訂指標」用相同方式建立，選用。

### 3-2 設定關鍵事件（轉換）
1. 至少先讓網站跑一天，有人觸發過事件之後
2. 管理 → **資料顯示** → **事件**
3. 找到 `luma_open` 和 `calendar_add`，把右邊的「**標示為關鍵事件**」打開

> 如果事件還沒出現在清單上：管理 → **關鍵事件** → **新增關鍵事件** → 直接輸入事件名稱。

### 3-3 用 GA4 建立 `program_view`（不用改程式）
每個節目都有自己的網頁，所以不必另外送事件，直接從 `page_view` 衍生出來就好：
1. 管理 → **資料顯示** → **事件** → **建立事件** → 建立
2. 自訂事件名稱：`program_view`
3. 比對條件：
   - `event_name` 等於 `page_view`
   - `page_location` 包含 `/program/`
4. 勾選「從來源事件複製參數」→ 建立

之後在報表把 `program_view` 依「網頁標題」拆開來看，就知道哪部片最多人看。

### 小提醒：本活動不需要報名
活動是**免報名、直接到場**，所以 Luma 是「訂閱活動提醒」，不是報名。報表上 `luma_open` 代表「有興趣、想收到提醒」的人，`calendar_add` 代表「把時間記下來、有意願到場」的人。這兩個就是這個網站最重要的轉換。

---

## 第四步：宣傳連結加上 UTM 參數

### 規則：一律小寫、用英文、用底線
```
https://nchufilmfestival.ripple.hyjdevelop.com/?utm_source=來源&utm_medium=形式&utm_campaign=活動名稱
```

| 參數 | 意思 | 這個活動建議的寫法 |
|---|---|---|
| `utm_source` | 從哪裡來 | `instagram`、`facebook`、`threads`、`line`、`poster`、`nchu`（學校公告）、`email` |
| `utm_medium` | 什麼形式 | `story`（限動）、`post`（貼文）、`bio`（個人簡介連結）、`qr`（實體 QR）、`social`、`email` |
| `utm_campaign` | 哪一波宣傳 | `2027_launch`（開站）、`2027_lineup`（片單公布）、`2027_countdown`（倒數）、`2027_dayof`（活動當天） |
| `utm_content`（選用） | 同一波裡分辨不同素材 | `poster_a`、`reel_01`、`teaser` |

### 範例
- IG 個人簡介連結：`?utm_source=instagram&utm_medium=bio&utm_campaign=2027_launch`
- 片單公布的限動：`?utm_source=instagram&utm_medium=story&utm_campaign=2027_lineup`
- 校園海報 QR code：`?utm_source=poster&utm_medium=qr&utm_campaign=2027_launch&utm_content=library`（`utm_content` 寫張貼地點，就能比較哪裡的海報最有效）

### 工具
- 用 Google 的 **Campaign URL Builder**（搜尋「GA4 Campaign URL Builder」）填表產生網址
- 網址太長的話，可以再用短網址服務縮短，QR code 也用縮短後的網址產生
- 建議團隊共用一張試算表，記錄每條連結：日期、用在哪裡、完整網址。這樣大家的寫法才會一致。

> **不要**在站內連結加 UTM，例如首頁連到節目頁。這樣會把來源洗掉，變成「站內來源」。

### 在哪裡看
報表 → **獲客** → **流量開發** → 主要維度切換成「工作階段來源／媒介」或「工作階段廣告活動」，再看右邊的「關鍵事件」欄。

---

## 第五步：學會看報表

### 5-1 即時報表（發完宣傳馬上看）
報表 → **即時**。可以看到過去 30 分鐘有多少人在線上、從哪裡來、觸發了哪些事件。

### 5-2 漏斗探索：大家在哪一步離開？
1. 左側「**探索**」→ 範本選「**漏斗探索**」
2. 右邊「步驟」點鉛筆圖示，設定：
   1. 第 1 步「進站」：`session_start`
   2. 第 2 步「看節目」：`program_view`
   3. 第 3 步「訂閱提醒」：`luma_open`
3. 可以把「細分」設成「工作階段來源」，比較不同來源的轉換率
4. 也可以另外建一個「`page_view` → `calendar_add`」的漏斗

### 5-3 路徑探索：大家進站後怎麼逛？
1. 探索 → 範本選「**路徑探索**」
2. 起點選「事件名稱 → `session_start`」或「網頁標題 → 首頁」
3. 點節點往下展開，看大家下一步都去哪裡

### 5-4 互動遊戲的使用情形
1. 探索 → **空白**
2. 維度加入「互動遊戲」、「互動動作」；指標加入「事件計數」、「總使用者」
3. 篩選器設成「事件名稱 等於 `interactive_play`」
4. 列放「互動遊戲」，欄放「互動動作」。就能看到測驗有多少人開始、多少人做完（`start` 對 `complete`）。

### 5-5 Looker Studio 團隊儀表板
1. 前往 lookerstudio.google.com → **建立** → **報表**
2. 資料來源選「**Google Analytics**」→ 選擇這個 GA4 資源
3. 建議放這些圖表：
   - 計分卡：總使用者、`luma_open` 次數、`calendar_add` 次數
   - 時間序列：每日使用者數，在宣傳日期加註記
   - 表格：工作階段來源／媒介 × 使用者 × 關鍵事件
   - 長條圖：`program_view` 依網頁標題排行（熱門影片）
4. 右上角「共用」給團隊，權限選「檢視者」

### 5-6 Search Console 報表
報表 → Search Console → **查詢**：大家用什麼關鍵字找到網站。連結後大約 48 小時開始有資料。

---

## 第六步（選用）：BigQuery 匯出

可以取得每個事件的原始資料，用 SQL 自由分析。**活動規模不大的話，可以先不做。**

1. 前往 console.cloud.google.com，建立一個 Google Cloud 專案
2. 在專案裡啟用 **BigQuery API**
3. GA4 → 管理 → **產品連結** → **BigQuery 連結** → 連結 → 選剛剛的專案 → 資料位置選 `asia-east1`（台灣）→ 匯出類型勾「**每日**」→ 送出

> **注意，費用和保存期限：**
> - 沒有綁信用卡的「沙箱」模式免費，但資料表會在 **60 天後自動刪除**，不是永久保存。
> - 想長期保存就要綁定帳單帳戶。這個網站的資料量通常落在免費額度內：儲存 10 GB、每月查詢 1 TB。綁定後建議到「預算與快訊」設定一個小額預算提醒。
> - 只會從連結那天開始匯出，以前的資料不會補。

---

## 附錄：網站程式在哪裡

- 事件工具函式：`src/lib/track.ts`
- 全站點擊監聽（處理 `data-track` 屬性）：`src/components/TrackClicks.tsx`
- 之後要追蹤新的按鈕，在 `<a>` 或 `<button>` 加上 `data-track="事件名稱" data-track-item="..."` 就好。
  如果是新的事件名稱，記得也加到 GTM 觸發條件的規則運算式裡。
