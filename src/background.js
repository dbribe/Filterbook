let pagePort;
chrome.runtime.onConnectExternal.addListener((port) => {
    if (port.name === "page"){
        pagePort = port;
    }
});

chrome.extension.onConnect.addListener((port) => {
    if (port.name === "popup") {
        port.onMessage.addListener((message) => {
            pagePort.postMessage(message);
        });
    }
});
