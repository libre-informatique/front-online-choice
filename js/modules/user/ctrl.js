app.register({
    ctrl: {

        // ---------------------------------------------------------------------
        // STATES
        // ---------------------------------------------------------------------

        states: {
            login: {
                path: "/login",
                title: "Connexion"
            },
            logout: {
                path: "/logout",
                title: "Déconnexion"
            },
            showUserProfile: {
                path: "/profile",
                title: "Profil"
            },
            editUserProfile: {
                path: "/profile/edit",
                title: "Modifier mon profil"
            },
            editUserPassword: {
                path: "/password/edit",
                title: "Modifier mon mot de passe"
            }
        },

        // ---------------------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------------------

        loginAction: function() {
            app.core.history.currentCallable = app.ctrl.loginAction;
            app.core.ctrl.go('login', {}).then(function() {
                app.user.ui.updateProfileName();
                app.core.history.add(app.ctrl.states.login);
            });
        },

        logoutAction: function() {
            app.core.history.currentCallable = app.ctrl.logoutAction;
            $('#app').removeClass('loggedIn');

            app.ws.userLogout().always(function() {
                $(document).trigger('user.logged.out');
                app.ctrl.loginAction();
            });
        },

        showUserProfileAction: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.showUserProfileAction;
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
                app.ctrl.loginAction();
            }
        },

        editUserProfileAction: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserProfileAction;
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
                app.ctrl.loginAction();
            }
        },

        editUserPasswordAction: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserPasswordAction;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('editUserPassword', {
                        user: app.core.session.user
                    }).then(function() {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.editUserPassword);
                    });
                });
            } else {
                app.ctrl.loginAction();
            }
        },

        updatePasswordAction: function(formData, form) {
            if (app.core.session.user) {

                if (formData.password_1 == formData.password_2) {
                    app.ws.updateUser(formData,form);
                } else {
                    form.find('input[type="password"]').addClass('invalid');
                }
            } else {
                app.ctrl.loginAction();
            }
        },

        // ---------------------------------------------------------------------
        // OVERRIDES
        // ---------------------------------------------------------------------

        settingsAction: function() {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.settingsAction;
                app.ws.getUser(app.core.session.user.id).then(function() {
                    app.core.ctrl.go('settings').then(function() {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.settings);
                    });
                });
            } else {
                app.ctrl.loginAction();
            }
        },

        updateSettingsAction: function(formData) {
            if (app.core.session.user) {

                if (formData.clearAllInfosMessages === true) {
                    localStorage.removeItem(app.config.clientSessionName + '_alreadyLoggedIn');
                    app.featureDiscovery.__resetInfosStorage();
                }
                app.ctrl.showEventsAction();
                app.core.ui.toast("Paramètres enregistrés", "success");
            } else {
                app.ctrl.loginAction();
            }
        }
    },
})
