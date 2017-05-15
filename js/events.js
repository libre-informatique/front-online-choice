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

                // -------------------------------------------------------------
                // NAV BUTTONS
                // -------------------------------------------------------------

                .on('click', '*[data-go]', function (e) {
                    var action = $(this).attr('data-go');

                    var callableAction = app.ctrl[action];

                    callableAction();
                })

                ;
        }
    }
});
