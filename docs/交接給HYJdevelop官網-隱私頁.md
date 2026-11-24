# 交接：隱私權政策補上 Google Analytics 段落，並修正 /privacy 回傳 404

> 交接自：電影節網站專案（`HYJdevelop專案/中興電影節/官方網站`），日期 2026-11-21
> 要做的專案：HYJdevelop 官網（`HYJdevelop專案/HYJdevelop官網開發/project`，Vite + React，部署在 Vercel）

## 背景

- 「2027 中興星空電影節『泱 Ripple』」網站 `https://nchufilmfestival.ripple.hyjdevelop.com` 由 HYJdevelop 開發維護，已透過 Google 代碼管理工具（`GTM-TB3CFNB2`）安裝 Google Analytics 4。
- Google Analytics 的服務條款要求：使用 GA 的網站必須公開隱私權政策，並說明有使用 Google Analytics，以及它如何收集、處理資料。
- 決定：不在電影節網站另做隱私頁，統一放在 HYJdevelop 官網的 `/privacy`。電影節網站頁尾已經有「隱私權政策」連結，指向 `https://www.hyjdevelop.com/privacy`。
- 目前 `/privacy`（`src/pages/privacy/Privacy.tsx`）的內容很通用，有提到「分析 Cookie」，但**沒有提到 Google Analytics，也沒有寫到電影節網站**，還不符合條款要求。

## 任務一：在 `src/pages/privacy/Privacy.tsx` 新增 Google Analytics 段落

新增一段，標題可以叫「客戶網站的瀏覽統計（Google Analytics）」。區塊加上 `id="google-analytics"`，讓之後可以直接連到這一段。樣式和結構沿用頁面上現有段落的寫法。

內容至少要包含：

1. **適用範圍**：HYJdevelop 開發與維護的客戶網站，目前包括
   - `nchufilmfestival.ripple.hyjdevelop.com`（2027 中興星空電影節「泱 Ripple」）
   - 建議寫成清單，以後有新網站可以直接往下加
2. **使用的工具**：透過 Google 代碼管理工具使用 Google Analytics 4，會用第一方 Cookie（例如 `_ga`、`_ga_*`）收集匿名瀏覽統計。
3. **收集的內容**：
   - 瀏覽的頁面、停留時間、捲動到頁面底部
   - 外連點擊、檔案下載
   - 網站功能的使用情形：互動遊戲、場地地圖的搜尋字、點「訂閱活動提醒」、加入行事曆
   - 裝置、瀏覽器、大概的地區（城市層級），以及從哪裡進站
4. **Google 信號**：已開啟，Google 可能提供年齡、性別、興趣等**彙總**的族群統計，我們看不到個人資料。
5. **用途**：只用來改善網站與活動宣傳，不會拿來辨識個人，也不會用於廣告投放或賣給第三方。
6. **誰管理**：統計資料由 HYJdevelop 管理，**不是由活動主辦單位（國立中興大學）收集**。
7. **保存期限**：GA4 的事件資料保留 14 個月。
8. **如何拒絕**：
   - 在瀏覽器設定封鎖或刪除 Cookie
   - 安裝 Google Analytics 停用外掛：https://tools.google.com/dlpage/gaoptout
   - Google 如何使用這些資料：https://policies.google.com/technologies/partner-sites
9. **聯絡方式**：沿用頁面上已有的隱私聯絡信箱。

## 任務二：修正 `/privacy` 回傳 HTTP 404

- 現象：直接開 `https://www.hyjdevelop.com/privacy`，畫面正常，但伺服器回傳的 HTTP 狀態碼是 **404**。搜尋引擎和 Google 的檢查會把這頁當作不存在，其他 SPA 路由很可能也有一樣的問題。
- 推測原因：`vercel.json` 少了 SPA 的 rewrite 設定，所以只有 `/` 有對應的檔案。
- 做法：檢查 `vercel.json`，補上把所有路由導向 `/index.html` 的 rewrite，例如：
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
  - 要和現有的 `rewrites`、`redirects`、`headers` 合併，不要直接覆蓋。
  - 靜態檔案，例如 `/assets/*`、圖片、`robots.txt`、`sitemap.xml`、`manifest.json`，仍要正常回傳。Vercel 會先比對實際存在的檔案，再套用 rewrite，但改完還是要確認。
  - 如果網站有真正的 404 頁，要確認不存在的網址仍會顯示 404 頁面。

## 完成的標準

- [ ] `npm run build` 通過，現有的測試（vitest）也通過
- [ ] 本機預覽 `/privacy` 能看到新段落，`/privacy#google-analytics` 能直接跳到那一段
- [ ] `vercel.json` 已補上 rewrite；部署後用 `curl -I https://www.hyjdevelop.com/privacy` 確認回 **200**
- [ ] 如果網站有「更新紀錄」頁（`src/pages/Updates.tsx`），可以加一筆「隱私權政策新增 Google Analytics 說明」
- [ ] commit 前先問使用者；不要自己 push 或部署

## 完成之後（回到電影節網站專案做）

電影節網站頁尾的連結目前指向 `https://www.hyjdevelop.com/privacy`。新段落上線後，可以改成 `https://www.hyjdevelop.com/privacy#google-analytics`，直接跳到相關段落。檔案在電影節專案的 `src/components/Footer.tsx`。
