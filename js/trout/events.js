export class Events {
    constructor(State){
        this.State = State;
    }

    // setupSidenavbar(subApp){
    //     this.highlightSidenavbarItem(subApp);
    //     var defaultSignInURL = 'user/sign-in&next=';
    //     var signedInOnlyItems = document.getElementsByClassName('signed-in-only');
    //     for (let signedInOnlyItem of signedInOnlyItems){
    //         let uuid = this.State.Root.Services.Data.Cookies.getCookie('uuid')
    //         if ( uuid === "null" || uuid === ''){
    //             signedInOnlyItem.setAttribute('href', defaultSignInURL + signedInOnlyItem.href);
    //         }
    //     }
    //     // let sideNavItems = document.querySelectorAll('.subapp');
    //     // const sidebarElement = document.getElementsByClassName("sidebar")[0];
    //     // console.log(sideNavItems);
    //     // let that = this;
    //     // for (let subapp of sideNavItems) {
    //     //     subapp.addEventListener('click', function(){
    //     //         console.log('Collapsing sidenavbar');
    //     //         sidebarElement.classList.toggle("collapsed");
    //     //         that.setupSimplebar();
    //     //     })
    //     // }
    // }

    initTooltips(){
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
        return tooltipList;
    }
    
    ifAuthenticated(user){
        var ifSignedOutObjects = document.getElementsByClassName('if_signed_out');
        var ifSignedInObjects = document.getElementsByClassName('if_signed_in');

        // Signed In
        if (user !== null && user !== undefined && user.hasOwnProperty('fullname')){
            for (var signedOutObj of ifSignedOutObjects){
                signedOutObj.parentNode.removeChild(signedOutObj);
            }

            for (var signedInObj of ifSignedInObjects){
                signedInObj.style.visibility = 'visible';
            }

            let profile_btn = document.getElementById('signed_in_user_profile_button');
            profile_btn.innerHTML = user.fullname;

        } else { // Not Signed In
            for (var signedInObj of ifSignedInObjects){
                signedInObj.parentNode.removeChild(signedInObj);
            }

            for (var signedOutObj of ifSignedOutObjects){
                signedOutObj.style.visibility = 'visible';
            }
        }
    }

    captureErrorsGlobal(){
        window.onerror = function(message, source, lineno, colno, error) {
            this.State.Root.Services.Network.logback({message: message, source: source, lineno: lineno, colno: colno}, error)
        };
    }

    beforeLeavingPage(tracker){
        window.onbeforeunload = function(){
            this.State.Root.Services.API.beacon(this.State.Root.Router.service_tracking, tracker.results);
        }
    }

    setupSearch(){
        this.State.Root.Services.Search.setupSearchAutoComplete('searchDataListOptions', 'searchDataList')
    }
    
    setup = (subApp) => {
        // this.captureErrorsGlobal();
        let user = this.State.Root.Services.Auth.getUserDataFromStorage();
        this.ifAuthenticated(user);
        // this.setupSearch();
    }
}