 

function signup() {
    let payload = {
        action: 'signup',
        fullname: document.getElementById('fullname').value || null,
        email: document.getElementById('email').value || null,
        password: document.getElementById('password').value || null
    };

    var next = [(new URL(window.location.href)).origin, PageLoader.getParam('next')].join('/');

    console.log('signup', next, payload);
    API.Post(API.Router.api__signup, payload, {}).then(data => {
        if (data.hasOwnProperty('uuid')) {
            API.setCookie('uuid', data.uuid, 365 * 10);
            if (next) {
                window.location.href = next;
            } else {
                window.location.href = API.routeWithParams(API.Router.site__index.url, {'page': 'overview'});
            }
        } else {
            PageLoader.HTML.toast('Signup was not successful.');
        }
    }, reason => {
        console.log(reason);
    });
}

$(document).ready(function () {
    document.getElementById("btn-sign-up").addEventListener("click", signup);
});
