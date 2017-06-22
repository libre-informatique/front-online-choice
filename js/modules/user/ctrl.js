app.register({
    ctrl: {

        // ---------------------------------------------------------------------
        // STATES
        // ---------------------------------------------------------------------

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
            app.core.history.currentCallable = app.ctrl.login;
            app.core.ctrl.go('login', {}).then(function() {
                app.user.ui.updateProfileName();
                app.core.history.add(app.ctrl.states.login);
            });
        },

        logout: function() {
            app.core.history.currentCallable = app.ctrl.logout;
            $('#app').removeClass('loggedIn');

            app.ws.userLogout().always(function() {
                $(document).trigger('user.logged.out');
                app.ctrl.login();
            });
        },

        showUserProfile: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.showUserProfile;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('userProfile', {
                        user: app.core.session.user
                    }).then(function() {
                        app.core.history.add(app.ctrl.states.showUserProfile);
                        app.featureDiscovery.showFeatureDiscovery('info-eventButton');
                        app.featureDiscovery.showFeatureDiscovery('info-profileActionsButton');
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        editUserProfile: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserProfile;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('editUserProfile', {
                        user: app.core.session.user
                    }).then(function() {
                        app.user.ui.updateProfileName();
                        app.core.history.add(app.ctrl.states.editUserProfile);
                        Materialize.updateTextFields();
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        editUserPassword: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserPassword;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('editUserPassword', {
                        user: app.core.session.user
                    }).then(function() {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.editUserPassword);
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        updatePassword: function(formData, form) {
            if (app.core.session.user) {

                if (formData.password_1 == formData.password_2) {
                    app.ws.updateUser(form);
                } else {
                    form.find('input[type="password"]').addClass('invalid');
                }
            } else {
                app.ctrl.login();
            }
        },

        // ---------------------------------------------------------------------
        // OVERRIDES
        // ---------------------------------------------------------------------

        showSettings: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.showSettings;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('settings').then(function() {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.settings);
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        updateSettings: function(formData) {
            if (app.core.session.user) {

                if (formData.clearAllInfosMessages === true) {
                    localStorage.removeItem(app.config.clientSessionName + '_alreadyLoggedIn');
                    app.featureDiscovery.__resetInfosStorage();
                }
                app.ctrl.showEvents();
                app.core.ui.toast("Paramètres enregistrés", "success");
            } else {
                app.ctrl.login();
            }
        }
    },
})
