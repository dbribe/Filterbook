const pageScript = document.createElement('script');
pageScript.src = chrome.extension.getURL('page.js');
pageScript.type = "text/javascript";

const pageStyle = document.createElement("link");
pageStyle.rel = "stylesheet";
pageStyle.href = chrome.extension.getURL('page.css');

const docHead = document.head;
docHead.appendChild(pageScript);
docHead.appendChild(pageStyle);
