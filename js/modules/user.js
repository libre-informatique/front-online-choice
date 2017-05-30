/* global app */

app.register({
    user: {
        initEvents: function () {
            $(document)
                .on('app.ready', function () {
                    if (app.core.session.user) {
                        $('#app').addClass('loggedIn');
                        app.user.ui.updateProfileName();
                        app.ctrl.showEvents();
                    } else {
                        app.ctrl.login();
                        $('#app').removeClass('loggedIn');
                    }
                })

                // -----------------------------------------------------------------
                // LOGIN
                // -----------------------------------------------------------------

                .on('submit', '#loginForm', function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();

                    var form = $(this);

                    var formData = app.core.utils.formToObject(form.serializeArray());

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
                    app.cart.init();
                })

                .on('user.logged.out', function () {
                    $('#app').removeClass('loggedIn');
                })

                ;
        },
        ui: {
            updateProfileName: function () {
                if (app.core.session.user.shortName === null || app.core.session.user.shortName === "") {
                    app.core.session.user.shortName = app.core.session.user.firstName.charAt(0) + ". " + app.core.session.user.lastName;
                }

                $('nav a[data-activates="userMenu"] span.button-label')
                    .html(app.core.session.user.shortName);
            }
        }
    },
    ws: {
        // ---------------------------------------------------------------------
        // PERFORM USER LOGIN
        // ---------------------------------------------------------------------

        userLogin: function (username, password, rememberMe, form) {
            return app.core.ws.call('POST', '/login', {
                'email': username,
                'password': password
            }, function (res) {
                var user = res.success.customer;
                app.core.session.user = user;

                // USER HAS CHECKED REMEMBER ME ?
                rememberMe == 'on' ?
                    app.core.session.enableRememberMe() :
                    app.core.session.disableRememberMe();

                app.core.session.save();

                $(document).trigger('user.logged.in');
                app.core.history.disableBack = false;

                // GO TO EVENTS LIST
                app.ctrl.showEvents();
            }, function (res) {
                form.find('input').addClass('invalid');
                app.core.ui.toast('Email et/ou mot de passe invalide', 'error');
            });
        },

        // ---------------------------------------------------------------------
        // PERFORM USER (CUSTOMER) LOGOUT
        // ---------------------------------------------------------------------

        userLogout: function () {
            return app.core.ws.call('POST', '/logout', {}).always(function () {
                app.core.session.rememberMe = false;
                app.core.session.user = null;
                app.core.session.save();
                app.core.history.disableBack = true;
            });
        },

        // ---------------------------------------------------------------------
        // REFRESH USER INFORMATIONS
        // ---------------------------------------------------------------------

        getUser: function (userId) {
            var defer = $.Deferred();

            app.core.ws.call('GET', '/customers/' + userId, {}, function (res) {
                if (typeof res.id !== 'undefined') {
                    app.core.session.user = res;
                    app.core.session.userId = res.id;
                    app.core.session.save();
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                    app.ctrl.logout();
                }
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // UPDATE USER INFORMATIONS
        // ---------------------------------------------------------------------

        updateUser: function (form) {
            var formData =
                $.extend(app.core.session.user, app.core.utils.formToObject(form.serializeArray()));

            if (formData.hasOwnProperty('password_1')) {
                formData.password = formData.password_1;
                delete formData.password_1;
                delete formData.password_2;
            }

            return app.core.ws.call('POST', '/customers/' + app.core.session.user.id, formData)
                .then(function () {
                    app.ctrl.showUserProfile();
                    if (formData.hasOwnProperty('password')) {
                        app.core.ui.toast('Votre mot de passe à été mis à jour', 'success');
                    } else {
                        app.core.ui.toast('Les informations du profil ont bien été mises à jour', 'success');
                    }
                    $(document).trigger('user.logged.in');
                });
        },
    },

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

        login: function () {
            app.core.history.currentCallable = app.ctrl.login;
            app.core.ctrl.go('login', {}).then(function () {
                app.core.history.add(app.ctrl.states.login);
            });
        },

        logout: function () {
            app.core.history.currentCallable = app.ctrl.logout;
            $('#app').removeClass('loggedIn');

            app.ws.userLogout().always(function () {
                $(document).trigger('user.logged.out');
                app.ctrl.login();
            });
        },

        showUserProfile: function () {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.showUserProfile;
                app.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('userProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.ctrl.states.showUserProfile);
                        app.featureDiscovery.showFeatureDiscovery('info-eventButton');
                        app.featureDiscovery.showFeatureDiscovery('info-profileActionsButton');
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        editUserProfile: function () {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserProfile;
                app.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('editUserProfile', {
                        user: app.core.session.user
                    }).then(function () {
                        app.core.history.add(app.ctrl.states.editUserProfile);
                        Materialize.updateTextFields();
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        editUserPassword: function () {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.editUserPassword;
                app.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('editUserPassword', {
                        user: app.core.session.user
                    }).then(function () {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.editUserPassword);
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        updatePassword: function (form) {
            if (app.core.session.user) {
                var formData = app.core.utils.formToObject(form.serializeArray());

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

        showSettings: function () {
            if (app.core.session.user) {
                app.core.history.currentCallable = app.ctrl.showSettings;
                app.ws.getUser(app.core.session.user.id).then(function () {
                    app.core.ctrl.go('settings').then(function () {
                        Materialize.updateTextFields();
                        app.core.history.add(app.ctrl.states.settings);
                    });
                });
            } else {
                app.ctrl.login();
            }
        },

        updateSettings: function (form) {
            if (app.core.session.user) {
                var formData = app.core.utils.formToObject(form.serializeArray());

                if (formData.clearAllInfosMessages === true) {
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
