const mainContainer = document.getElementById("mainContainer");
// const myContainer = document.createElement("div")

let cnt = 0;
let totalTime = 0;

const getPromise = () => {
    return new Promise((resolve, reject) => {
        const elements = mainContainer ? mainContainer.querySelectorAll("[data-ftr]") : null;
        if (!elements || !elements.length) {
            reject();
        } else {
            const promises = [];
            for (let element of elements) {
                element.removeAttribute("data-ftr");
                promises.push(valid(element));
            }
            Promise.all(promises).then((values) => {
                for (let i = 0; i < values.length; i += 1) {
                    if (!values[i]) {
                        elements[i].parentNode.removeChild(elements[i]);
                    }
                }
                resolve();
            });
        }
    });
};

const find = () => {
    getPromise().then(() => {
        find();
    }, () => {
        setTimeout(find, 4000);
    });
};

const valid = (element) => {
    return new Promise((resolve, reject) => {
        const nameElement = element.querySelector(".fwb.fcg>a") || element.querySelector(".fwn.fcg>.fcg>.fwb>a");
        // debugger;
        if (nameElement && nameElement.getAttribute("data-hovercard").contains("page")) {
            resolve(false);
        }

        const spanBans = [
            " is now friends with ",
            "SuggestedPost",
            " liked ",
            " likes ",
            " commented ",
            " are now friends",
        ];

        const spans = element.getElementsByTagName("span");
        for (let span of spans) {
            for (let spanBan of spanBans) {
                if(span.innerText.contains(spanBan)) {
                    resolve(false);
                }
            }
        }
        const as = element.getElementsByTagName("a");
        for (let a of as) {
            if (a.innerHTML == "Sponsored") {
                resolve(false);
            }
        }
        resolve(true);
    });
};

find();

// setInterval(() => {
//     const elements = mainContainer.querySelectorAll("[data-ftr]");
//     for (let element of elements) {
//         if (!valid(element)) {
//             element.parentNode.removeChild(element);
//         }
//     }
// }, 1000);
