class TabTimer {
    constructor() {
        this.__RESET();
        this.container;
    }

    load(tabinfo) {
        let f_url = tabinfo.url;
        let f_title = tabinfo.title;
        let f_icon = tabinfo.icon;
        let f_domain = getDomain(f_url);
        try {
            new URL(f_url);
        } catch (error) {
            return;
        }

        this.storageRead();
        console.log(this.container);

        if (this.container !== undefined) {
            let index = this.container.index;
            if (index.includes(f_domain) || index.includes(f_url)) {
                this.refresh();
                this.start(f_domain, f_url);

            } else {
                this.refresh();
                this.add(f_domain, f_url, f_title, f_icon);
                this.start(f_domain, f_url);
            }
            write({ data: this.container });
        } else {
            this.initAdd(f_domain, f_url, f_title, f_icon);
            this.start(f_domain, f_url);
        }
    }

    refresh() {
        let data = this.container.data;
        data.forEach(element => {
            if (element.active) {
                element.active = false;
                element.seconds += Date.now() - element.time;
            }
            element.url.forEach(element2 => {
                if (element2.active) {
                    element2.active = false;
                    element2.seconds += Date.now() - element.time;
                }
            });
        });
    }

    add(domain, url, title, icon) {
        let data = this.container.data;
        let index = this.container.index;
        data.forEach(element => {
            if (element.domain == domain) {
                element.url.push({
                    active: false,
                    title: title,
                    url: url,
                    seconds: 0,
                    time: 0
                });
                index.push(url);
                return;
            }
        });
        data.push({
            active: false,
            domain: domain,
            icon: icon,
            seconds: 0,
            time: 0,
            url: [{
                active: false,
                title: title,
                url: url,
                seconds: 0,
                time: 0
            }]
        });

        index.push(domain);
        index.push(url);
    }

    initAdd(domain, url, title, icon) {
        let obj = {
            data: [{
                active: false,
                domain: domain,
                icon: icon,
                seconds: 0,
                time: 0,
                url: [{
                    active: false,
                    title: title,
                    url: url,
                    seconds: 0,
                    time: 0
                }]
            }],
            index: [domain, url]
        }
        this.container = obj;
    }

    start(domain, url) {
        console.log(this.container)
        let data = this.container.data;
        data.forEach(element => {
            if (element.domain == domain) {
                element.active = true;
                element.time = Date.now();
            }
            element.url.forEach(element2 => {
                if (element2.url == url) {
                    element2.active = true;
                    element2.time = Date.now();
                }
            });
        });
        write(data)
    }

    storageRead() {
        chrome.storage.local.get(null, function (data) {
            this.container = data;
            console.log(data);
        });
    }

    __RESET() {
        chrome.storage.local.clear();
    }
}

const write = (data) => {
    chrome.storage.local.set({ data: data });
};

const getDomain = (url) => {
    let domain = new URL(url)
    domain = domain.hostname;
    if (domain.startsWith("www.")) {
        domain = domain.slice(4);
    }
    return domain;
}

async function getTabInfo() { //  awaitはpromiseのresolveを待ち、その値を返す、rejectされた場合はエラーを投げる
    let tabinfo = {
        url: "",
        title: "",
        icon: ""
    };

    try {
        let forcus = await chrome.tabs.query({ active: true, currentWindow: true });
        tabinfo.url = forcus[0].url;
        tabinfo.title = forcus[0].title;
        tabinfo.icon = forcus[0].favIconUrl;

    } catch (err) {
        // console.log("active: None");
    }
    console.log(tabinfo);
    return tabinfo;
}

const t = new TabTimer();

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    t.load(await getTabInfo());
});

chrome.windows.onFocusChanged.addListener(async function (windowId) {
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
});