// user custom js
console.log("%cSomnia", " text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:5em")
console.log("%c Author %c \u6050\u5496\u5175\u7CD6 %c", "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");
console.log("\u6050\u5496\u5175\u7CD6\u7684\u4E3B\u9875 https://www.ftls.xyz");
let currentDate = new Date();
console.log(currentDate.toLocaleString('zh-u-ca-chinese', { dateStyle: 'full' }) + ' ' + currentDate.toLocaleTimeString(0, { hour12: false })) // 2022壬寅年九月廿九星期一 21:45:11
// console.log(currentDate.toLocaleString('zh-chinese', { dateStyle: 'full' }) + ' ' + currentDate.toLocaleTimeString(0, { hour12: false })) // 2022年3月17日星期二 11:50:33
console.log("你好，世界")

// 可以放一些 js
// function noticeComponent() {}

// 修改 CDN or 其他路径 或通过覆盖 js 实现
BASE_URL = '/Hugo-Landscape';
SOMNIA_LIBS.pagefind.js = `${BASE_URL}/pagefind/pagefind.js`;

// PageInitCustom DOMContentLoaded 时执行
Somnia.prototype.PageInitCustom = function () {
    console.log("[Somnia] 你好，世界");
}
// Swupjs 初次加载和每次切换页面都会执行
Somnia.prototype.swupPageInitCustom = function () {
    console.log("[Swup] Page View", location.pathname);
}
