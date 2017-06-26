/* global app */

app.register({
    user: {
        registerTemplates: function() {
            app.core.ui.addTemplate('content', 'userProfile', '/js/modules/user/views/profile.html');
            app.core.ui.addTemplate('content', 'editUserProfile', '/js/modules/user/views/editProfile.html');
            app.core.ui.addTemplate('content', 'editUserPassword', '/js/modules/user/views/editPassword.html');
            app.core.ui.addTemplate('content', 'settings', '/js/modules/user/views/settings.html');
            app.core.ui.addTemplate('content', 'login', '/js/modules/user/views/login.html');
        },
        initEvents: function() {
            $(document)
                .on('app.ready', function() {
                    if (app.core.session.user) {
                        $('#app').addClass('loggedIn');
                        app.user.ui.updateProfileName();
                        app.user.dispatchAfterLogin();
                    } else {
                        app.ctrl.loginAction();
                        $('#app').removeClass('loggedIn');
                    }
                })

                // -----------------------------------------------------------------
                // LOGIN
                // -----------------------------------------------------------------

                .on('submit', '#loginForm', function(e) {
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

                .on('user.logged.in', function() {
                    $('#app').addClass('loggedIn');
                    app.user.ui.updateProfileName();
                    app.cart.init();
                })

                .on('user.logged.out', function() {
                    $('#app').removeClass('loggedIn');
                    app.user.ui.updateProfileName();
                })

            ;
        },

        dispatchAfterLogin: function() {
            var currentUri = app.core.routing.getCurrentUri();
            console.info('BEFORE dispatchAfterLogin');
            console.info(currentUri,app.ctrl.states.home.path,app.ctrl.states.login.path);
            if (app.core.routing.getCurrentUri() === app.config.appUriPrefix+app.ctrl.states.home.path || app.core.routing.getCurrentUri() === app.config.appUriPrefix+app.ctrl.states.login.path) {

                if (app.config.loginSuccessAction === "profile") {
                    app.ctrl.showUserProfileAction();
                } else if (app.config.loginSuccessAction === "profile_first_time" && localStorage.getItem(app.config.clientSessionName + '_alreadyLoggedIn') === null) {
                    localStorage.setItem(app.config.clientSessionName + '_alreadyLoggedIn', true);
                    app.ctrl.showUserProfileAction();
                } else { // events
                    app.ctrl.homeAction();
                }
            }
        },

        ui: {
            updateProfileName: function() {
                if (isDefined(app.core.session.user) && app.core.session.user !== null) {
                    if (app.core.session.user.shortName === null || app.core.session.user.shortName === "") {
                        app.core.session.user.shortName = app.core.session.user.firstName.charAt(0) + ". " + app.core.session.user.lastName;
                    }

                    $('nav a[data-activates="userMenu"] span.button-label')
                        .html(app.core.session.user.shortName);
                } else {
                    $('nav a[data-activates="userMenu"] span.button-label')
                        .html('Mon compte');
                }
            }
        }
    },
})
