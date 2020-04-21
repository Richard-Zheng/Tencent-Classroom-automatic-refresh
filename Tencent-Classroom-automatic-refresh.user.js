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
            function toForward() {
                //get buttons
                var prev = document.getElementsByClassName("tab-move-btn tab-prev-btn");
                var next = document.getElementsByClassName("tab-move-btn tab-next-btn");

                //check for first/last page
                if (prev.length == 0) {
                    firstpage = true;
                } else if (next.length == 0) {
                    lastpage = true;
                }

                //alert("Forw " + firstpage);
                if (!firstpage && GM_getValue('enableplugin')) {
                    prev[0].click();
                    setTimeout(() => {
                        toForward();  //loop the function
                    }, 1000);
                } else if (firstpage && GM_getValue('enableplugin')) {
                    setTimeout(() => {
                        firstpage = false;
                        lastpage = false;
                        toNext();
                    }, 1000);
                }
            }
            function toNext() {
                //get buttons
                var prev = document.getElementsByClassName("tab-move-btn tab-prev-btn");
                var next = document.getElementsByClassName("tab-move-btn tab-next-btn");

                //check for first/last page
                if (prev.length == 0) {
                    firstpage = true;
                } else if (next.length == 0) {
                    lastpage = true;
                }

                //alert("Next " + lastpage);
                if (!lastpage && GM_getValue('enableplugin')) {
                    next[0].click();
                    setTimeout(() => {
                        toNext();  //loop the function
                    }, 1000);
                } else if (lastpage && GM_getValue('enableplugin')) {
                    setTimeout(() => {
                        firstpage = false;
                        lastpage = false;
                        toForward();
                    }, 1000);
                }
            }

            toNext();
        }
    }, 1000);

})();