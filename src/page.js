// const extensionID;
// const mainPort = chrome.runtime.connect(extensionID, {name: "page"});
// mainPort.onMessage.addListener((event) => {});

const uselessElements = ["#sideNav", "#rightCol"];

setTimeout(() => {
    for (let selector of uselessElements) {
        const element = document.querySelector(selector);
        element.parentNode.removeChild(element);
    }
});
// document.getElementById("sideNav").style.display = "none";
// document.getElementById("rightCol").style.display = "none";

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
// mainContainer.style.opacity = "0";

// let stackElements = [];

// setInterval(() => {
//     const elements = mainContainer.querySelectorAll("[data-ftr]");
//     for (let element of elements) {
//         element.removeAttribute("data-ftr");
//         stackElements.push(element);
//         // if (stackElements.length > 15) {
//         //     break;
//         // }
//     }

//     appendElements();
// }, 1000);

// let leftHeight = 0;
// let rightHeight = 0;

// const appendElements = () => {
//     for (let element of stackElements) {

//         // element.style.display = "none";
//         // const myElement = document.createElement("div");
//         // myElement.innerHTML = element.innerHTML;
//         if (valid(element)) {
//             if (leftContainer.offsetHeight <= rightContainer.offsetHeight) {
//                 leftContainer.appendChild(element);
//             } else {
//                 rightContainer.appendChild(element);
//             }

//         } else {
//             element.parentNode.removeChild(element);
//             console.warn("kill");
//         }
//     }

//     stackElements = [];
// };

const valid = (element) => {
    // if (element.querySelector("h5")) {
    //     element.parentNode.removeChild(element);
    //     return false;
    // }
    // if (element.querySelector(".fwn .fcg")) {
    //     return false;
    // }
    const spanBans = [
        " is now friends with ",
        "SuggestedPost",
        " liked ",
        " likes ",
        " commented ",
        " are now friends",
    ]
    const spans = element.getElementsByTagName("span");
    for (let span of spans) {
        for (let spanBan of spanBans) {
            if(span.innerText.contains(spanBan)) {
                console.warn(spanBan);
                return false;
            }
        }
    }
    const as = element.getElementsByTagName("a");
    for (let a of as) {
        if (a.innerHTML == "Sponsored") {
            console.warn("Sponsored");
            return false;
        }
    }
    return true;
}

setInterval(() => {
    // for (let element of leftContainer.children) {
    //     if (!valid(element)) {
    //         leftContainer.removeChild(element);
    //         console.warn("kill-after");
    //     }
    // }
    // for (let element of rightContainer.children) {
    //     if (!valid(element)) {
    //         rightContainer.removeChild(element);
    //         console.warn("kill-after");
    //     }
    // }
    const elements = mainContainer.querySelectorAll("[data-ftr]");
    for (let element of elements) {
        if (!valid(element)) {
            element.parentNode.removeChild(element);
        }
    }
}, 1000);
