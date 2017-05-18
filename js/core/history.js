$.extend(app.core, {
    history: {

        currentState: null,

        provider: window.history,

        disableBack: false,

        add: function (state) {
            var currentState = app.core.history.provider.state;

            if (currentState === null || currentState.state.path !== state.path) {
                var content = $('#app').html();
                app.core.history.provider.pushState({
                    content: content,
                    state: state
                }, state.title, "?/" + state.path);

                app.core.history.currentState = state;
            }
        }
    }
});

$(window)

    // -------------------------------------------------------------
    // HISTORY POP
    // -------------------------------------------------------------

    .on('popstate', function (event) {
        var state = event.originalEvent.state;
        if (state && !app.core.history.disableBack) {
            $('#app').html(state.content);
            app.core.ui.plugins.init();
            $('.dropdown-button').dropdown('close');
        }
    })

    ;
