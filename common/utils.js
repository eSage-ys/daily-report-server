/**
 * 
 */
const dateFormat = function (date, fmt) {
    date = date
    let o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "h+": date.getHours() % 12,
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };
    let year = date.getFullYear().toString();
    year = year.length >= 4 ? year : '0000'.substr(0, 4 - year.length) + year;
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (year + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        };
    }
    return fmt;
}

module.exports = {
    dateFormat: dateFormat
}