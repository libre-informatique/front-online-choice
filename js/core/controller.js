app.register({
    core: {
        ctrl: {
            states: {
                login: {
                    path: "login",
                    title: "Connexion"
                },
                showUserProfile: {
                    path: "profile",
                    title: "Profil"
                },
                editUserProfile: {
                    path: "profile/edit",
                    title: "Modifier mon profil"
                },
                editUserPassword: {
                    path: "password/edit",
                    title: "Modifier mon mot de passe"
                }
            },

            // ---------------------------------------------------------------------
            // ACTIONS
            // ---------------------------------------------------------------------

            login: function() {
                app.core.history.currentCallable = app.core.ctrl.login;
                app.core.ctrl.go('login', {}).then(function() {
                    app.core.history.add(app.core.ctrl.states.login);
                });
            },

            logout: function() {
                app.core.history.currentCallable = app.core.ctrl.logout;
                $('#app').removeClass('loggedIn');

                app.core.ws.userLogout().always(function() {
                    $(document).trigger('user.logged.out');
                    app.core.ctrl.login();
                });
            },

            showUserProfile: function() {
                if (app.core.session.user) {
                    app.core.history.currentCallable = app.core.ctrl.showUserProfile;
                    app.core.ws.getUser(app.core.session.user.id).then(function() {
                        app.core.ctrl.go('userProfile', {
                            user: app.core.session.user
                        }).then(function() {
                            app.core.history.add(app.core.ctrl.states.showUserProfile);
                        });
                    });
                } else {
                    app.core.ctrl.login();
                }
            },

            editUserProfile: function() {
                if (app.core.session.user) {
                    app.core.history.currentCallable = app.core.ctrl.editUserProfile;
                    app.core.ws.getUser(app.core.session.user.id).then(function() {
                        app.core.ctrl.go('editUserProfile', {
                            user: app.core.session.user
                        }).then(function() {
                            app.core.history.add(app.core.ctrl.states.editUserProfile);
                            Materialize.updateTextFields();
                        });
                    });
                } else {
                    app.core.ctrl.login();
                }
            },

            editUserPassword: function() {
                if (app.core.session.user) {
                    app.core.history.currentCallable = app.core.ctrl.editUserPassword;
                    app.core.ws.getUser(app.core.session.user.id).then(function() {
                        app.core.ctrl.go('editUserPassword', {
                            user: app.core.session.user
                        }).then(function() {
                            Materialize.updateTextFields();
                            app.core.history.add(app.core.ctrl.states.editUserPassword);
                        });
                    });
                } else {
                    app.core.ctrl.login();
                }
            },

            updatePassword: function(form) {
                if (app.core.session.user) {
                    var formData = app.core.utils.formToObject(form.serializeArray());

                    if (formData.password_1 == formData.password_2) {
                        app.core.ws.updateUser(form);
                    } else {
                        form.find('input[type="password"]').addClass('invalid');
                    }
                } else {
                    app.core.ctrl.login();
                }
            },

            // ---------------------------------------------------------------------
            // INTERNAL METHODS
            // ---------------------------------------------------------------------

            go: function(templateName, data) {
                return app.core.ctrl.render(templateName, data, true);
            },

            render: function(templateName, data, clearContent) {
                var defer = $.Deferred();

                if (typeof data === 'undefined')
                    data = {};
                if (typeof clearContent === 'undefined')
                    clearContent = false;

                if (clearContent)
                    $('#app div.content handlebar-placeholder').html('');

                var compiled = Handlebars.compile(app.core.ui.templates[templateName].data);

                app.core.ui.applyTemplate(templateName, compiled(data));

                $('.dropdown-button').dropdown('close');

                defer.resolve();

                return defer.promise();
            }
        }
    }
});