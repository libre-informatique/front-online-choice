app.register({
    ws: {
        // ---------------------------------------------------------------------
        // PERFORM USER LOGIN
        // ---------------------------------------------------------------------

        userLogin: function(username, password, rememberMe, form) {
            return app.core.ws.call('POST', '/login', {
                'email': username,
                'password': password
            }, function(res) {
                var user = res.success.customer;
                app.core.session.user = user;

                // USER HAS CHECKED REMEMBER ME ?
                rememberMe == 'on' ?
                    app.core.session.enableRememberMe() :
                    app.core.session.disableRememberMe();

                app.core.session.save();

                $(document).trigger('user.logged.in');
                app.core.history.disableBack = false;

                app.user.dispatchAfterLogin();
            }, function(res) {
                form.find('input').addClass('invalid');
                app.core.ui.toast('Email et/ou mot de passe invalide', 'error');
            });
        },

        // ---------------------------------------------------------------------
        // PERFORM USER (CUSTOMER) LOGOUT
        // ---------------------------------------------------------------------

        userLogout: function() {
            return app.core.ws.call('POST', '/logout', {}).always(function() {
                app.core.session.rememberMe = false;
                app.core.session.user = null;
                app.core.session.save();
                app.core.history.disableBack = true;
            });
        },

        // ---------------------------------------------------------------------
        // REFRESH USER INFORMATIONS
        // ---------------------------------------------------------------------

        getUser: function(userId) {
            var defer = $.Deferred();

            app.core.ws.call('GET', '/customers/' + userId, {}, function(res) {
                if (typeof res.id !== 'undefined') {
                    app.core.session.user = res;
                    app.core.session.userId = res.id;
                    app.core.session.save();
                    app.user.ui.updateProfileName();
                    defer.resolve(res);
                } else {
                    defer.reject(res);
                    app.ctrl.logoutAction();
                }
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // UPDATE USER INFORMATIONS
        // ---------------------------------------------------------------------

        updateUser: function(formData, form) {
            formData = $.extend(app.core.session.user, formData);

            if (formData.hasOwnProperty('password_1')) {
                formData.password = formData.password_1;
                delete formData.password_1;
                delete formData.password_2;
            }

            return app.core.ws.call('POST', '/customers/' + app.core.session.user.id, formData)
                .then(function() {
                    app.user.ui.updateProfileName();
                    app.ctrl.showUserProfileAction();

                    if (formData.hasOwnProperty('password')) {
                        app.core.ui.toast('Votre mot de passe à été mis à jour', 'success');
                    } else {
                        app.core.ui.toast('Les informations du profil ont bien été mises à jour', 'success');
                    }
                    $(document).trigger('user.logged.in');
                });
        },
    },
});
