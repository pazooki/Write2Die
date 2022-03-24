export class Events {
    constructor(State){
        this.State = State;
    }
    setupSimplebar(){
        const simpleBarElement = document.getElementsByClassName("js-simplebar")[0];
        if(simpleBarElement){
            try {
                new SimpleBar(document.getElementsByClassName("js-simplebar")[0])
                const sidebarElement = document.getElementsByClassName("sidebar")[0];
                const sidebarToggleElement = document.getElementsByClassName("sidebar-toggle")[0];
                sidebarToggleElement.addEventListener("click", () => {
                    sidebarElement.classList.toggle("collapsed");
        
                    sidebarElement.addEventListener("transitionend", () => {
                        window.dispatchEvent(new Event("resize"));
                    });
                });
            } catch (error) {
                console.log('SimpleBar is not imported.');
            }
        }
    }
    
    
    setupEventsForTabs(){
        if (window.location.hash){
            $('.nav-tabs button[href="' + window.location.hash + '"]').tab('show');
        }
        $('.nav-tabs button').click(function (e) {
            $(this).tab('show');
            if (this && this.attributes && this.attributes.href){
                window.location.hash = this.attributes.href.value;
                var scrollmem = $('body').scrollTop() || $('html').scrollTop();
                $('html,body').scrollTop(scrollmem);
            }
        });
    }
    
    highlightSidenavbarItem(subApp){
        for (let sideNavBarPage of $('.subapp')){
            sideNavBarPage.parentElement.classList.remove('active');
            if (sideNavBarPage.id === subApp){
                sideNavBarPage.parentElement.classList.add('active');
            }
        }
    }
    
    setupSidenavbar(subApp){
        this.highlightSidenavbarItem(subApp);
        var defaultSignInURL = 'user/sign-in&next=';
        var signedInOnlyItems = document.getElementsByClassName('signed-in-only');
        for (let signedInOnlyItem of signedInOnlyItems){
            let uuid = this.State.Root.Services.Data.Cookies.getCookie('uuid')
            if ( uuid === "null" || uuid === ''){
                signedInOnlyItem.setAttribute('href', defaultSignInURL + signedInOnlyItem.href);
            }
        }
        // let sideNavItems = document.querySelectorAll('.subapp');
        // const sidebarElement = document.getElementsByClassName("sidebar")[0];
        // console.log(sideNavItems);
        // let that = this;
        // for (let subapp of sideNavItems) {
        //     subapp.addEventListener('click', function(){
        //         console.log('Collapsing sidenavbar');
        //         sidebarElement.classList.toggle("collapsed");
        //         that.setupSimplebar();
        //     })
        // }
    }

    initTooltips(){
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
        return tooltipList;
    }
    
    whenUserDataIsReady(user){
        if (user !== null && user !== undefined && user.hasOwnProperty('fullname')){
            document.getElementById('if_signed_out').style.visibility = 'hidden';
            document.getElementById('if_signed_in').style.visibility = 'visible';
            document.getElementById('signed_in_dropdown').innerHTML = user.fullname;
            for (let htmlElement of document.getElementById('side-menu').querySelectorAll('.hide-for-signed-in-users')){
                htmlElement.parentNode.removeChild(htmlElement);
            }
        }
    }

    whenUserIsNotSignedIn = () => {
        // TODO: Add modal trigger to each signed-in-only element in Dom
        
        // let modalDivID = 'restric-sidenavbar-items';
        // var modalDiv = null;
        // if (document.contains(document.getElementById(modalDivID))) {
        //     document.getElementById(modalDivID).remove();
        // }
        // PageLoader.HTML.modal(
        //     document.getElementById('body-wrapper'),
        //     PageLoader.i18n('Only Registered Users.'),
        //     PageLoader.i18n('First Sign up or Sign in if you have an Account.'),
        //     [
        //         PageLoader.HTML.actions.btn.signIn(),
        //         PageLoader.HTML.actions.btn.signUp()
        //     ],
        //     modalDivID
        // ).then(modalDivHtml => {
        //     modalDiv = modalDivHtml;
        // });

        // document.getElementById('if_signed_in').style.display = 'none';
        // document.getElementById('if_signed_out').style.display = 'block';
        if (this.State.Root.SessionHistory.Device === 'desktop'){
            // for (let htmlElement of document.getElementById('side-menu').querySelectorAll('.signed-in-only')){
            //     this.State.Root.Services.Component.tooltip('Requires Registration', 'right', htmlElement);
            // };
            // for (let htmlElement of document.getElementById('side-menu').querySelectorAll('.hide-for-signed-in-users')){
            //     this.State.Root.Services.Component.showElement(htmlElement.id);
            // }
        }
    }
    
    signOutEvent(){
        // document.getElementById('signout').addEventListener('click', this.State.Root.Services.Auth.signOut);
    }

    // Correct Routing with Session Service
    signInEvent(){
        // document.getElementById('signin').addEventListener('click', function(){
        //     window.location.href = this.State.Root.Services.Session.routeWithParams('./index.html', {'page': 'sign-in', 'next': Services.API.currentRouteForNextParam()});
        // });
    }
    signUpEvent(){
        // document.getElementById('signup').addEventListener('click', function(){
        //     window.location.href = this.State.Root.Services.Session.routeWithParams('./index.html', {'page': 'sign-up', 'next': Services.API.currentRouteForNextParam()});
        // });
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
        this.signOutEvent();
        this.signInEvent();
        this.signUpEvent();
        this.whenUserIsNotSignedIn();
        this.setupEventsForTabs();
        this.setupSimplebar();
        this.initTooltips();
        if (this.State.Root.SessionHistory.Device === 'desktop'){
            this.setupSidenavbar(subApp);
        }
        this.setupSearch();
    }
}