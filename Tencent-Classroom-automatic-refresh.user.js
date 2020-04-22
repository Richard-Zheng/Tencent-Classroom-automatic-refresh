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
var isFirstPage = false;
var isLastPage = false;
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
        var oCheckbox=document.createElement("input");
        var myText=document.createTextNode("启用自动刷新");
        oCheckbox.setAttribute("type","checkbox");
        oCheckbox.setAttribute("id","enable-auto-reload");
        if (GM_getValue('isPluginEnabled')  == null) {
            GM_setValue('isPluginEnabled', false);  // init value by default
        }
        oCheckbox.checked = GM_getValue('isPluginEnabled');
        oCheckbox.onclick = function setEnable() {
            GM_setValue('isPluginEnabled', oCheckbox.checked);

            if (oCheckbox.checked == true) {
                location.reload();
            }
        }
        var mydiv=document.getElementsByClassName("header-index-search")[0];
        mydiv.appendChild(oCheckbox);
        mydiv.appendChild(myText);

        if (GM_getValue('isPluginEnabled')) {
            // check living class and auto refresh
            function turnPage(direction) { // direction: 0 for forward, 1 for next 
                // get buttons
                var prev = document.getElementsByClassName("tab-move-btn tab-prev-btn");
                var next = document.getElementsByClassName("tab-move-btn tab-next-btn");

                var needChangeDirection = false;
                // check for first/last page
                if (prev.length == 0) {
                    isFirstPage = true;
                    if (direction == 0) {
                        needChangeDirection = true;
                    }
                } else if (next.length == 0) {
                    isLastPage = true;
                    if (direction == 1) {
                        needChangeDirection = true;
                    }
                }

                // check living class
                var classIsLivingTag = document.getElementsByClassName("live-tag-ctn");
                for (var i = 0; i < classIsLivingTag.length; i++) {
                    var classTittle = classIsLivingTag[i].previousElementSibling;
                    if (isTabInFocus && window.Notification && Notification.permission === "granted") {
                        var n = new Notification("检测到有正在直播的课程", {body: classTittle.innerHTML});
                        var classTabButton = classIsLivingTag[i].parentElement;
                        classTabButton.click();
                        // Here has some issues, I will fix it later.
                        // need delay
                        var enteringClassroomButton = document.getElementsByClassName("live-link js-open-tencent")[0];
                        enteringClassroomButton.click();
                    }
                }

                // turn the page
                if (GM_getValue('isPluginEnabled')) {
                    if (!needChangeDirection) {
                        if (direction == 0) {
                            prev[0].click();
                        } else {
                            next[0].click();
                        }
                        setTimeout(() => {
                            turnPage(direction);  // loop the function
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            isFirstPage = false;
                            isLastPage = false;
                            turnPage(!direction); // change the direction
                        }, 1000);
                    }
                }
            }

            turnPage(1);
        }
    }, 1000);

})();