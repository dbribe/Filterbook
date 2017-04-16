const client = new XMLHttpRequest();
let pageHTML;
client.open('GET', chrome.extension.getURL("page.html"));
client.onreadystatechange = () => {
    if (client.responseText !== "") {
        pageHTML = document.createElement("div");
        pageHTML.id = "filterbook";
        pageHTML.innerHTML = client.responseText;
        if (!document.getElementById("filterbook")) {
            document.body.appendChild(pageHTML);
            initMenu();
        }
    }
};
client.send();

const DEBUG = false;
let ACTIVE = true;

let filterStarted = false;

let bannedTemplates = {};
let bannedPremadeGroups = [];

const getPromise = () => {
    return new Promise((resolve, reject) => {
        const mainContainer = document.getElementById("mainContainer");
        const elements = (ACTIVE && mainContainer) ? mainContainer.querySelectorAll("[data-ftr]") : null;
        if (!elements || !elements.length) {
            reject();
        } else {
            let targets;
            if (elements.length > 10) {
                targets = [];
                for (let i = 0; i < 10; i += 1) {
                    targets.push(elements[i]);
                }
            } else {
                targets = elements;
            }
            const promises = [];
            for (let target of targets) {
                target.removeAttribute("data-ftr");
                promises.push(valid(target));
            }
            Promise.all(promises).then((values) => {
                for (let i = 0; i < values.length; i += 1) {
                    if (!values[i]) {
                        targets[i].parentNode.removeChild(targets[i]);
                    }
                }
                resolve();
            });
        }
    });
};

const filter = () => {
    getPromise().then(() => {
        filter();
    }, () => {
        setTimeout(filter, 4000);
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
            for (let group of bannedPremadeGroups) {
                if (nameElement && nameElement.getAttribute("data-hovercard").indexOf(group.parse) !== -1) {
                    solve("F");
                    return;
                }
            }
            for (let parser in bannedTemplates) {
                if (bannedTemplates.hasOwnProperty(parser)) {
                    const targets = element.querySelectorAll(parser);
                    const strings = [];
                    for (let target of targets) {
                        strings.push(String(target.innerHTML));
                    }
                    for (let template of bannedTemplates[parser]) {
                        for (let string of strings) {
                            if (string.indexOf(template.parse) !== -1) {
                                solve("F");
                                return;
                            }
                        }
                    }
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

let config;

const changeState = (label, element) => {
    const values = ["off", "on", "off"];
    label.classList.remove(element.value);
    element.value = values[values.indexOf(element.value) + 1];
    label.classList.add(element.value);
    config = config;
    saveConfig();
};

const getConfig = () => {
    return JSON.parse(localStorage.getItem("Filterbook")) || getDefaultTemplate();
};

const saveConfig = () => {
    localStorage.setItem("Filterbook", JSON.stringify(config));
    bannedTemplates = {};
    for (let template of config.templates) {
        if (template.value === "off") {
            if (!bannedTemplates[template.selector]) {
                bannedTemplates[template.selector] = [];
            }
            bannedTemplates[template.selector].push(template);
        }
    }
    bannedPremadeGroups = [];
    for (let group of config.premadeGroups) {
        if (group.value === "off") {
            bannedPremadeGroups.push(group);
        }
    }
    if (!filterStarted) {
        filterStarted = true;
        filter();
    }
};

const initMenu = () => {
    config = getConfig();
    saveConfig();

    for (let prop in config) {
        if (config.hasOwnProperty(prop)) {
            for (let element of config[prop]) {
                const label = document.createElement("label");
                label.className = "label " + element.value;
                label.innerHTML = element.label;
                document.getElementById(prop).appendChild(label);
                label.addEventListener("click", (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    changeState(label, element);
                });
            }
        }
    }
};

const getDefaultTemplate = () => {
    return {
        templates: [
            {
                label: "X is now friends with Y",
                parse: " is now friends with ",
                selector: "span",
                value: "on",
            }, {
                label: "X and Y are now friends",
                parse: " are now friends",
                selector: "span",
                value: "on",
            }, {
                label: "Suggested Post",
                parse: "Suggested Post",
                selector: "span",
                value: "on",
            }, {
                label: "X liked Y",
                parse: " liked ",
                selector: "span",
                value: "on",
            }, {
                label: "X likes Y",
                parse: " likes ",
                selector: "span",
                value: "on",
            }, {
                label: "X and Y like Z",
                parse: " like ",
                selector: "span",
                value: "on",
            }, {
                label: "X reacted to Y",
                parse: " reacted to ",
                selector: "span",
                value: "on",
            }, {
                label: "X commented on Y",
                parse: " commented on ",
                selector: "span",
                value: "on",
            }, {
                label: "X replied to Y",
                parse: " replied to ",
                selector: "span",
                value: "on",
            }, {
                label: "X was tagged in Y",
                parse: "was tagged in",
                selector: "span",
                value: "on",
            }, {
                label: "People You May Know",
                parse: "People You May Know",
                selector: "span",
                value: "on",
            }, {
                label: "Popular Live Video",
                parse: "Popular Live Video",
                selector: "span",
                value: "on",
            }, {
                label: "You May Like",
                parse: "You May Like",
                selector: "span, div._5g-l",
                value: "on",
            }, {
                label: "Tell Us What You Think",
                parse: "Tell Us What You Think",
                selector: "span",
                value: "on",
            }, {
                label: "X's Birthday",
                parse: "'s Birthday",
                selector: "span",
                value: "on",
            }, {
                label: "Sponsored",
                parse: "Sponsored",
                selector: "a",
                value: "on",
            }
        ], premadeGroups: [
            {
                label: "Users",
                parse: "user",
                value: "on",
            }, {
                label: "Pages",
                parse: "page",
                value: "on",
            }
        ], groups: []
    };
};

setInterval(() => {
    const shouldBeActive = document.getElementById("pagelet_composer");
    if (!shouldBeActive && ACTIVE) {
        ACTIVE = false;
        pageHTML = document.getElementById("filterbook");
        document.body.removeChild(pageHTML);
    } else if (shouldBeActive && !ACTIVE) {
        ACTIVE = true;
        document.body.appendChild(pageHTML);
    }
}, 1000);
