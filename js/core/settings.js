/* global app */

app.register({
    core: {
        settings: {

        }
    },

    ctrl: {
        states: {
            settings: {
                path: "settings",
                title: "Paramètres"
            }
        },

        showSettings: function () {
            app.core.history.currentCallable = app.ctrl.showSettings;
            app.ws.getUser(app.core.session.user.id).then(function () {
                app.core.ctrl.go('settings').then(function () {
                    Materialize.updateTextFields();
                    app.core.history.add(app.ctrl.states.settings);
                });
            });
        },

        updateSettings: function (form) {
            var formData = app.core.utils.formToObject(form.serializeArray());

            if (formData.clearAllInfosMessages === true) {
                app.featureDiscovery.__resetInfosStorage();
            }
            app.ctrl.showEvents();
            app.core.ui.toast("Paramètres enregistrés", "success");
        },
    }
});