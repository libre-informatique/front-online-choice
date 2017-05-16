$.extend(app, {
    history: {

        provider: window.history,

        add: function (state) {
            var stateContent = $('#app').html();
            app.history.provider.pushState({
                content: stateContent
            }, state.title, "?/" + state.path);
        }
    }
});
