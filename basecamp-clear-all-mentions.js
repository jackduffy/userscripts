// ==UserScript==
// @name         Basecamp - Clear all non-mentions
// @namespace    https://github.com/jackduffy
// @version      0.1
// @description  Adds a button allowing you to clear all notifications that aren't mentions.
// @author       Jack Duffy
// @match        https://3.basecamp.com/*
// @icon         https://3.basecamp.com/favicon-32x32.png
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';

    //store the hey menu reference
    let hey_menu = false;

    document.addEventListener('click', function(event) {

        // If the clicked element isn't the hey menu
        if (!event.target.matches('.nav__link--hey')) return;

        //set delay to account for menu opening and rendering
        setTimeout(function() {

            //fetch the hey menu
            hey_menu = document.getElementById('navigation_readings');

            //if the menu has been fetched
            if (hey_menu) {

                //find the current mark as read button
                let markAsRead = hey_menu.querySelector('[data-read-unread-menu]');


                //create our new button
                var clearAllButton = document.createElement('button');
                clearAllButton.innerHTML = 'Clear non-mentions';
                clearAllButton.title = "Clear non-mentions";
                clearAllButton.name = "button";
                clearAllButton.type = "button";
                clearAllButton.id = "clear-non-mentions";
                clearAllButton.classList.add("plain-btn");
                clearAllButton.style.marginLeft = '10px';


                //insert it after the current clear/all button
                markAsRead.parentNode.insertBefore(clearAllButton, markAsRead.nextSibling);
            }
        }, 300);

    }, false);

    document.addEventListener('click', function(event) {

        // If the clicked element isn't the new clear all mentions button
        if (!event.target.matches('#clear-non-mentions')) return;

      
        //if the menu still exists
        if (hey_menu) {
            
            //fetch all unread notifications
            let unread = hey_menu.querySelectorAll('section.readings--unreads article');

            //loop through unread notifications
            for (let i = 0; i < unread.length; i++) {

                //if this notification doesn't have the mention graphic
                if (unread[i].getElementsByClassName('content-type-icon--mention').length == 0) {
        
                    //fetch the target
                    let read_button = unread[i].getElementsByClassName('unread-badge--clearable')[0];
                  
                    //click - bye bye!
                    read_button.click();
                }
            }
        }
    }, false);
})();
