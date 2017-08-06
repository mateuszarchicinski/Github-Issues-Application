(function () {
    'use strict';


    // FLEXBOX & SCROLLBAR SUPPORT CHECK
    var isWebkit = /WebKit/.test(navigator.userAgent),
        bodyElem = document.getElementsByTagName('body')[0],
        headElem = document.getElementsByTagName('head')[0];

    function isFlexbox() {
        var stylesList = ['flex', 'flexDirection', 'justifyContent'], // Only these are used in CSS styles
            testingElem = document.createElement('div');

        testingElem.style.display = 'flex';

        if (!testingElem.style.display) {
            return false;
        }

        for (var i in stylesList) {
            if (testingElem.style[stylesList[i]] === undefined) {
                return false;
            }
        }

        return true;
    }

    function createLinkElem(href) {
        if (typeof href !== 'string') {
            return;
        }

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;

        return link;
    }

    if (!isFlexbox()) { // Troszkę dłuższy temat :)
        bodyElem.classList.add('flexbox-unsupported');

        headElem.appendChild(createLinkElem('css/flexbox-unsupport.css'));
    }

    if (isWebkit) {
        bodyElem.classList.add('scrollbar-supported');

        headElem.appendChild(createLinkElem('css/scrollbar-support.css'));
    }


    // OSX BUTTONS
    var osxButtons = document.querySelector('.osx-buttons-js');

    osxButtons.addEventListener('click', function (evt) {
        var cliskedButton = evt.target.getAttribute('type') === 'button' ? evt.target : false;

        if (cliskedButton) {
            alert('This button is used: ' + cliskedButton.getAttribute('aria-label'));
        }
    });


    // NAV BUTTONS
    var navButtons = [].slice.call(document.querySelectorAll('.nav-button-js'));

    for (var i in navButtons) {
        navButtons[i].addEventListener('click', function () {
            var self = this,
                activeBtn = document.querySelector('.nav-button-js.active');

            if (self === activeBtn) {
                return;
            }

            activeBtn.classList.remove('active');

            self.classList.add('active');

            setTimeout(function () {
                alert('You clicked navigation button which should triger function to show ' + self.getAttribute('data-status') + ' Github issues');
            }, 500);
        });
    }


    // ISSUE FAVOURITE    
    document.addEventListener('keypress', function (evt) {
        var favElem = document.querySelector('.issue-favourite:focus input');

        if (evt.keyCode == 13 && favElem) {
            favElem.checked = !favElem.checked;
        }
    });


})();
