(function () {
    'use strict';


    // FLEXBOX & SCROLLBAR SUPPORT CHECK
    var flexStyle = document.createElement('div').style.flex,
        isWebkit = /WebKit/.test(navigator.userAgent),
        bodyElem = document.getElementsByTagName('body')[0],
        headElem = document.getElementsByTagName('head')[0];

    function createLinkElem(href) {
        if (typeof href !== 'string') {
            return;
        }

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;

        return link;
    }

    if (flexStyle === undefined) { // Troszkę dłuższy temat :)
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
            alert('You clicked navigation button which should triger function to show ' + this.getAttribute('data-status') + ' Github issues');
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
