# 分享功能 Bug 修复设计

**日期:** 2026-06-04

## Bug 1: 分享链接打开后「重新测试」显示空白

**现象:** 用户通过分享链接 `?r=xxxx` 进入结果页，点击「重新测试」后页面为空白（只有背景）。

**根因:** 初始化时如果检测到 `?r=` 参数，直接调用 `renderResultPage()` 跳过答题，`renderIntro()` 从未执行，intro 屏幕的 HTML 为空。`restartQuiz()` 只调用 `showScreen('intro')` 切换到空的 intro 屏幕。

**修复:** 修改 `restartQuiz()`：
1. 清除 URL 中的 `?r=` 参数（`history.replaceState`）
2. 调用 `renderIntro()` 重新生成 intro 页面内容
3. 然后 `showScreen('intro')`

---

## Bug 2: 分享图内容不足 + 无二维码

**现象:** 保存的分享图片只包含人格名称、类型码、副标题，缺少灵魂肖像/人生指引/哲思内容。图片底部写了「长按识别二维码」但没有实际二维码。

**修复:** 改进 `generateShareImage()`：
1. 从 DOM 读取「灵魂肖像」内容的前 100 字作为摘要
2. 读取「哲思」全文
3. 图片高度从 1000 调到 1200，给新增内容留空间
4. 用 `api.qrserver.com` QR Code API 生成二维码图片嵌入 canvas
5. 底部改为显示二维码 + 网址文字
