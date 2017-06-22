app.register({
    ctrl: {
        states: {
            showEvents: {
                path: "events",
                title: "Évènements"
            }
        },
        homeAction: function() {
            if (app.core.session.user !== null)
                app.ctrl.showEvents();
        },
        showEvents: function(force) {
            if (app.core.history.currentState !== app.ctrl.states.showEvents || force) {
                app.core.ui.clearContent();
                $('#contentLoader').show();
                var events = app.ws.getEvents()
                    .then(function(events) {
                        app.core.ctrl.render('mainTabs', events, true).then(function() {

                            if (!localStorage.getItem(app.config.clientSessionName + '_introduction')) {
                                app.ctrl.showIntroductionModal();
                            }

                            app.cart.getCart().then(function() {
                                app.cart.applyCart().then(function() {
                                    app.events.ui.initTabs();
                                    app.events.ui.initSortables();
                                    app.events.ui.initPushpin();
                                    app.core.history.add(app.ctrl.states.showEvents);
                                    app.featureDiscovery.showFeatureDiscovery('info-validateCart');
                                    app.featureDiscovery.showFeatureDiscovery('info-profileButton');
                                });
                            });
                        });
                    }, function(error) {});
            }
        },
        showIntroductionModal: function() {
            app.ws.getMetaEvent().then(function(metaEventTexts) {
                if (metaEventTexts.description != '') {
                    app.baseUi.openModal('#introductionModal','introduction', { texts: metaEventTexts });
                    localStorage.setItem(app.config.clientSessionName + '_introduction', true);
                }
            });
        }
    },
})
