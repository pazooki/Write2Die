 
import { Events } from '../global/libs/events.js';

function auth() {
    let payload = {
        action: 'in',
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    var next = [(new URL(window.location.href)).origin, PageLoader.getParam('next')].join('/');
    API.authenticateUser(payload).then((uuid) => {
        if (next) {
            window.location.href = next;
        } else {
            window.location.href = API.routeWithParams(API.Router.site__index.url, {'page': 'overview'});
        }
        API.getUserData().then(data => {
            window.localStorage.setItem('user', JSON.stringify(data));
            Events.whenUserDataIsReady(data);
            console.log('uuid in get user data', API.getUserUUID())

        });
    })
}

$(document).ready(function () {
    document.getElementById("sign-in-btn").addEventListener("click", auth);
});
