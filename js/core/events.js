$.extend(app.core, {
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
                    app.save();
                    app.core.ui.modal.modal('close');
                })

                // -------------------------------------------------------------    
                // PRESENCE BUTTON
                // -------------------------------------------------------------

                .on('click', '.presence-btn:not(.mandatory)', function (e) {
                    if (!$(this).hasClass('attend')) {
                        $(this)
                            .prop('attend', true)
                            .removeClass('btn blue')
                            .addClass('attend btn-flat teal')
                            .html('Présent')
                            ;
                    } else {
                        $(this)
                            .removeClass('attend btn-flat teal')
                            .addClass('btn blue')
                            .html('Participer')
                            ;
                    }
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

                    app.core.session.user.shortName = app.core.session.user.firstName.charAt(0) + ". " + app.core.session.user.lastName;

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
                    if (app.core.session.user !== null && app.core.session.loggedIn === true) {
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

                .on('submit', 'form[data-ws]', function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();

                    var action = $(this).attr('data-ws');

                    var callableAction = app.core.ws[action];

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

                    // Initialize form fields when data is already set

//                    Materialize.updateTextFields();
                    app.core.ui.plugins.init();
                })

                ;
        }
    }
});
