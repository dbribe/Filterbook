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
let groups = {
    on: new Set(),
    off: new Set(),
};

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
            if (name) {
                if (groups.on.has(name)) {
                    solve("T");
                    return;
                } else if (groups.off.has(name)) {
                    solve("F");
                    return;
                }
            }

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

let config;

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
    groups = {
        on: new Set(),
        off: new Set(),
    };
    for (let group of config.groups) {
        if (group.value !== "default") {
            for (let element of group.elements) {
                groups[group.value].add(element);
            }
        }
    }
    if (!filterStarted) {
        filterStarted = true;
        filter();
    }
};

const addChild = (element, children) => {
    if (typeof children === "string") {
        element.innerHTML += children;
    } else if (children.constructor === Array) {
        for (let child of children) {
            addChild(element, child);
        }
    } else {
        element.appendChild(children);
    }
};

const createDOMElement = (type, classes, content) => {
    const element = document.createElement(type);
    element.className = classes;
    addChild(element, content);
    return element;
};

class Menu {
    constructor(options, parent) {
        this.configRef = options;
        this.createNode(parent);
    }

    getDescription() {}

    getName() {}

    getListChildren() {}

    addChildrenListeners() {}

    createNode(parent) {
        this.title = createDOMElement("span", "title", this.getName());
        this.title.title = this.getDescription();
        this.list = createDOMElement("div", "list collapsed", this.getListChildren());
        this.listContainer = createDOMElement("div", "listContainer", this.list);
        this.node = createDOMElement("div", "menu", [this.title, this.listContainer]);
        this.addListeners();
        if (parent) {
            parent.appendChild(this.node);
        }
    }

    addListeners() {
        this.addChildrenListeners();
        this.title.addEventListener("click", () => {
            this.list.classList.toggle("collapsed");
        });
    }
}

class TemplatesMenu extends Menu {
    getName() {
        return "Templates";
    }

    getDescription() {
        return "Toggle which templates you want to filter in your newsfeed (red means it won't appear))";
    }

    getListChildren() {
        const children = [];
        for (let child of this.configRef) {
            children.push(new Label(child).node);
        }
        return children;
    }
}

class PremadeGroupsMenu extends Menu {
    getName() {
        return "Premade Groups";
    }

    getDescription() {
        return "Toggle which groups you want to see in your newsfeed (red means it won't show, and blue means it will))";
    }

    getListChildren() {
        const children = [];
        for (let child of this.configRef) {
            const label = new Label(child);
            children.push(label.node);
        }
        return children;
    }
}

class GroupsMenu extends Menu {
    getName() {
        return "Groups";
    }

    getDescription() {
        return "Create your own private groups. A private group should contain names of pages/users. If a group is blue, those elements' posts will surely appear. If it is red, they will surely not appear. And if it is grey, then the group won't influence the newsfeed.";
    }

    getListChildren() {
        const children = [];
        for (let child of this.configRef) {
            const group = new Group(child);
            children.push(group.node);
        }
        this.addGroupButton = createDOMElement("span", "button add", "Add Group");
        children.push(this.addGroupButton);
        return children;
    }

    addChildrenListeners() {
        this.addGroupButton.addEventListener("click", () => {
            let name = prompt("Create new group:");
            if (!name || name === "") {
                name = "Default group " + Group.getCounter();
            }
            const group = new Group({name: name, value: "default", elements: []}, this.list);
        });
    }
}

class Label {
    constructor(options, parent) {
        this.configRef = options;
        this.createNode(parent);
    }

    createNode(parent) {
        this.node = createDOMElement("label", "label " + this.configRef.value, this.configRef.name);
        this.addListeners();
        if (parent) {
            parent.appendChild(this.node);
        }
    }

    changeValue() {
        const values = ["on", "off", "on"];
        const oldValue = this.configRef.value;
        const newValue = values[values.indexOf(this.configRef.value) + 1];
        this.configRef.value = newValue;
        saveConfig();
        this.node.classList.replace(oldValue, newValue);
    }

    addListeners() {
        this.node.addEventListener("click", () => {
            this.changeValue();
        });
    }
}

class GroupChild {
    constructor(options, parent) {
        this.parent = parent;
        this.name = options.name;
        this.group = options.group;
        this.register(options);
    }

    register(options) {
        if (this.group.elements.indexOf(this.name) === -1) {
            this.group.elements.push(this.name);
            saveConfig();
        }
        this.createNode(this.parent);
    }

    createNode(parent) {
        this.deleteButton = createDOMElement("span", "button delete", "X");
        this.node = createDOMElement("label", "childLabel", [this.name, this.deleteButton]);
        this.addListeners();
        if (parent) {
            parent.appendChild(this.node);
        }
    }

    addListeners() {
        this.deleteButton.addEventListener("click", () => {
            this.remove();
        });
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
        this.group.elements.splice(this.group.elements.indexOf(this.name), 1);
        saveConfig();
        delete(this);
    }
}

class Group {
    static getCounter() {
        if (!this.constructor.counter) {
            this.constructor.counter = 1;
        } else {
            this.constructor.counter += 1;
        }
        return this.constructor.counter;
    }

