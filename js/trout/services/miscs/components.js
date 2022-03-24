export class Component{
    constructor(State){
        this.State = State;
    }

    icon = (icon_name) => {
        let _icon = document.createElement('i');
        _icon.classList.add(...['bi', icon_name]);
        return _icon;
    }

    iconWrap = (el, icon_name, text) => {
        let _icon = this.icon(icon_name);
        _icon.classList.add('icon-wrap-left');
        el.classList.add('icon-wrap-text-right');
        el.innerHTML = text;
        el.appendChild(_icon);
        return el;
    }

    hideElement = (element_id) => {
        if (this.elementExistsById(element_id)){
            document.getElementById(element_id).style.display = "none";
        }
    }

    showElement = (element_id) => {
        if (this.elementExistsById(element_id)){
            document.getElementById(element_id).style.display = "block";
        }
    }

    static addAttrs = (el, attrs) => {
        for (let [k, v] of Object.entries(attrs)){
            el.setAttribute(k, v);
        }
        return el;
    }

    Wrap = (elements, wrap_attrs={}, item_attrs={}, wrap_classes=['d-flex', 'flex-row', 'bd-highlight', 'mb-3'], item_classes=['p-2', 'bd-highlight']) => {
        // By Default Flex Wrap
        let wrap = document.createElement('div');
        wrap.classList.add(...wrap_classes);
        elements.forEach(el => {
            let item = document.createElement('div');
            item.classList.add(...item_classes);
            item = Component.addAttrs(item, item_attrs);
            item.appendChild(el);
            wrap.appendChild(item);
        });
        wrap = Component.addAttrs(wrap, wrap_attrs);
        return wrap;
    }


    p = (innerText, attrs={}, classes=[]) => {
        let p = document.createElement('p');
        p.classList.add(...classes);
        p.innerText = innerText;
        p = Component.addAttrs(p, attrs);
        return p;
    };

    a = (href, innerHTML, attrs={}, classes=[]) => {
        let a = document.createElement('a');
        a.setAttribute('href', href);
        a.classList.add(...classes);
        a.innerHTML = innerHTML;
        a = Component.addAttrs(a, attrs);
        return a;
    };

    btn = (href, {name='[NAME]', type='button', attrs={}, classes=['btn', 'btn-primary', 'btn-sm'], id='[ID]'}) => {
        let btn = document.createElement(type);
        btn.setAttribute('type', 'button');
        btn.setAttribute('href', href);
        btn.setAttribute('role', 'button');
        btn.setAttribute('id', id);
        btn.innerHTML = name;
        btn = Component.addAttrs(btn, attrs);
        btn.classList.add(...classes);
        return btn;
    };

    btn_signIn = () => { // TODO: use Session.route()
        // return btn(
        //     this.State.Root.Data.API.routeWithParams(this.State.Root.Data.API.Router.site__index.url, {
        //         'page': 'sign-in', 
        //         'next': this.State.Root.Data.API.currentRouteForNextParam()
        //     }), 
        //     {
        //         name: 'Sign In',
        //         type: 'a',
        //         classes: ['btn', 'btn-success']
        //     }
        // )
    };

    btn_signUp = () => { // TODO: use Session.route()
        // return btn(
        //     this.State.Root.Data.API.routeWithParams(this.State.Root.Data.API.Router.site__index.url, {
        //         'page': 'sign-up', 
        //         'next': this.State.Root.Data.API.currentRouteForNextParam()
        //     }), 
        //     {
        //         name: 'Sign Up',
        //         type: 'a',
        //         classes: ['btn', 'btn-primary']
        //     }
        // )
    }

    elementExistsById = (element_id) => {
        try { // TODO el in document
            return document.getElementById(element_id) !== null;
        } catch (error) {
            return false;
        }
    }

    replaceTagValues = (content, replacements=[]) => {
        replacements.forEach((k,v) => {
            content = content.replace(k,v);
        });
        return content;
    }

    modal = (parentDiv, header, body, actions, modalBodyID) => {
        return this.loadIntoDivFromTemplate(this.State.Routes.Components.modal, parentDiv.id).then(modalTemplate => {
            parentDiv.parentNode.append(modalTemplate);
            let modalDiv = document.getElementById('__template_id_a__');
            modalDiv.setAttribute('__template_id_a__', modalBodyID);
            let modalFooterDiv = document.getElementById('modal-footer');
            actions.forEach(action => {modalFooterDiv.appendChild(action);});
            let modalHeader = document.getElementById('modal-header');
            let modalBody = document.getElementById('modal-body');
            modalHeader.innerHTML = header;
            modalBody.innerHTML = body;
            return modalDiv;
        })
    }

    loadIntoDivFromTemplate = (custom_template_resource=null, targetTemplateDivId=null) => {
        let targetTemplateDiv = document.createElement('div');
        targetTemplateDiv.setAttribute('id', targetTemplateDivId);
        return this.State.Root.Services.Data.API.Get(custom_template_resource, {type: null}).then(content => {
            targetTemplateDiv.innerHTML = content;
            return targetTemplateDiv;
        });
    }

    encodeHTMLAsString = (tagContent) => {
        return tagContent.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        });
    }

    tooltip = (titleHtml, position, elementToBindTo) => {
        // data-bs-toggle="tooltip" data-bs-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>"> data-bs-placement="left"
        // let this.State.Root.Services.Localization.i18nTag = document.createElement('this.State.Root.Services.Localization.i18n');
        // this.State.Root.Services.Localization.i18nTag.setAttribute('lang', 'en');
        // this.State.Root.Services.Localization.i18nTag.innerText = title;
        let tooltip = {
            'data-bs-toggle': 'tooltip',
            'data-bs-html': 'true',
            'title': this.encodeHTMLAsString(titleHtml),
            'data-bs-placement': position
        }
        for (const [k,v] of Object.entries(tooltip)){
            elementToBindTo.setAttribute(k,v)
        }
        $('[data-toggle="tooltip"]').tooltip();
    }

    alert = (msg, {classes=['alert', 'alert-primary'], attrs={'role': 'alert'}}) => {
        let alertDiv = document.createElement('div');
        alertDiv = Component.addAttrs(alertDiv, attrs);
        alertDiv.classList.add(...classes);
        alertDiv.innerHTML = this.State.Root.Services.Localization.i18n(msg);
    }

    linkModal = (id) => {
        let a = this.a('#', '', {attrs: {
            'data-bs-toggle': "modal-link-" + id,
            'data-bs-target': "#modal-body-" + id 
        }})
        return a;
    }
    formModalToJson = (formData) => {
        data = {};
        for (let el of formData.elements){
            data[el.id] = document.getElementById(el.id).value();
        }
        return data;
    }

    formModal = (formStructure) => {
        let modalLinkID = formStructure.linkID;
        let modalBodyID = formStructure.bodyID;

        let modalDiv = document.createElement('div');
        modalDiv.classList.add(...['modal', 'fade']);
        modalDiv.setAttribute('id', modalBodyID);
        modalDiv.setAttribute('aria-hidden', 'true');
        modalDiv.setAttribute('aria-labelledby', modalBodyID + 'label');

        let modalDialogDiv = document.createElement('div');
        modalDialogDiv.classList.add(...['modal-dialog']);
        modalDiv.appendChild(modalDialogDiv);

        let modalContentDiv = document.createElement('div');
        modalContentDiv.classList.add(...['modal-content']);
        modalDialogDiv.appendChild(modalContentDiv);

        let modalHeaderDiv = document.createElement('div');
        modalHeaderDiv.classList.add(...['modal-header']);
        modalHeaderDiv.innerHTML = '<h5>' + formStructure.header + '</h5>';
        modalContentDiv.appendChild(modalHeaderDiv);

        let modalBodyDiv = document.createElement('div');
        modalBodyDiv.classList.add(...['modal-body']);
        modalContentDiv.appendChild(modalBodyDiv);

        let formDiv = document.createElement('form');
        for (let el of formStructure.elements){
            let itemDiv = document.createElement('div');
            itemDiv.classList.add(...['mb-3']);
            let label = document.createElement('label');
            label.classList.add(...['col-form-label']);
            label.setAttribute('for', el.id)
            label.innerHTML = el.label;

            let formInput;

            switch (el.type) {
                case 'input':
                    formInput = document.createElement('input');
                case 'textarea':
                    formInput = document.createElement('textarea');
            }

            formInput.classList.add(...['form-control']);
            formInput.setAttribute('for', el.id);
            formInput.setAttribute('id', el.id);
            if (el.hasOwnProperty('default')){
                formInput.value = el.deafault;
            }

            itemDiv.appendChild(label)
            itemDiv.appendChild(formInput)
            formDiv.appendChild(itemDiv)
        }

        modalBodyDiv.appendChild(formDiv);

        let closeBtn = document.createElement('button');
        closeBtn.classList.add('btn-close');
        closeBtn.setAttribute('data-bs-dismiss', modalLinkID);
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = 'Close'

        let submitBtn = document.createElement('button');
        submitBtn.setAttribute('id', formStructure.submit.id);
        submitBtn.setAttribute('type', formStructure.submit.type);
        submitBtn.innerHTML = 'Update'
        
        let modalFooterDiv = document.createElement('div');
        modalFooterDiv.classList.add(...['modal-footer']);
        modalFooterDiv.appendChild(closeBtn);
        modalFooterDiv.appendChild(submitBtn);
        modalContentDiv.appendChild(modalFooterDiv);
        return {'modal': modalDiv, 'submit': submitBtn};
    }

    toast = (msg, actions=[]) => {
        var toastEl = document.createElement('div');
        toastEl.classList.add('position-fixed', 'bottom-0','end-0','p-3');
        toastEl.setAttribute('style', 'z-index: 11')

        var toastDiv = document.createElement('div');
        toastDiv.classList.add('toast', 'show');
        toastDiv.setAttribute('role', 'alert');
        toastDiv.setAttribute('aria-live', 'assertive');
        toastDiv.setAttribute('aria-atomic', 'true');

        var toastHeaderDiv = document.createElement('div');
        toastHeaderDiv.classList.add('toast-header');

        var toastHeaderTitle = document.createElement('strong');
        toastHeaderTitle.classList.add('me-auto');
        toastHeaderTitle.innerHTML = 'Tajiran';

        var toastHeaderTimeAgo = document.createElement('small');
        toastHeaderTimeAgo.innerHTML = this.State.Root.Services.Localization.i18n(jQuery.timeago(new Date().toLocaleString()), 'en');

        var toastHeaderCloseBtn = document.createElement('button');
        toastHeaderCloseBtn.setAttribute('type', 'button');
        toastHeaderCloseBtn.setAttribute('data-bs-dismiss', 'toast');
        toastHeaderCloseBtn.setAttribute('aria-label', 'Close');
        toastHeaderCloseBtn.classList.add('btn-close');

        var toastBodyDiv = document.createElement('div');
        toastBodyDiv.classList.add('toast-body');
        toastBodyDiv.innerHTML = msg;

        if (actions.length > 0){
            var actionDiv = document.createElement('div');
            actionDiv.classList.add('mt-2','pt-2','border-top');
            actions.map(toastBodyDiv.appendChild);
        }

        toastHeaderDiv.appendChild(toastHeaderTitle);
        toastHeaderDiv.appendChild(toastHeaderTimeAgo);
        toastHeaderDiv.appendChild(toastHeaderCloseBtn);
        toastDiv.appendChild(toastHeaderDiv);
        toastDiv.appendChild(toastBodyDiv);
        toastEl.appendChild(toastDiv);

        document.body.appendChild(toastEl);
        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
    generateAccordion = (accordionData) => {
        let accordionDiv = document.createElement('div');
        accordionDiv.classList.add('accordion');
        accordionDiv = Component.addAttrs(accordionDiv, accordionData.attrs);

        function generateAccordionItem(itemData){
            let itemDiv = document.createElement('div');
            itemDiv.classList.add('accordion-item');
            let itemHeader = document.createElement('h2');
            itemHeader.setAttribute('id', itemData.headerID);
            itemHeader.classList.add('accordion-header');

            let itemBtn = document.createElement('button');
            itemBtn.classList.add('accordion-button', 'text-center');
            itemBtn.innerHTML = itemData.header;
            itemBtn = Component.addAttrs(itemBtn, {
                'data-bs-toggle': "collapse",
                'data-bs-target': "#" + itemData.bodyID,
                'aria-expanded': "true",
                'aria-controls': itemData.bodyID,
                'type': 'button'
            })

            let innerItemDiv = document.createElement('div');
            innerItemDiv.classList.add('accordion-collapse', 'collapse');
            if (itemData.show){
                innerItemDiv.classList.add('show');
            }
            innerItemDiv = Component.addAttrs(innerItemDiv, {
                'id': itemData.bodyID,
                'aria-labelledby': itemData.headerID
            })

            let itemBodyDiv = document.createElement('div');
            itemBodyDiv.classList.add('accordion-body');
            itemBodyDiv.innerHTML = itemData.body;

            itemHeader.appendChild(itemBtn);
            itemDiv.appendChild(itemHeader);
            innerItemDiv.appendChild(itemBodyDiv);
            itemDiv.appendChild(innerItemDiv);
            return itemDiv;
        }
        for (let itemData of accordionData.items){
            accordionDiv.appendChild(generateAccordionItem(itemData));
        }
        return accordionDiv;
    }
}