$.extend(app, {
    history: {

        provider: window.history,

        add: function (state) {
            var stateContent = $('#app').html();
            console.info(state);
            app.history.provider.pushState({
                content: stateContent
            }, state.title, "?/" + state.path);
        }

    }
});
