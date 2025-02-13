const urlobj = window.location;
const tmp = urlobj.search
const params = new URLSearchParams(urlobj.search);
const query = params.get('query'); // クエリはqueryキーにしないと
const here = urlobj.href;
const loot = urlobj.origin + urlobj.pathname;


function createKeymap(obj) {
    let result = {
        url: {},
        domain: {}
    };

    obj.url.forEach((value, index) => {
        result.url[value.url] = index;
    });
    obj.domain.forEach((value, index) => {
        result.domain[value.domain] = index;
    });

    return result;
}

function urlFromDomain(data, domain) {
    console.log(data);
    let result = [];
    let keymap = createKeymap(data);
    let tmp = keymap.domain[domain];
    let urlset = data.domain[tmp].urlset;
    urlset.forEach((val) => {
        result.push(data.url[val]);
    });
    console.log(result);
    return result;
}

function getAgo(time) {
    let posted = new Date(time);
    let diff = new Date().getTime() - posted.getTime();
    let progress = new Date(diff);
    let ago;

    if (progress.getUTCFullYear() - 1970) {
        ago = progress.getUTCFullYear() - 1970 + '年前';
    } else if (progress.getUTCMonth()) {
        ago = progress.getUTCMonth() + 'ヶ月前';
    } else if (progress.getUTCDate() - 1) {
        ago = progress.getUTCDate() - 1 + '日前';
    } else if (progress.getUTCHours()) {
        ago = progress.getUTCHours() + '時間前';
    } else if (progress.getUTCMinutes()) {
        ago = progress.getUTCMinutes() + '分前';
    } else {
        ago = 'たった今';
    }
    return ago;
}

function HTMLbuilder(data, dom) { // dom = domain
    let add, flg;
    console.log(dom);
    if (dom == undefined) {
        add = data.domain;
        flg = "domain";
    } else {
        add = urlFromDomain(data, dom);
        flg = "url";
    }

    let html = "";
    if (flg == "url") {
        html += `<p id="back">back</p>`
        html += `<h2 id="domain">${dom}</h2>`
    }
    html += '<table id="mytable">'
    html += '<thead>'
    html += '<tr>'
    html += '<th class="index">#</th>'
    html += `<th class="value">${flg}</th>`
    if (flg == "url") {
        html += `<th class="title">title</th>`
    }
    html += '<th class="time">Time</th>'
    html += '<th class="ago">Recent</th>'
    html += '</tr>'
    html += '</thead>'
    html += '<tbody>'

    add.forEach((element, index) => {
        console.log(element);
        let val;
        if (flg == "url") {
            val = element.url;
            let protocol = getProtocol(val);
            val = nonMatchingPart(val, protocol);
            if (val.startsWith("www.")) {
                val = val.slice(4);
            }
            val = nonMatchingPart(val, dom);
            // if (val != "/") {
            //     if (val.length > 20) {
            //         val = val.slice(0, 20);
            //         val += "...";
            //     }
            // }

        } else {
            val = element.domain;
        }

        let recent = getAgo(element.recent);

        html += '<tr class="row">'
        html += `<td class="index">${index}</td>`
        html += `<td class="value">${val}</td>`
        if (flg == "url") {
            html += `<td class="title">${element.title}</td>`
        }
        html += `<td class="time">${element.timerdisplay}</td>`
        html += `<td class="ago">${recent}</td>`
        html += '</tr>'
    });
    html += '</tbody>'
    html += '</table>'

    let main_element = document.getElementById("main");
    main_element.insertAdjacentHTML("beforeend", html);
}

function nonMatchingPart(longStr, shortStr) {
    let mismatchIndex = shortStr.length;
    for (let i = 0; i < shortStr.length; i++) {
        if (longStr[i] !== shortStr[i]) {
            mismatchIndex = i;
            break;
        }
    }
    return longStr.substring(mismatchIndex);
}

function getProtocol(fqdn) {
    const r = /^(.*?):\/\//;
    return fqdn.match(r)[0];
}


function domainclicked() {
    console.log(this.innerText);
    let redirect = here + "?query=" + this.innerText;
    window.location.href = redirect;
}

function urlclicked(e) {
    console.log(e);
    let redirect = "http://" + this.domain + e.currentTarget.innerText;
    console.log(redirect);
    open(redirect);
}


// main
if (query == null) { // domain
    chrome.storage.local.get(null, function (data) {
        HTMLbuilder(data);
        let tblElem = document.getElementById("mytable");
        for (let i = 0; i < tblElem.rows.length; i++) {
            tblElem.rows[i].cells[1].addEventListener("click", domainclicked);
        }
    });
} else { // url from query
    chrome.storage.local.get(null, function (data) {
        HTMLbuilder(data, query);
        let url = urlFromDomain(data, query);

        let back = document.getElementById("back");
        back.addEventListener("click", () => {
            let redirect = loot;
            window.location.href = redirect;
        });

        let tblElem = document.getElementById("mytable");
        let domain = document.getElementById("domain").innerText;
        console.log(domain);
        for (let i = 1; i < tblElem.rows.length; i++) {
            tblElem.rows[i].cells[1].addEventListener("click", { domain: domain, handleEvent: urlclicked });
        }
    });
}

