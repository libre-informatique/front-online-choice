app.register({
    core: {
        events: {
            init: function () {
                $(document)

                    // -------------------------------------------------------------
                    // CONFIRMATION FAB BUTTON
                    // -------------------------------------------------------------

                    .on('click', '#confirm-fab', function (e) {
                        app.core.ui.modal.modal('open');
                    })

                    // -------------------------------------------------------------
                    // CONFIRMATION MODAL BUTTONS
                    // -------------------------------------------------------------

                    .on('click', '#cancel-btn', function (e) {
                        app.core.ui.modal.modal('close');
                    })

                    .on('click', '#save-btn', function (e) {
                        // TODO: Validate cart
                        app.cart.validateCart();
                        //app.cart.submitCart();
                        alert("Votre panier a été validé");
                        app.core.ui.modal.modal('close');
                    })

                    // -------------------------------------------------------------
                    // LOGIN
                    // -------------------------------------------------------------

                    .on('submit', '#loginForm', function (e) {
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();

                        var form = $(this);

                        var formData = app.core.utils.formToObject(form.serializeArray());

                        if (formData.username !== "" && formData.password !== "") {
                            app.core.ws.userLogin(formData.username, formData.password, formData.rememberMe, form);
                        } else {
                            if (formData.username === "") {
                                form.find('input[name="username"]').addClass('invalid');
                            }
                            if (formData.password === "") {
                                form.find('input[name="password"]').addClass('invalid');
                            }
                        }
                    })

                    .on('user.logged.in', function () {
                        $('#app').addClass('loggedIn');

                        if (app.core.session.user.shortName === null || app.core.session.user.shortName === "") {
                            app.core.session.user.shortName = app.core.session.user.firstName.charAt(0) + ". " + app.core.session.user.lastName;
                        }

                        $('nav a[data-activates="userMenu"] span.button-label')
                            .html(app.core.session.user.shortName);

                        app.cart.init();
                    })

                    .on('user.logged.out', function () {
                        $('#app').removeClass('loggedIn');
                    })

                    // -------------------------------------------------------------
                    // SESSION
                    // -------------------------------------------------------------

                    .on('session.started', function () {
                        if (app.core.session.user !== null) {
                            $(document).trigger('user.logged.in');
                        }
                    })

                    // -------------------------------------------------------------
                    // NAV BUTTONS
                    // -------------------------------------------------------------

                    .on('click', '*[data-go]', function (e) {
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();

                        var action = $(this).attr('data-go');

                        var callableAction = app.core.ctrl[action];

                        callableAction();
                    })

                    // -------------------------------------------------------------
                    // FORM CUSTOM SUBMIT
                    // -------------------------------------------------------------

                    .on('submit', 'form[data-ws], form[data-ctrl]', function (e) {
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();

                        var callableAction = null;

                        if ($(this).attr('data-ws')) {
                            callableAction = app.core.ws[$(this).attr('data-ws')];
                        } else if ($(this).attr('data-ctrl')) {
                            callableAction = app.core.ctrl[$(this).attr('data-ctrl')];
                        } else {
                            app.core.ui.toast("Mauvais callable de traitement de formulaire", "error");
                            return;
                        }

                        callableAction($(this));
                    })



                    // -------------------------------------------------------------
                    // AJAX SPINNER
                    // -------------------------------------------------------------

                    .ajaxStart(function () {
                        app.core.ui.displayLoading();
                    })

                    .ajaxStop(function () {
                        app.core.ui.displayLoading(false);
                    })

                    // -------------------------------------------------------------
                    // GLOBAL BEHAVIORS
                    // -------------------------------------------------------------

                    .on('click', '[href="#"]', function (e) {
                        e.preventDefault();
                    })

                    // -------------------------------------------------------------
                    // TEMPLATING ENGINE
                    // -------------------------------------------------------------

                    .on('template.applyed', function () {
                        app.core.ui.displayContentLoading(false);
                        app.core.ui.plugins.init();
                    })

                    .on('template.registered', function (e, template) {
                        if (template.id === "infos") {
                            app.core.ui.applyTemplate(template.id, template.data);
                        }
                    })

                    ;

                app.core.events.registerComponentEvents(app);
            },

            // ---------------------------------------------------------------------
            // INITIALIZE COMPONENTS EVENTS
            // ---------------------------------------------------------------------

            registerComponentEvents: function (component, deep) {
                if (!isDefined(deep))
                    deep = 0;

                if (deep > 3) // LIMIT INIT SEARCH RECURSION TO 4 LEVEL
                    return;

                // RECURSION OVER APPLICATION COMPONENTS
                Object.keys(component).forEach(function (key) {
                    var c = component[key];
                    if (c.hasOwnProperty('initEvents')) {
                        c.initEvents();
                    } else if (typeof c === "object") {
                        app.core.events.registerComponentEvents(c, ++deep);
                    }
                });
            }
        }
    }
});
