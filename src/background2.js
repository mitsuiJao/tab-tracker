"use strict";
import { Timer } from "./timer.js";

class TabTimer {
    constructor() {
        this.n = 0;
        this.recent;
        this.result = { url: [], domain: [] };
        this.urlkeymap = {};
        this.domainkeymap = {};
        this.updateKeymap();
        this.timerobj = new Timer();
        this._init();
        this.URLindex = 0;
        this.DOMAINindex = 0;
    }

    load(tabinfo) {
        let forcusurl = tabinfo.forcus.url;
        let forcustitle = tabinfo.forcus.title;
        let forcusicon = tabinfo.forcus.icon;

        try {
            new URL(forcusurl);
        } catch (error) {
            return;
        }

        this.totalize(1); // domain
        this.totalize(0); // url

        // attention!!!!! Above processing depends on the order!!!!
        // ↑ゴミ仕様すんなやカス

        console.log(this.result);
        this.add(forcusurl, forcustitle, forcusicon);
        console.log(this.result);
        write(this.result);
    }

    totalize(n) {
        this.timerobj.stop();

        let url = this.forcusURL.url;
        let title = this.forcusURL.title;
        let icon = this.forcusURL.icon;

        if (title == "新しいタブ") {
            return;
        }
        if (url.startsWith("file://")) {
            return;
        }
        if (url.startsWith("chrome://")) {
            return;
        }

        console.log("debug: ", url, n);
        let found = this.find(url, n); // usrl
        let val, index, pushobj;
        if (found === false) {    // result does not exist
            if (n == 0) { //存在しない且つurlの場合
                val = this.result.url;
                index = this.URLindex++;
                this.result.domain[this.find(url, 1)].urlset.push(index);
                pushobj = {
                    urlID: index,
                    title: title,
                    url: url,
                    timer: 0,
                    timerdisplay: "0:0:0:0",
                    recent: 0,
                }

            } if (n == 1) { //存在しない且つdomainの場合
                val = this.result.domain;
                index = this.DOMAINindex++;
                url = this.getdomain(url);  // domain
                pushobj = {
                    domainID: index,
                    domain: url,
                    timer: 0,
                    timerdisplay: "0:0:0:0",
                    recent: 0,
                    icon: icon,
                    urlset: [] // id
                }
            }

            val.push(pushobj);


        } else {        // result already exists
            if (n == 0) { //存在する且つurlの場合
                val = this.result.url;
                index = found;
            } if (n == 1) { //存在する且つdomainの場合
                val = this.result.domain;
                index = found;
            }
        }

        let time = this.timerobj.timer(); // addからの経過時間
        let current = val[index].timer; // 現在のtime
        val[index].timer += time;       // 現在のtimeに加算
        current = val[index].timer;     // tmp
        val[index].timerdisplay = this.timerobj.formatTime(current);   // 表示用に変換, 更新
        val[index].recent = getFormatDate(); // 最新の経過時間
    }

    add(url, title, icon) {
        this.timerobj = new Timer();
        this.timerobj.start();
        this.forcusURL = { url: url, title: title, icon: icon };
    }

    _init() {
        this.add();
        this.forcusURL = { url: "https://example.com/example", title: "example", icon: "https://example.com/favicon.ico" };
    }

    getdomain(url) {
        console.log("debug: ", url);
        let domain = new URL(url).hostname;
        if (domain.startsWith("www.")) {
            domain = domain.slice(4);
        }
        return domain;
    }

    updateKeymap() {
        this.result.url.forEach((value, index) => {
            this.urlkeymap[value.url] = index;
        });
        this.result.domain.forEach((value, index) => {
            this.domainkeymap[value.domain] = index;
        });
    }

    find(arg, type) { // type: 0 = url, 1 = domain, arg: url or domain
        this.updateKeymap();
        let keymaps;
        if (type == 0) {
            keymaps = this.urlkeymap;
        } else {
            console.log("debug: ", arg);
            arg = this.getdomain(arg);
            keymaps = this.domainkeymap;
        }

        let set = Object.keys(keymaps);
        let res;

        if (set.includes(arg)) {
            res = keymaps[arg];
        } else {
            res = false;
        }

        return res;
    }
}

function getFormatDate() {
    const now = new Date();
    let formated;
    let yyyy = now.getFullYear();
    let mm = now.getMonth() + 1;
    let dd = now.getDate();
    let hh = now.getHours();
    let mi = now.getMinutes();
    let ss = now.getSeconds();
    formated = `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
    return formated;
}

function write(obj) {
    chrome.storage.local.set(obj);
}

async function getTabInfo(from) { //  awaitはpromiseのresolveを待ち、その値を返す、rejectされた場合はエラーを投げる
    // console.log(from);
    let tabinfo = {
        forcus: {
            url: "",
            title: "",
            icon: ""
        }
    };

    try {
        let forcus = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log(forcus);
        tabinfo.forcus.url = forcus[0].url;
        tabinfo.forcus.title = forcus[0].title;
        tabinfo.forcus.icon = forcus[0].favIconUrl;

    } catch (err) {
        // console.log("active: None");
    }
    return tabinfo;
}

let tabtimer = new TabTimer();
let flg = false;

chrome.tabs.onActivated.addListener(async function (activeInfo) {
    if (flg) {
        return;
    } else {
        flg = true;
        setTimeout(() => { flg = false; }, 100);
    }
    console.log("onActivated");
    tabtimer.load(await getTabInfo());
});

chrome.windows.onFocusChanged.addListener(async function (windowId) {
    if (windowId != -1) {
        if (flg) {
            return;
        } else {
            flg = true;
            setTimeout(() => { flg = false; }, 100);
        }
        console.log("onFocusChanged");
        tabtimer.load(await getTabInfo());
    }
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (changeInfo.url != undefined && tab.active) { // 変更されたものがurlかつ、アクティブなタブの場合
        if (flg) {
            return;
        } else {
            flg = true;
            setTimeout(() => { flg = false; }, 100);
        }
        console.log("onUpdated");
        console.log("debug: ", tab, changeInfo);
        tabtimer.load(await getTabInfo());
    }
});

