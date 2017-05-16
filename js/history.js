$.extend(app, {
    history: {

        provider: window.history,

        add: function (state) {

            var currentState = app.history.provider.state;

            if (currentState === null || currentState.state.path !== state.path) {
                var content = $('#app').html();
                app.history.provider.pushState({
                    content: content,
                    state: state
                }, state.title, "?/" + state.path);
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
        if (state) {
            $('#app').html(state.content);
            app.ui.plugins.init();
            $('.dropdown-button').dropdown('close');
        }
    })

    ;
