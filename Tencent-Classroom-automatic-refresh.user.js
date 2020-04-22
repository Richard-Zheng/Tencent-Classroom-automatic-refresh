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
var firstpage = false;
var lastpage = false;
var tabfocus = true;

(function() {
    'use strict';
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState == "hidden") {
            tabfocus = false;
        } else {
            tabfocus = true;
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

    //wait for loading complete
    setTimeout(() => {
        //create checkbox
        var oCheckbox=document.createElement("input");
        var myText=document.createTextNode("启用自动刷新");
        oCheckbox.setAttribute("type","checkbox");
        oCheckbox.setAttribute("id","enable-auto-reload");
        if (GM_getValue('enableplugin')  == null) {
            GM_setValue('enableplugin', false);  //init value by default
        }
        oCheckbox.checked = GM_getValue('enableplugin');
        oCheckbox.onclick = function setEnable() {
            GM_setValue('enableplugin', oCheckbox.checked);

            if (oCheckbox.checked == true) {
                location.reload();
            }
        }
        var mydiv=document.getElementsByClassName("header-index-search")[0];
        mydiv.appendChild(oCheckbox);
        mydiv.appendChild(myText);

        //auto click next
        if (GM_getValue('enableplugin')) {

            function turnPage(direction) { //direction : 0 for forward, 1 for next 
                //get buttons
                var prev = document.getElementsByClassName("tab-move-btn tab-prev-btn");
                var next = document.getElementsByClassName("tab-move-btn tab-next-btn");

                var need_change_direction = false;
                //check for first/last page
                if (prev.length == 0) {
                    firstpage = true;
                    if (direction == 0) {
                        need_change_direction = true;
                    }
                } else if (next.length == 0) {
                    lastpage = true;
                    if (direction == 1) {
                        need_change_direction = true;
                    }
                }

                //check living class
                var livingclass = document.getElementsByClassName("live-tag-ctn");
                for (var i = 0; i < livingclass.length; i++) {
                    var tittle = livingclass[i].previousElementSibling;
                    if (tabfocus && window.Notification && Notification.permission === "granted") {
                        var n = new Notification("检测到有正在直播的课程", {body: tittle.innerHTML});
                        var tabbutton = livingclass[i].parentElement;
                        tabbutton.click();
                        //Here has some issues, I will fix it later.
                        //need delay
                        var taskbutton = document.getElementsByClassName("live-link js-open-tencent")[0];
                        taskbutton.click();
                    }
                }

                if (GM_getValue('enableplugin')) {
                    if (!need_change_direction) {
                        if (direction == 0) {
                            prev[0].click();
                        } else {
                            next[0].click();
                        }
                        setTimeout(() => {
                            turnPage(direction);  //loop the function
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            firstpage = false;
                            lastpage = false;
                            turnPage(!direction); //change the direction
                        }, 1000);
                    }
                }
            }

            turnPage(1);
        }
    }, 1000);

})();

function showNotifi(status,str) {
    console.log(status); // 仅当值为 "granted" 时显示通知
    var n = new Notification("腾讯课堂", {body: str}); // 显示通知
}