const urlobj = window.location;
const params = new URLSearchParams(urlobj.search);
const query = params.get('query'); // クエリはqueryキーにしないと

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
    console.log(tmp);
    let urlset = data.domain[tmp].urlset;
    urlset.forEach((val) => {
        result.push(data.url[val]);
    });
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

function HTMLbuilder(data, dom) {
    let add, flg;
    if (dom == undefined) {
        add = data.domain;
        flg = "domain";
    } else {
        add = urlFromDomain(data, dom);
        flg = "url";
    }

    let html = "";
    if (flg == "url") {
        html += `<h2>${dom}</h2>`
        html += `<a href="popup.html">back</a>`
    }
    html += '<table id="mytable">'
    html += '<thead>'
    html += '<tr>'
    html += '<th>#</th>'
    html += `<th>${flg}</th>`
    html += '<th>Time</th>'
    html += '<th>Recent</th>'
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
            val = nonMatchingPart(val, dom);
            if (val != "/") {
                if (val.length > 20) {
                    val = val.slice(0, 20);
                    val += "...";
                }
            }

        } else {
            val = element.domain;
        }

        let recent = getAgo(element.recent);

        html += '<tr class="row">'
        html += `<td class="index">${index}</td>`
        html += `<td class="value">${val}</td>`
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


chrome.storage.local.get(null, function (data) {
    console.log(data);
    HTMLbuilder(data, "www.youtube.com");
});
