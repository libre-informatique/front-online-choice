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

            login: function () {
                app.core.history.currentCallable = app.core.ctrl.login;
                app.core.ctrl.go('login', {}).then(function () {
                    app.core.history.add(app.core.ctrl.states.login);
                });
            },

            logout: function () {
                app.core.history.currentCallable = app.core.ctrl.logout;
                $('#app').removeClass('loggedIn');

                app.core.ws.userLogout().always(function () {
                    $(document).trigger('user.logged.out');
                    app.core.ctrl.login();
                });
            },

            showUserProfile: function () {
                app.core.history.currentCallable = app.core.ctrl.showUserProfile;
                app.core.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('userProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.core.ctrl.states.showUserProfile);
                    });
                }, function () {
//                    app.core.session.manageApiToken(true);
                });
            },

            editUserProfile: function () {
                app.core.history.currentCallable = app.core.ctrl.editUserProfile;
                app.core.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('editUserProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.core.ctrl.states.editUserProfile);
                    });
                });
            },

            editUserPassword: function () {
                app.core.history.currentCallable = app.core.ctrl.editUserPassword;
                app.core.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('editUserPassword', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.core.ctrl.states.editUserPassword);
                    });
                });
            },

            // ---------------------------------------------------------------------
            // INTERNAL METHODS
            // ---------------------------------------------------------------------

            go: function (templateName, data) {
                return app.core.ctrl.render(templateName, data, true);
            },

            render: function (templateName, data, clearContent) {
                var deffered = $.Deferred();

                if (typeof data === 'undefined')
                    data = {};
                if (typeof clearContent === 'undefined')
                    clearContent = false;

                if (clearContent)
                    $('#app div.content handlebar-placeholder').html('');

                var compiled = Handlebars.compile(app.core.ui.templates[templateName].data);

                app.core.ui.applyTemplate(templateName, compiled(data));

                $('.dropdown-button').dropdown('close');

                return deffered.resolve();
            }
        }
    }
});
