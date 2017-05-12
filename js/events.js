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
                // LOGIN SUBMIT EVENT
                // -------------------------------------------------------------

                .on('submit', '#loginForm', function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();

                    var form = $(this);

                    var formData = app.utils.formToObject(form.serializeArray());

                    if (formData.username !== "" && formData.password !== "") {
                        $(document).trigger('login.submitted', [formData]);
                    } else {
                        if (formData.username === "") {
                            form.find('input[name="username"]').addClass('invalid');
                        }
                        if (formData.password === "") {
                            form.find('input[name="password"]').addClass('invalid');
                        }
                    }
                })

                .on('login.submitted', function (e, form) {
                    // Call login API

                    app.session.loggedIn = true; // FOR DEBUG

                    $('#app').addClass('loggedIn');

                    $(document).trigger('show-events');
                })

                // -------------------------------------------------------------
                // LOGOUT
                // -------------------------------------------------------------

                .on('click', '#btn-logout', function (e) {
                    app.session.loggedIn = true; // FOR DEBUG

                    $('#app').removeClass('loggedIn');

                    $(document).trigger('hide-events');
                })

                // -------------------------------------------------------------
                // TEMPLATE MANAGEMENT
                // -------------------------------------------------------------

                .on('template.registered', function (e, id) {
                    if (id === "login") {
                        var cb = app.ui.templatesCallbacks[app.ui.templates.login.callback];

                        cb({});
                    }
                })

                .on('template.applyed', function (e, name) {

                })

                // -------------------------------------------------------------
                // EVENTS MANAGEMENTS
                // -------------------------------------------------------------

                .on('show-events', function (e) {
                    var cb = app.ui.templatesCallbacks[app.ui.templates.mainTabs.callback];
                    var cbMainTabs = app.ui.templatesCallbacks[app.ui.templates.mainTabsContent.callback];

                    var events = app.ws.getEvents()
                        .then(function (events) {
                            console.info(events);

                            cb(events);
                            cbMainTabs(events);
                        }, function (error) {

                        });
                })

                .on('hide-events', function (e) {
                    $('handlebar-placeholder[template="mainTabs"], handlebar-placeholder[template="mainTabsContent"]').html('');
                })

                ;
        }
    }
});
