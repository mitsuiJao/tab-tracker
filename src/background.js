"use strict";
import { Timer } from "./timer.js";

class TabTimer {
    constructor() {
        this.n = 0;
        this.recent;
        this.result = {url: [], domain: []};
        this.urlkeymap = {};
        this.domainkeymap = {};
        this.updateKeymap();
        this.timerobj = new Timer();
        this._init();
        this.URLindex = 0;
        this.DOMAINindex = 0;
        this.url = {url: "example.com/example", title: "example"};
    }

    load(url, title) {
        this.totalize(url, title, 0);
        this.totalize(url, title, 1);
        console.log(this.result);
        this.add(url, title);
    }

    totalize(url, title, n){
        this.timerobj.stop();

        let found = this.find(url, n); // usrl
        let val, index, pushobj;
        if (found === false) {    // result does not exist
            if (n == 0) { //存在しない且つurlの場合
                val = this.result.url;
                index = this.URLindex++;
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
        val[index].recent = new Date(); // 最新の経過時間
    }

    add() {
        this.timerobj = new Timer();
        this.timerobj.start();
    }

    _init() {
        this.add();
    }
                                                                                   
    getdomain(url) {
        let dmain = url.split("/")[2];
        return dmain;
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



async function getTabInfo(from) { //  awaitはpromiseのresolveを待ち、その値を返す、rejectされた場合はエラーを投げる
    // console.log(from);
    let tabinfo = {
        "forcus": {
            "url": "",
            "title": ""
        },
        "audio": {
            "url": "",
            "title": "",
        }
    };
    
    let forcus = await chrome.tabs.query({ active: true, currentWindow: true });
    tabinfo.forcus.url = forcus[0].url;
    tabinfo.forcus.title = forcus[0].title;
    
    try {
        let audio = await chrome.tabs.query({ audible: true });
        tabinfo.audio.url = audio[0].url;
        tabinfo.audio.title = audio[0].title;
    } catch (error) {
        // console.log("audible: None");
    }
    return tabinfo;
}

let tabtimer = new TabTimer();
let flg = false;

async function tabsupdate(from){ // atode追記
    console.log(from);
}

chrome.tabs.onActivated.addListener(async function (activeInfo) {
    if (flg) {
        return;
    } else {
        flg = true;
        setTimeout(() => { flg = false; }, 100);
    }
    console.log("onActivated");
    let data = await getTabInfo()
    tabtimer.load(data.forcus.url, data.forcus.title);
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
        let data = await getTabInfo()
        tabtimer.load(data.forcus.url, data.forcus.title);
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
        let data = await getTabInfo()
        tabtimer.load(data.forcus.url, data.forcus.title);
    }
});