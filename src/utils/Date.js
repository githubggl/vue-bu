if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
String.prototype.toDate = function() {
    if (this) {
        return new Date(this.replace(/-/g, "/"));
    } else {
        console.error("this is empty can't toDate!!");
    }
}

String.prototype.toDateFormat = function(format) {
    var d = this.toDate();
    if (d) {
        return d.format(format);
    }
    return this;
}
Date.prototype.format = function(format) {
    var o = {
            "M{1,2}": this.getMonth() + 1,
            "d{1,2}": this.getDate(),
            "h{1,2}": this.getHours(),
            "H{1,2}": this.getHours(),
            "m{1,2}": this.getMinutes(),
            "s{1,2}": this.getSeconds(),
            "q{1,2}": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        },
        week, reg;
    if (isNaN(this.getTime())) {
        return "";
    }
    reg = /(y{1,4})/;
    while (reg.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    reg = /(E{1,3})/;
    if (reg.test(format)) {
        week = {
            "0": "日",
            "1": "一",
            "2": "二",
            "3": "三",
            "4": "四",
            "5": "五",
            "6": "六"
        };
        while (reg.test(format)) {
            format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
        }
    }
    for (var k in o) {
        reg = new RegExp("(" + k + ")");
        while (reg.test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Date.prototype.addYear = function(years, returnNewDate) {
    return this.add("FullYear", years, returnNewDate);
};
Date.prototype.addMonth = function(months, returnNewDate) {
    return this.add("Month", months, returnNewDate);
};
Date.prototype.addDate = function(dates, returnNewDate) {
    return this.add("Date", dates, returnNewDate);
};
Date.prototype.addHours = function(hours, returnNewDate) {
    return this.add("Hours", hours, returnNewDate);
};
Date.prototype.addMinutes = function(minutes, returnNewDate) {
    return this.add("Minutes", minutes, returnNewDate);
};
Date.prototype.addSeconds = function(seconds, returnNewDate) {
    return this.add("Seconds", seconds, returnNewDate);
};
Date.prototype.add = function(field, delt, returnNewDate) {
    var f, d;
    delt = parseInt(delt);
    if (isNaN(delt)) {
        throw new Error("months must be number!");
    }
    if (!field) {
        throw new Error("field is one of 'FullYear,Month,Date,Hour,Minute,Second'!");
    }
    //	f = field[0].toUpperCase()+field.substring(1);
    if (returnNewDate) {
        d = new Date(this.getTime());
    } else {
        d = this;
    }
    if (d["set" + field]) {
        d["set" + field](d["get" + field]() + delt);
    } else {
        throw new Error("there is no method set" + field + "() !");
    }
    return d;
};
Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    return !(year % 400) || (!(year % 4) && !!(year % 100)); // Boolean
};
Date.prototype.getDayOfMonth = function() {
    var month = this.getMonth();
    var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month == 1 && this.isLeapYear()) { return 29; } // Number
    return days[month]; // Number
};
//date2:
//		Date object.  If not specified, the current Date is used.
// portion:
//		A string indicating the "date" or "time" portion of a Date object.
//		Compares both "date" and "time" by default.  One of the following:
//		"date", "time", "datetime"
Date.prototype.compare = function(date2, portion) {
    var date1 = new Date(+this.getTime());
    date2 = new Date(+(date2 || new Date()));

    if (portion == "date") {
        // Ignore times and compare dates.
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);
    } else if (portion == "time") {
        // Ignore dates and compare times.
        date1.setFullYear(0, 0, 0);
        date2.setFullYear(0, 0, 0);
    }

    if (date1 > date2) { return 1; } // int
    if (date1 < date2) { return -1; } // int
    return 0; // int
};
Date.prototype.difference = function(date2, interval) {
    var date1 = this;
    date2 = date2 || new Date();
    interval = interval || "day";
    var yearDiff = date2.getFullYear() - date1.getFullYear();
    var delta = 1; // Integer return value

    switch (interval) {
        case "quarter":
            var m1 = date1.getMonth();
            var m2 = date2.getMonth();
            // Figure out which quarter the months are in
            var q1 = Math.floor(m1 / 3) + 1;
            var q2 = Math.floor(m2 / 3) + 1;
            // Add quarters for any year difference between the dates
            q2 += (yearDiff * 4);
            delta = q2 - q1;
            break;
        case "weekday":
            var days = Math.round(date1.difference(date2, "day"));
            var weeks = parseInt(date1.difference(date2, "week"));
            var mod = days % 7;

            // Even number of weeks
            if (mod == 0) {
                days = weeks * 5;
            } else {
                // Weeks plus spare change (< 7 days)
                var adj = 0;
                var aDay = date1.getDay();
                var bDay = date2.getDay();

                weeks = parseInt(days / 7);
                mod = days % 7;
                // Mark the date advanced by the number of
                // round weeks (may be zero)
                var dtMark = new Date(date1);
                dtMark.setDate(dtMark.getDate() + (weeks * 7));
                var dayMark = dtMark.getDay();

                // Spare change days -- 6 or less
                if (days > 0) {
                    switch (true) {
                        // Range starts on Sat
                        case aDay == 6:
                            adj = -1;
                            break;
                            // Range starts on Sun
                        case aDay == 0:
                            adj = 0;
                            break;
                            // Range ends on Sat
                        case bDay == 6:
                            adj = -1;
                            break;
                            // Range ends on Sun
                        case bDay == 0:
                            adj = -2;
                            break;
                            // Range contains weekend
                        case (dayMark + mod) > 5:
                            adj = -2;
                    }
                } else if (days < 0) {
                    switch (true) {
                        // Range starts on Sat
                        case aDay == 6:
                            adj = 0;
                            break;
                            // Range starts on Sun
                        case aDay == 0:
                            adj = 1;
                            break;
                            // Range ends on Sat
                        case bDay == 6:
                            adj = 2;
                            break;
                            // Range ends on Sun
                        case bDay == 0:
                            adj = 1;
                            break;
                            // Range contains weekend
                        case (dayMark + mod) < 0:
                            adj = 2;
                    }
                }
                days += adj;
                days -= (weeks * 2);
            }
            delta = days;
            break;
        case "year":
            delta = yearDiff;
            break;
        case "month":
            delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
            break;
        case "week":
            // Truncate instead of rounding
            // Don't use Math.floor -- value may be negative
            delta = parseInt(date1.difference(date2, "day") / 7);
            break;
        case "day":
            delta /= 24;
            // fallthrough
        case "hour":
            delta /= 60;
            // fallthrough
        case "minute":
            delta /= 60;
            // fallthrough
        case "second":
            delta /= 1000;
            // fallthrough
        case "millisecond":
            delta *= date2.getTime() - date1.getTime();
    }

    // Round for fractional values and DST leaps
    return Math.round(delta); // Number (integer)
};

//获取这周的周一
Date.prototype.getFirstDayOfWeek = function(format) {
    if (!format) {
        format = "yyyy-MM-dd";
    }
    var weekday = this.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
    this.setDate(this.getDate() - weekday + 1); //往前算（weekday-1）天，年份、月份会自动变化
    return this.format(format);

};
//获取当月第一天
Date.prototype.getFirstDayOfMonth = function(format) {
    if (!format) {
        format = "yyyy-MM-dd";
    }
    this.setDate(1);
    return this.format(format);
};
//获取当月最后一天
Date.prototype.getLastDayOfMonth = function(format) {
    if (!format) {
        format = "yyyy-MM-dd";
    }
    let date = this;
    var currentMonth = date.getMonth();
    var nextMonth = ++currentMonth;
    var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    var oneDay = 1000 * 60 * 60 * 24;
    var lastTime = new Date(nextMonthFirstDay - oneDay);

    // var month = parseInt(lastTime.getMonth() + 1);
    // var day = lastTime.getDate();
    // date.setDate(day);
    return lastTime.format(format);
};

//获取当季第一天
Date.prototype.getFirstDayOfSeason = function(format) {
    if (!format) {
        format = "yyyy-MM-dd";
    }
    var month = this.getMonth();
    if (month < 3) {
        this.setMonth(0);
    } else if (2 < month && month < 6) {
        this.setMonth(3);
    } else if (5 < month && month < 9) {
        this.setMonth(6);
    } else if (8 < month && month < 11) {
        this.setMonth(9);
    }
    this.setDate(1);
    return this.format(format);
};
//获取当年第一天
Date.prototype.getFirstDayOfYear = function(format) {
    if (!format) {
        format = "yyyy-MM-dd";
    }
    this.setDate(1);
    this.setMonth(0);
    return this.format(format);
}
export default Date;

export function checkTime([a, b], [x, y]) {
    var times1 = [],
        times2 = [];
    if (a < b) {
        //未跨天
        times1.push([a, b]);
    } else {
        //跨天
        times1.push([a, "24:00"], ["00:00", b]);
    }

    if (x < y) {
        times2.push([x, y]);
    } else {
        times2.push([x, "24:00"], ["00:00", y]);
    }

    var flag = false; //是否冲突，true为冲突
    //循环比较时间段是否冲突
    for (var i = 0; i < times1.length; i++) {
        if (flag) break;
        for (var j = 0; j < times2.length; j++) {
            if (check(times1[i][0], times1[i][1], times2[j][0], times2[j][1])) {
                flag = true;
                break;
            }
        }
    }
    return flag;

    function check(a, b, x, y) {
        if (y < a || b < x) {
            return false;
        } else {
            return true;
        }
    }
}