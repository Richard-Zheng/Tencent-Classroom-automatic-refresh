// ==UserScript==
// @name         Tencent Classroom - automatic refresh
// @name:zh-CN   腾讯课堂 - 课程表页自动刷新
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically refresh the "Curriculum" page
// @description:zh-cn  自动刷新“课程表”页面
// @author       Richard-Zheng
// @match        https://ke.qq.com/user/index/*
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==
var isTabInFocus = true;

(function() {
    'use strict';
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState == "hidden") {
            isTabInFocus = false;
        } else {
            isTabInFocus = true;
        }
    });
    // 请求通知权限
    window.addEventListener('load', function () {
        Notification.requestPermission(function (status) {
            // 这将使我们能在 Chrome/Safari 中使用 Notification.permission
            if (Notification.permission !== status) {
                Notification.permission = status;
            }
        });
    });

    // wait for loading complete
    setTimeout(() => {
        // create checkbox
        var oCheckbox = document.createElement("input");
        var myText = document.createTextNode("启用自动刷新");
        oCheckbox.setAttribute("type","checkbox");
        oCheckbox.setAttribute("id","enable-auto-reload");
        if (GM_getValue('pluginEnabled') == null) {
            GM_setValue('pluginEnabled', false);  // init value by default
        }
        oCheckbox.checked = GM_getValue('pluginEnabled');
        oCheckbox.onclick = function setEnable() {
            GM_setValue('pluginEnabled', oCheckbox.checked);

            if (oCheckbox.checked == true) {
                location.reload();
            }
        }
        var mydiv = document.getElementsByClassName("header-index-search")[0];
        mydiv.appendChild(oCheckbox);
        mydiv.appendChild(myText);

        function autoTurnPage(direction) {
            if (!GM_getValue('pluginEnabled')) {
                return;
            }

            // check living class
            var classIsLivingTag = document.getElementsByClassName("live-tag-ctn");
            traverseLivingClass(classIsLivingTag, 0);

            // get buttons
            var prev = document.getElementsByClassName("tab-move-btn tab-prev-btn");
            var next = document.getElementsByClassName("tab-move-btn tab-next-btn");

            // change direction if need
            if ((prev.length === 0 && direction === 0) || (next.length === 0 && direction === 1)) {
                direction = !direction;
            }

            turnPage(prev, next, direction).then(function () {
                autoTurnPage(direction);
            })
        }

        autoTurnPage(1);
        
    }, 1000);
})();

function traverseLivingClass(classIsLivingTag, i) {
    if (classIsLivingTag.length === 0) {
        return;
    }

    // send notification
    var classTittle = classIsLivingTag[i].previousElementSibling;
    if (window.Notification && Notification.permission === "granted") {
        var n = new Notification("检测到有正在直播的课程", {body: classTittle.innerHTML});
    }

    clickLivingClassTab(classIsLivingTag, i).then(function() {
        // enter the class
        var enteringClassroomButton = document.getElementsByClassName("live-link js-open-tencent")[0];
        enteringClassroomButton.click();

        // control loop
        if (i < classIsLivingTag.length) {
            traverseLivingClass(i + 1);
        }
    })
}

function clickLivingClassTab(classIsLivingTag, i) {
    return new Promise((resolve) => {
        var classTabButton = classIsLivingTag[i].parentElement;
        classTabButton.click();
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

function turnPage(prev, next, direction) { // direction: 0 for forward, 1 for next
    return new Promise(function (resolve) {
        // turn the page
        if (direction == 0) { // use "===" caused some problems: direction is a boolean value by default
            prev[0].click();
        } else {
            next[0].click();
        }
        setTimeout(() => {
            resolve();
        }, 1000);
    })
}