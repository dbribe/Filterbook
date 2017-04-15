const pageScript = document.createElement("script");
pageScript.src = chrome.extension.getURL("page.js");
pageScript.type = "text/javascript";

const pageStyle = document.createElement("link");
pageStyle.rel = "stylesheet";
pageStyle.href = chrome.extension.getURL("page.css");

const client = new XMLHttpRequest();
client.open('GET', chrome.extension.getURL("page.html"));
client.onreadystatechange = () => {
    if (client.responseText !== "") {
        const pageHTML = document.createElement("div");
        pageHTML.id = "filterbook";
        pageHTML.innerHTML = client.responseText;
        if (!document.getElementById("filterbook")) {
            document.body.insertBefore(pageHTML, document.body.firstChild);
            pageHTML.appendChild(pageScript);
            pageHTML.appendChild(pageStyle);
        }
    }
};
client.send();
