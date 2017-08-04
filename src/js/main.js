(function () {


    // FLEXBOX & SCROLLBAR SUPPORT CHECK
    var flexStyle = document.createElement('div').style.flex,
        isWebkit = /WebKit/.test(navigator.userAgent),
        bodyElem = document.getElementsByTagName('body')[0];

    if (flexStyle === undefined) {
        bodyElem.classList.add('flexbox-unsupported');
    }

    if (isWebkit) {
        bodyElem.classList.add('scrollbar-supported');
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


})();
