## 正體中文

### feat

- 原始碼控制側邊欄：點擊變更檔案會開啟並排差異分頁，單一檔案可棄置變更，並提供應用程式自己的右鍵選單；依資料夾分組改為真正的巢狀樹狀結構，資料夾的暫存與取消暫存會作用到整個子樹，資料夾可折疊
- 差異檢視強化：行號、自動換行切換、上一個與下一個變更的跳轉、收合未變更區塊、變更區塊計數
- 側邊欄的近期提交可點擊，會跳到 Git Graph 分頁並選中該筆提交；Git Graph 的提交列整列都可點擊展開詳情
- Git Graph 提交詳情的變更檔案清單新增平面與樹狀檢視切換
- Git Graph 工具列新增 worktree 選擇器，可直接把整個視窗切到另一個 worktree，檔案總管與側邊欄會跟著切換並跳出通知；工具列的 HEAD 顯示變成分支切換選單，本地分支點了直接 checkout，遠端分支會引導建立追蹤分支，被其他 worktree 佔用的分支會停用並標示所在位置
- 新增頂部置中的通知提示：淡入後停留三秒自動淡出，也可按 X 提早關閉

### fix

## English

### feat

- Source-control sidebar: clicking a changed file opens a side-by-side diff tab, individual files can be discarded, and the panel now has its own context menus; the group-by-folder view is a true nested tree where a folder's stage/unstage acts on its whole subtree and folders collapse
- Diff view upgrades: line numbers, a wrap toggle, previous/next change navigation, collapsing unchanged regions, and a change-block counter
- Recent commits in the sidebar are clickable and jump to the Git Graph tab with that commit selected; Git Graph commit rows expand from a click anywhere on the row
- The Git Graph commit-details file list gains a flat/tree view toggle
- The Git Graph toolbar gains a worktree selector that switches the whole window to another worktree, with the file explorer and sidebar following along and a confirmation notice; the HEAD display becomes a branch-switch menu where local branches check out directly, remote branches guide you through creating a tracking branch, and branches held by another worktree are disabled with their location shown
- New top-center notification toast: fades in, stays three seconds, fades out, and can be closed early with the X

### fix
