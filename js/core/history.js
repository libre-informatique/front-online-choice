/* global app */

app.register({
    core: {
        history: {

            // HOLDS CURRENT VIEW STATE
            currentState: null,

            // HOLDS CURRENT VIEW CALLABLE (USED FOR RECALL)
            currentCallable: function() {
                app.ctrl.login();
            },

            // WRAPPER BROWSER HISTORY
            // provider: History,
            
            // NATIVE BROWSER HISTORY
            provider: window.history,

            // DISABLE BACK ACTION WHEN TRUE
            disableBack: false,

            // ---------------------------------------------------------------------
            // ADD ENTRY TO BROWSER HISTORY STACK
            // ---------------------------------------------------------------------

            add: function(state) {
                var currentState = app.core.history.provider.state;

                if (currentState === null || currentState.state.path !== state.path) {
                    var content = $('#app').html();
                    app.core.history.provider.pushState({
                        content: content,
                        state: state
                    }, state.title, "?/" + state.path);

                    app.core.history.currentState = state;
                }
            },

            // ---------------------------------------------------------------------
            // INIT EVENTS (CALLED BY APP CORE EVENTS)
            // ---------------------------------------------------------------------

            initEvents: function() {

                // -----------------------------------------------------------------
                // HISTORY POP
                // -----------------------------------------------------------------

                $(window)
                    .on('popstate', function(event) {
                        var state = event.originalEvent.state;
                        if (state && !app.core.history.disableBack) {
                            $('#app').html(state.content);
                            app.core.ui.plugins.init();
                            $('.dropdown-button').dropdown('close');
                        }
                    });
            }
        }
    }
});