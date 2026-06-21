## 正體中文

### feat
- 新增工作區側邊面板，可從清單重新命名或刪除工作區，預設一進來就停在這個面板
- 工作區卡片會顯示 Git 分支與 worktree、Claude 工作階段狀態徽章（可依狀態篩選），以及對應的 PR 狀態
- 工作區卡片標題會自動從 Claude 工作階段的對話記錄推導出來
- 可在設定裡選擇工作區卡片要顯示哪些區塊，以及 PR 資料的來源
- 新增 Claude 工作階段狀態追蹤，靠一支 hook 回報目前是執行中、等待輸入還是閒置，並在分頁與工作區卡片上以徽章呈現，可在設定裡開關
- 終端機裡的檔案路徑可以點擊開啟，支援 Cmd / Ctrl 修飾鍵與滑鼠懸停提示，連被換行折斷的路徑也認得出來
- 分頁可以用拖曳重新排序
- 分頁列以小藥丸徽章顯示每個工作區的分頁數量

### fix
- 網頁預覽改用 asset 協定載入本機檔案
- 拖動分割面板時滑過預覽 iframe 不再卡住
- Claude 離開後會清掉殘留的工作階段狀態，停在互動提示時也會正確顯示等待輸入

## English

### feat
- Add a workspaces sidebar panel to rename or delete workspaces from a list, with the sidebar defaulting to this panel
- Workspace cards show the Git branch and worktree, a Claude session status badge (filterable by status), and the matching PR status
- Workspace card titles are auto-derived from the Claude session transcript
- Choose which blocks a workspace card shows, and where PR data comes from, in settings
- Track Claude session status via a hook that reports working, waiting-for-input, or idle, surfaced as a badge on tabs and workspace cards and toggleable in settings
- Click file paths in the terminal to open them, with a Cmd / Ctrl modifier and hover tooltip, recognized even across wrapped lines
- Reorder tabs by dragging them in the tab bar
- Show each workspace's tab count as a pill badge in the tab bar

### fix
- Load local files in the web preview through the asset protocol
- Stop pane resize from sticking when dragging over a preview iframe
- Clear stale session status after Claude exits, and show waiting-for-input while paused on an interactive prompt
