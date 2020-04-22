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

(function() {
    'use strict';
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