$.extend(app, {
    events: {
        init: function () {
            $(document)

                // -------------------------------------------------------------
                // CONFIRMATION FAB BUTTON
                // -------------------------------------------------------------

                .on('click', '#confirm-fab', function (e) {
                    app.ui.modal.modal('open');
                })

                // -------------------------------------------------------------
                // CONFIRMATION MODAL BUTTONS
                // -------------------------------------------------------------

                .on('click', '#cancel-btn', function (e) {
                    app.ui.modal.modal('close');
                })

                .on('click', '#save-btn', function (e) {
                    app.save();
                    app.ui.modal.modal('close');
                })

                // -------------------------------------------------------------    
                // PRESENCE BUTTON
                // -------------------------------------------------------------

                .on('click', '.presence-btn:not(.mandatory)', function (e) {
                    if ($(this).hasClass('attend')) {
                        $(this)
                            .removeClass('attend btn-flat teal')
                            .addClass('btn blue')
                            .html('Participer')
                            ;
                    } else {
                        $(this)
                            .prop('attend', true)
                            .removeClass('btn blue')
                            .addClass('attend btn-flat teal')
                            .html('Présent')
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

                    var formData = app.utils.formToObject(form.serializeArray());

                    if (formData.username !== "" && formData.password !== "") {
                        app.ws.userLogin(formData.username, formData.password, formData.rememberMe, form);
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

                    app.session.user.shortName = app.session.user.firstName.charAt(0) + ". " + app.session.user.lastName;

                    $('nav a[data-activates="userMenu"] span.button-label')
                        .html(app.session.user.shortName);

                })

                .on('user.logged.out', function () {
                    $('#app').removeClass('loggedIn');
                })

                // -------------------------------------------------------------
                // SESSION
                // -------------------------------------------------------------

                .on('app.session.started', function () {
                    if (app.session.user !== null && app.session.loggedIn === true) {
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

                    var callableAction = app.ctrl[action];

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

                    var callableAction = app.ws[action];

                    callableAction($(this));
                })


                // -------------------------------------------------------------
                // AJAX SPINNER
                // -------------------------------------------------------------

                .ajaxStart(function () {
                    app.ui.displayLoading();
                })

                .ajaxStop(function () {
                    app.ui.displayLoading(false);
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

                    Materialize.updateTextFields();
                })

                ;
        }
    }
});
