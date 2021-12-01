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

        //stores our custom CSS for the tags
        const css = ".bc-tag{display:inline;background-color:#596568;color:#fff!important;text-decoration:none!important;padding:5px 13px;border-radius:15px}html[data-theme=purple] .bc-tag{background-color:#725ead}html[data-theme=blue] .bc-tag{background-color:#1b6ac9}html[data-theme=green] .bc-tag{background-color:#2da562}html[data-theme=orange] .bc-tag{background-color:#d4442e}html[data-theme=charcoal] .bc-tag{background-color:#596568}";
        
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

        //this will store an array of tags
        let original_tags = [];

        function apply_tags() {

            //find all thread messages
            let messages = document.getElementsByClassName('thread-entry__content');

            //if we have messages
            if (messages) {

                //loop over all messages
                for (let i = 0; i < messages.length; i++) {

                    if (!messages[i].classList.contains('bc-tag-visited')) {

                        //isolate all potential tag text from this message
                        const tags = (messages[i].innerHTML).match(/#(\S*)/g);

                        //if there are some potential tags here
                        if (tags) {

                            //loop over them
                            for (let ii = 0; ii < tags.length; ii++) {

                                //remove any HTML elements
                                tags[ii] = tags[ii].replace(/(<([^>]+)>)/gi, "");

                                //if this tag still doesn't contain any HTML elements
                                if (!tags[ii].includes(">")) {

                                    //form a unqiue tag ID
                                    const id = 'bc-tag-' + tags[ii].replace('#', '');

                                    //assume this is the original and build up a HTML ID
                                    let id_html = 'id="' + id + '"';

                                    //if this tag has already been found
                                    if (original_tags.includes(id)) {

                                        //change the HTML to a href (targets the original tag)
                                        id_html = 'href="#' + id + '"';
                                    } else {

                                        //otherwise add this to the array of found tags
                                        original_tags.push(id);
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
            }
        }

        document.addEventListener('click', function(event) {

            //if the clicked element isn't one of our tags
            if (!event.target.matches('.bc-tag')) return;

            //attempt to find our target tag
            let target = document.getElementById(event.target.getAttribute("href").replace('#', ''));
          
            //if we have a target tag
            if(target) {
              
              //don't follow the link as we can smooth scroll to it
              event.preventDefault();
              
              //calculate the offset this element has from the display
              var viewportOffset = target.getBoundingClientRect();

              //smooth scroll to the element
              window.scroll({
                  behavior: 'smooth',
                  left: 0,
                  top: viewportOffset.top
              });
            }
          
        }, false);

        //applys tags on page load
        apply_tags();

        //look to apply tags every 30s to account for new messages coming in
        setInterval(function() {
            apply_tags();
        }, 30000);
    });
})();
