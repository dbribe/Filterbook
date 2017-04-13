// const extensionID;
// const mainPort = chrome.runtime.connect(extensionID, {name: "page"});
// mainPort.onMessage.addListener((event) => {});

document.getElementById("sideNav").style.display = "none";
document.getElementById("rightCol").style.display = "none";

const containerStyle = {
    marginLeft: "20px",
    maxWidth: "500px",
    display: "inline-block",
};

const leftContainer = document.createElement("div");
Object.assign(leftContainer.style, containerStyle);

const rightContainer = document.createElement("div");
Object.assign(rightContainer.style, containerStyle, {
    position: "absolute",
});


document.body.insertBefore(rightContainer, document.body.firstChild);
document.body.insertBefore(leftContainer, rightContainer);

let currentContainer = leftContainer;

const mainContainer = document.getElementById("mainContainer");
mainContainer.style.opacity = "0";

let cnt = 0;

let stackElements = [];

setInterval(() => {
    const elements = mainContainer.querySelectorAll("[data-ftr]");
    for (let element of elements) {
        element.removeAttribute("data-ftr");
        stackElements.push(element);
        if (stackElements.length > 15) {
            break;
        }
    }

    appendElements();
}, 1000);

const appendElements = () => {
    for (let element of stackElements) {
        element.style.display = "none";
        const myElement = document.createElement("div");
        myElement.innerHTML = element.innerHTML;
        if (cnt % 2 == 0) {
            leftContainer.appendChild(myElement);
        } else {
            rightContainer.appendChild(myElement);
        }
        cnt += 1;
        element.parentNode.removeChild(element);
    }

    stackElements = [];
}
