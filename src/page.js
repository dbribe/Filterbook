const DEBUG = false;

const mainContainer = document.getElementById("mainContainer");

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
        element = element.firstChild.firstChild || element;
        const nameElement = element.querySelector(".fwb.fcg>a") || element.querySelector(".fwn.fcg>.fcg>.fwb>a");
        const name = nameElement && nameElement.innerText;
        let solved = false;

        const solve = (value) => {
            if (DEBUG) {
                console.info(value, ": ", name, element);
            }
            solved = true;
            if (value == "F" || value == "N") {
                resolve(false);
            } else {
                resolve(true);
            }
        };

        const check = () => {
            if (nameElement && nameElement.getAttribute("data-hovercard").contains("user")) {
                solve("F");
            }

            const spanBans = [
                " is now friends with ",
                "Suggested Post",
                " liked ",
                " likes ",
                " like ",
                " reacted to ",
                " commented ",
                " replied to ",
                " are now friends",
                " was tagged in",
                "People You May Know",
                "Popular Live video",
                " You May Like",
                "Tell Us What You Think",
                "'s Birthday"
            ];

            const spans = element.getElementsByTagName("span");
            for (let span of spans) {
                for (let spanBan of spanBans) {
                    if(span.innerText.contains(spanBan)) {
                        solve("F");
                        return;
                    }
                }
            }

            const as = element.getElementsByTagName("a");
            for (let a of as) {
                if (a.innerHTML == "Sponsored") {
                    solve("F");
                    return;
                }
            }

            const divs = element.querySelectorAll("div._5g-l");
            for (let div of divs) {
                if (div.innerHTML.contains("You May Like")) {
                    solve("F");
                    return;
                }
            }
        };

        check();

        if (solved) {
            return;
        }

        if (!name) {
            solve("N");
        } else {
            solve("T");
        }
    });
};

find();

const getMoreButton = () => {
    let buttons = document.querySelectorAll("span.fsxl.fcg");
    for (let button of buttons) {
        if (button.innerText == "More Stories") {
            return button;
        }
    }
    return null;
};

const moreButton = getMoreButton();

// setInterval(() => {
//     moreButton.click();
// }, 4000);
