// ==UserScript==
// @name         TailwindCSS - Convert REM to PX
// @namespace    https://github.com/laserred
// @license      MIT
// @version      0.1
// @description  To make working with existing builds and XD designs easier
// @author       Jack Duffy
// @match        https://tailwindcss.com/docs/*
// @icon         https://tailwindcss.com/favicon-32x32.png
// @updateURL    https://raw.githubusercontent.com/jackduffy/userscripts/main/tailwindcss-rem-to-px.js
// @downloadURL  https://raw.githubusercontent.com/jackduffy/userscripts/main/tailwindcss-rem-to-px.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
(function() {
    'use strict';


    function convert_rem_to_px() {
        setTimeout(function() {

            //fetch all td attributes
            var tags = document.getElementsByTagName("td");

            //loop over all elements
            for (var i = 0; i < tags.length; i++) {

                //if this element contains a rem value and it hasn't already been parsed by the converter
                if (tags[i].innerHTML.includes('rem') && !tags[i].hasAttribute("data-alt-px")) {
                  
                  var rems = tags[i].innerHTML.match(/[+-]?\d+(\.\d+)?/g).map(function(v) { return parseFloat(v); });
                  
                    for(let ii = 0; ii < rems.length; ii++) {

                      //extract the rem value
                      let rem = rems[ii];

                      //if the rem value exists
                      if (rem) {

                          //attempt to convert to px
                          let px = rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

                          //if we have a valid px value
                          if (px) {
                              //append the helper to the element we found this on
                              tags[i].innerHTML = tags[i].innerHTML.replace((rem +'rem;'), (rem + 'rem <span>(' + px + 'px)</span>;'));

                              //set the attribute to indicate we've visited it
                              tags[i].setAttribute('data-alt-px', true);
                          }

                      }
                    }
                }
            }
        }, 100);
    }

    document.addEventListener('DOMContentLoaded', (event) => {

        //this function will fire when the body mutates
        var observer = new MutationObserver(function(event) {
          
            //call the converter
            convert_rem_to_px();
        })

        //set up an observer function on the body
        observer.observe(document.getElementsByTagName('body')[0], {
            attributes: true,
            attributeFilter: ['class'],
            childList: false,
            characterData: false
        })

        //call the converter (to ensure it's run on page load)
        convert_rem_to_px();
    });

})();