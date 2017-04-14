// const extensionID;
// const mainPort = chrome.runtime.connect(extensionID, {name: "page"});
// mainPort.onMessage.addListener((event) => {});

console.warn("GOT IT");
const nameSet = new Set();

const mainContainer = document.getElementById("mainContainer");

let cnt = 0;
let totalTime = 0;

const getPromise = () => {
    return new Promise((resolve, reject) => {
        const element = mainContainer ? mainContainer.querySelector("[data-ftr]") : null;
        if (!element) {
            reject();
        } else {
            valid(element).then(() => {
                resolve({element: element, value: true});
            }, (respone) => {
                console.info(respone);
                resolve({element: element, value: false});
            });
        }
    });
};

const find = () => {
    getPromise().then((response) => {
        response.element.removeAttribute("data-ftr");
        if (!response.value) {
            // response.element.parentNode.removeChild(response.element);
            response.element.display = "none";
            response.element = null;
        }
        find();
    }, () => {
        setTimeout(find, 3000);
    });
};

const valid = (element) => {
    return new Promise((resolve, reject) => {
        const nameElement = element.querySelector(".fwb.fcg>a");
        if (nameElement) {
            nameSet.add(nameElement.innerHTML);
            if (nameElement.hasAttribute("data-hovercard") &&
                nameElement.getAttribute("data-hovercard").contains("user")) {
                // console.warn("User");
                reject("user");
            }
        }

        const spanBans = [
            " is now friends with ",
            "Suggested Post",
            " liked ",
            " likes ",
            // " like ",
            " commented ",
            " are now friends",
            " was tagged in",
            " reacted to",
            "Popular Live video",
            " replied to ",
            " You May Like",
            "People You May Know",
            "Tell Us What You Think",
            // "'s Birthday",
        ];

        // if (element.querySelector(".fwn.fcg>.fcg>.fcb")) {
        // console.warn("EZ");
        // return false;
        // }

        // const spans = element.querySelectorAll("span.fwb, span._m8d, span.fcg");
        const spans = element.getElementsByTagName("span");
        for (let span of spans) {
            for (let spanBan of spanBans) {
                if(span.innerText.contains(spanBan)) {
                    reject(spanBan);
                }
            }
        }

        const as = element.getElementsByTagName("a");
        for (let a of as) {
            if (a.innerText == "Sponsored") {
                reject("sponsored");
            }
        }
        resolve();
    });
};

find();

window.nameSet = nameSet;

// setInterval(() => {
//     if (cnt >= 20) {
//         console.info(totalTime / cnt);
//     }
// }, 5000);
