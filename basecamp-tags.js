// ==UserScript==
// @name         Basecamp - Tags
// @namespace    https://github.com/jackduffy
// @version      0.1
// @description  Allow anchor tags in Basecamp Threads
// @author       Jack Duffy
// @match        https://3.basecamp.com/*
// @icon         https://3.basecamp.com/favicon-32x32.png
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';

    document.addEventListener("DOMContentLoaded", function() {

        let first_run = true;

        //if this is the first time the script is running on the page
        if (first_run) {

            //stores our custom CSS for the tags
            const css = `
            .bc-tag,
            .bc-parent-tag {
              display:inline-block;
              background-color:#596568;
              color:#fff!important;
              text-decoration:none!important;
              padding:5px 13px;
              border-radius:15px;
              transition: transform 0.3s ease;
            }

            .bc-completed-tag {
              position: relative;
              filter: grayscale(100%);
              opacity: 0.2;
            }

            .bc-completed-tag ul {
              margin-top: 0 !important;
              max-height: 0px;
              transition: max-height 0.3s ease;
              overflow: hidden;
            }

            .bc-completed-tag ul a {
              text-decoration: line-through;
              font-size: 12px;
            }

            .bc-completed-tag:hover {
              opacity: 1;
            }

            .bc-completed-tag:hover ul {
              max-height: 100vh;
              transition: max-height 2s ease;
            }

            .bc-tag strong,
            .bc-parent-tag strong {
              pointer-events: none;   
            }

            html[data-theme=purple] .bc-tag,
            html[data-theme=purple] .bc-parent-tag {
              background-color:#725ead
            }

            html[data-theme=blue] .bc-tag,
            html[data-theme=blue] .bc-parent-tag {
              background-color:#1b6ac9
            }

            html[data-theme=green] .bc-tag,
            html[data-theme=green] .bc-parent-tag { 
              background-color:#2da562
            }

            html[data-theme=orange] .bc-tag,
            html[data-theme=orange] .bc-parent-tag { 
              background-color:#d4442e
            }

            html[data-theme=charcoal] .bc-tag,
            html[data-theme=charcoal] .bc-parent-tag { 
              background-color:#596568
            }

            .bc-tag-reveal-anim {
              transform: scale(2);
              transition: transform 0.1s ease;
            }

            #bc-tag-sidebar {
              position: fixed;
              top: 85px;
              left: 30px;
              width: 270px;
              background-color: white;
              box-shadow: 0 -1px 10px rgb(0 0 0 / 5%), 0 1px 4px rgb(0 0 0 / 10%), 0 10px 30px #f3ece8;
              padding: 15px;
              border-radius: 0.2em;
              z-index: 100;
            }

            #bc-tag-sidebar svg {
              width: 30px;
            }

            #bc-tag-sidebar:before {
              content: 'Tags';
              display: block;
              font-weight: bold;
              position: absolute;
              top: 19px;
              left: 50px;
            }

            #bc-tag-sidebar ul {
              padding: 0;
              list-style: none;
              margin: 10px 0 0 0;
            }

            #bc-tag-sidebar ul > li + li {
              margin-top: 5px;
            }

            #bc-tag-sidebar ul ul {
              padding: 0 0 0 15px;
              margin: 7.5px 0 0;
            }

            .bc-sidebar-tag small {
              pointer-events: none;
              display: block;
              transform: translateY(-3px);
            }
          `;

            //fetch the document head
            let head = document.head || document.getElementsByTagName('head')[0];

            //create a new style element
            let style = document.createElement('style');

            //add our new style tag
            head.appendChild(style);

            //set its text type to CSS
            style.type = 'text/css';

            //if IE8 or below
            if (style.styleSheet) {

                //Use a fallback method of setting text
                style.styleSheet.cssText = css;
            } else {

                //otherwise append the child node
                style.appendChild(document.createTextNode(css));
            }
        }

        //this function will append an approrpaite suffix onto the instance number
        function nth(update) {

            if (update > 3 && update < 21) {
                return 'th';
            }

            switch (update % 10) {
                case 1:
                    return update + "st";
                case 2:
                    return update + "nd";
                case 3:
                    return update + "rd";
                default:
                    return update + "th";
            }
        }

        //this is the master function that applies all the tags
        function apply_tags() {

            //find all thread messages
            let messages = document.getElementsByClassName('thread-entry__content');

            //if we have messages
            if (messages) {

                //this will store an array of tags
                let original_tags = [];

                //this will store an array of tags marked as completed
                let completed_tags = [];

                //this will contain an array of parent IDs which contains child IDs
                let tag_sidebar = [];

                //loop over all messages
                for (let i = 0; i < messages.length; i++) {

                    if (!messages[i].classList.contains('bc-tag-visited')) {

                        //isolate all potential tag text from this message
                        let tags = (messages[i].innerHTML).match(/(^|\W)(#[a-z\d][\w-]*)/ig);

                        //if there are some potential tags here
                        if (tags) {

                            //loop over them
                            for (let ii = 0; ii < tags.length; ii++) {

                                //remove any HTML start/end elements
                                tags[ii] = (tags[ii].replace(">", "")).replace("<", "");

                                // if this tag still doesn't contain any HTML elements
                                if (!tags[ii].includes(">")) {

                                    //get position of this string inside the message
                                    let pos = (messages[i].innerHTML).search(tags[ii]);

                                    //extract the previous characters prior to the tag
                                    let prev_chars = (messages[i].innerHTML).substring((pos - 5), pos); //get first 5 chars

                                    //form a unqiue tag ID
                                    let id = 'bc-tag-' + tags[ii].replace('#', '');

                                    //assume this is the original and build up a HTML ID
                                    let id_html = 'id="' + id + '" " href="#' + id + '"';

                                    //if this tag has already been found
                                    if (original_tags.includes(id)) {

                                        //create an instance ID
                                        let instance_id = id + '-' + tag_sidebar[id].length;

                                        //change the HTML to a href (targets the original tag)
                                        id_html = 'id="' + instance_id + '" href="#' + id + '"';

                                        //push onto the parent ID's array
                                        tag_sidebar[id].push(instance_id);

                                        //if this instance has been marked as completed
                                        if (prev_chars == '<del>') {
                                            //push it onto the completed tags array
                                            completed_tags.push(id);
                                        }


                                    } else {

                                        //otherwise add this to the array of found tags
                                        original_tags.push(id);

                                        //create a reference for this tag in the sidebar
                                        tag_sidebar[id] = [];
                                    }


                                    //find/replace the plain text tag with our custom element 
                                    messages[i].innerHTML = messages[i].innerHTML.replace(tags[ii], '<a ' + id_html + ' class="bc-tag">' + tags[ii] + '<a>');

                                    //add a class to indicate to future runs that this message has been parsed
                                    messages[i].classList.add('bc-tag-visited');
                                }
                            }
                        }
                    }
                }



                //if we have some elements to populate the sidebar
                if (original_tags.length) {

                    //this will hold our sidebar html
                    let sidebar_html = '';

                    //loop over the original tags of each instance
                    for (let i = 0; i < original_tags.length; i++) {

                        //fetch all subsequent re-tags
                        let tag_instances = tag_sidebar[original_tags[i]];

                        //start building out the sidebar by listing the original tag
                        sidebar_html = sidebar_html + '<li' + (completed_tags.includes(original_tags[i]) ? ' class="bc-completed-tag"' : '') + '><a class="bc-sidebar-tag bc-parent-tag" href="#' + original_tags[i] + '"><strong>#' + original_tags[i].replace("bc-tag-", "") + '</strong></a>';

                        //if we have some subsequent re-tags
                        if (tag_instances) {

                            //add the start of a new list
                            sidebar_html = sidebar_html + '<ul>';

                            //loop over each re-tag
                            for (let ii = 0; ii < tag_instances.length; ii++) {

                                //this will contain a time element if found
                                let time = false;

                                //attempt to find the tag element
                                let tag = document.getElementById(tag_instances[ii]);

                                //if we have a valid tag element
                                if (tag) {

                                    //find the parent article
                                    let parent_comment = tag.closest('article[data-type="comment"]');

                                    //update time element
                                    time = parent_comment.getElementsByTagName('time')[0];
                                }


                                //add the re-tag to the menu
                                sidebar_html = sidebar_html + '<li><a class="bc-sidebar-tag" href="#' + tag_instances[ii] + '">' + nth(ii + 1) + ' Update' + (time ? '<small>' + time.title + '</small>' : '') + '</a>';
                            }

                            //close off the sub list
                            sidebar_html = sidebar_html + '</ul>';
                        }

                        //close off the parent tag
                        sidebar_html = sidebar_html + '</li>';
                    }

                    //creates an SVG of our logo
                    let laserred_logo = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="laserred-icon" x="0px" y="0px" viewBox="0 0 45.1 45.1" style="enable-background:new 0 0 45.1 45.1;" xml:space="preserve" class="svg-logo md-mr- svg" src="https://laser.red/wp-content/themes/laser.red-2019/graphics/laser.red.icon.svg"><style type="text/css">.st0{fill:#D81F26;}</style><path class="st0" d="M32.1,19.1l-6.6,13.2l6.4,12.9H26l-6.4-12.9l6.6-13.2l-3.6-7.2L8.6,39.7l7.4,0l2.7,5.4H0L22.5,0L32.1,19.1z   M35.7,26.3l-3,5.9l6.4,12.9h5.9L35.7,26.3z"></path></svg>';

                    //finish off the sidebar HTML
                    sidebar_html = '<div id="bc-tag-sidebar" data-updated="' + Date.now() + '">' + laserred_logo + '<ul>' + sidebar_html + '</ul></div>';

                    //if this is the first run
                    if (first_run) {


                        //create a sidebar container div
                        var sidebar_container = document.createElement("div");

                        //add the sidebar HTML inside the container div
                        sidebar_container.innerHTML = sidebar_html;

                        //fetch the thread element
                        var thread = document.getElementById("thread");

                        //append the sidebar to the thread
                        thread.parentNode.insertBefore(sidebar_container, thread.nextSibling);
                    } else {


                        let sidebar = document.getElementById("bc-tag-sidebar");

                        if (sidebar) {
                            sidebar.parentNode.innerHTML = sidebar_html;
                        }

                    }

                    //indicate the first run has completed
                    first_run = false;
                }
            }
        }

        //when one of our tags is clicked (in a message or in the sidebar)
        document.addEventListener('click', function(event) {

            //if the clicked element isn't one of our tags
            if (event.target.matches('.bc-tag') || event.target.matches('.bc-sidebar-tag')) {

                //attempt to find our target tag
                let target = document.getElementById(event.target.getAttribute("href").replace('#', ''));

                //if we have a target tag
                if (target) {

                    //don't follow the link as we can smooth scroll to it
                    event.preventDefault();

                    //scroll the tag into view smoothly
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    });

                    //add a reveal animation
                    target.classList.add('bc-tag-reveal-anim');

                    //after 1s
                    setTimeout(function() {

                        //remove the reveal animation
                        target.classList.remove('bc-tag-reveal-anim');
                    }, 1000);
                }
            }

        }, false);

        //applys tags on page load
        apply_tags();

        //when a new comment is added, re-apply the tags to catch any new ones
        document.addEventListener('click', function(event) {

            //if the clicked element isn't a basecamp button
            if (event.target.matches('.btn')) {

                setTimeout(function() {

                    //re-apply the tags
                    apply_tags();
                }, 300);
            }
        }, false);

        //look to apply tags every 30s to account for new messages coming in
        setInterval(function() {
            apply_tags();
        }, 3000);
    });
})();
