// ==UserScript==
// @name        Basecamp - Reverse message order
// @namespace    https://github.com/jackduffy
// @version      0.1
// @description  Reverse comment order of Basecamp threads
// @author       Jack Duffy
// @match        https://3.basecamp.com/*
// @icon         https://3.basecamp.com/favicon-32x32.png
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';

    document.addEventListener("DOMContentLoaded", function() {

        var css = '.thread--comments, .thread__entries { display: flex; flex-direction: column; } .thread--comments { order: 1 } .thread__entries { order: 2; flex-direction: column-reverse; } .thread__subscriptions { order: 3 }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

    });

})();
