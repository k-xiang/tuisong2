// 后台Service Worker
// 处理扩展的后台任务和事件监听

// 监听安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('扩展安装成功:', details.reason);
});

// 监听消息事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  sendResponse({ success: true });
});