class TabTimer {
    constructor() {
        this.storageRead();
    }

    load(tabinfo) {
        let f_url = tabinfo.url;
        let f_title = tabinfo.title;
        let f_icon = tabinfo.icon;
        let f_domain = this.getDomain(f_url);
        try {
            new URL(f_url);
        } catch (error) {
            return;
        }



        this.storageRead();
        let index = container.index;
        let data = container.data;
        if (index.find(f_domain) == f_domain || index.find(f_url)) {

        } else {

        }
    }

    update() {
        this.storageRead();
        let data = this.container.data
        data.forEach(element => {
            if (element.active) {
                element.active = false;

            }
        });
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

/*
data = [
    {
    active: bool,
    domain: string,
    icon: string,
    seconds: int,
    time: int
    url: [{
        active: bool,
        title: string,
        url: string,
        seconds: int,
        time: int
    }]
}]    

index = [
    url, domainごっちゃ
]
*/