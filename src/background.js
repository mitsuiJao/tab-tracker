class TabTimer {
    constructor() {
        this.n = 0;
        this.recent;
        this.active;
        this.activetime;
        this.storageRead();
    }

    load(tabinfo) {
        let forcusurl = tabinfo.url;
        let forcustitle = tabinfo.title;
        let forcusicon = tabinfo.icon;
        try {
            new URL(forcusurl);
        } catch (error) {
            return;
        }
    }

    storageRead() {
        chrome.storage.local.get(null, function (data) {
            this.container = data;
            console.log(this.container)
        });
    }

    __RESET() {
        chrome.storage.local.clear();
    }
}

const write = (data) => {
    chrome.storage.local.set(data);
};

const getDomain = (URL) => {
    let domain = new URL(URL).hostname;
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