    constructor(options, parent) {
        this.parent = parent;
        this.register(options);
    }

    register(options) {
        this.configRef = options;
        if (config.groups.indexOf(options) === -1) {
            config.groups.push(this.configRef);
            saveConfig();
        }
        this.createNode(this.parent);
    }

    createNode(parent) {
        this.nameSpan = createDOMElement("span", "name", this.configRef.name);
        this.deleteButton = createDOMElement("span", "button delete", "Delete");
        this.renameButton = createDOMElement("span", "button rename", "Rename");
        this.expandButton = createDOMElement("span", "button expand", "Expand");
        this.addButton = createDOMElement("span", "button add", "Add");
        const listChildren = [];
        for (let childName of this.configRef.elements) {
            listChildren.push(new GroupChild({name: childName, group: this.configRef}).node);
        }
        this.list = createDOMElement("div", "list collapsed", listChildren);
        this.listContainer = createDOMElement("div", "listContainer", this.list);
        this.node = createDOMElement("div", "group " + this.configRef.value, [this.nameSpan,
             this.deleteButton, this.renameButton,  this.addButton, this.expandButton, this.listContainer]);
        this.addListeners();
        if (parent) {
            parent.appendChild(this.node);
        }
    }

    changeValue() {
        const values = ["default", "on", "off", "default"];
        const oldValue = this.configRef.value;
        const newValue = values[values.indexOf(this.configRef.value) + 1];
        this.configRef.value = newValue;
        saveConfig();
        this.node.classList.replace(oldValue, newValue);
    }

    addListeners() {
        this.nameSpan.addEventListener("click", () => {
            this.changeValue();
        });
        this.deleteButton.addEventListener("click", () => {
            this.remove();
        });
        this.renameButton.addEventListener("click", () => {
            const name = prompt("Rename group:");
            if (name) {
                this.configRexf.name = name;
                saveConfig();
                this.nameSpan.innerHTML = name;
            }
        });
        this.expandButton.addEventListener("click", () => {
            if (this.list.classList.contains("collapsed")) {
                this.list.classList.remove("collapsed");
                this.expandButton.innerHTML = "Collapse";
            } else {
                this.list.classList.add("collapsed");
                this.expandButton.innerHTML = "Expand";
            }
        });
        this.addButton.addEventListener("click", () => {
            const names = prompt("Add page(s)) / user(s) to group (separated by comma):");
            if (names) {
                names.split(",").forEach((name) => {
                    name = name.trim();
                    if (name !== "" && this.configRef.elements.indexOf(name) === -1) {
                        const child = new GroupChild({name: name, group: this.configRef}, this.list);
                    }
                });
            }
        });
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
        config.groups.splice(config.groups.indexOf(this.configRef), 1);
        saveConfig();
        delete(this);
    }
}

const initMenu = () => {
    config = getConfig();
    saveConfig();

    const menuContainer = document.getElementById("filterbook");

    const templatesMenu = new TemplatesMenu(config.templates, menuContainer);

    const premadeGroupsMenu = new PremadeGroupsMenu(config.premadeGroups, menuContainer);

    const groupsMenu = new GroupsMenu(config.groups, menuContainer);
};

const getDefaultTemplate = () => {
    return {
        templates: [
            {
                name: "X is now friends with Y",
                parse: " is now friends with ",
                selector: "span",
                value: "on",
            }, {
                name: "X and Y are now friends",
                parse: " are now friends",
                selector: "span",
                value: "on",
            }, {
                name: "Suggested Post",
                parse: "Suggested Post",
                selector: "span",
                value: "on",
            }, {
                name: "X liked Y",
                parse: " liked ",
                selector: "span",
                value: "on",
            }, {
                name: "X likes Y",
                parse: " likes ",
                selector: "span",
                value: "on",
            }, {
                name: "X and Y like Z",
                parse: " like ",
                selector: "span",
                value: "on",
            }, {
                name: "X reacted to Y",
                parse: " reacted to ",
                selector: "span",
                value: "on",
            }, {
                name: "X commented on Y",
                parse: " commented on ",
                selector: "span",
                value: "on",
            }, {
                name: "X replied to Y",
                parse: " replied to ",
                selector: "span",
                value: "on",
            }, {
                name: "X was tagged in Y",
                parse: "was tagged in",
                selector: "span",
                value: "on",
            }, {
                name: "People You May Know",
                parse: "People You May Know",
                selector: "span",
                value: "on",
            }, {
                name: "Popular Live Video",
                parse: "Popular Live Video",
                selector: "span",
                value: "on",
            }, {
                name: "You May Like",
                parse: "You May Like",
                selector: "span, div._5g-l",
                value: "on",
            }, {
                name: "Tell Us What You Think",
                parse: "Tell Us What You Think",
                selector: "span",
                value: "on",
            }, {
                name: "X's Birthday",
                parse: "'s Birthday",
                selector: "span",
                value: "on",
            }, {
                name: "Sponsored",
                parse: "Sponsored",
                selector: "a",
                value: "on",
            }
        ], premadeGroups: [
            {
                name: "Users",
                parse: "user",
                value: "on",
            }, {
                name: "Pages",
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
