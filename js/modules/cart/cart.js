/* global app */

app.register({
    cart: {
        init: function() {
            app.cart.getCart().then(function() {

            }, function() {
                app.ctrl.loginAction();
            });
        },

        initEvents: function() {
            $(document)

                // -------------------------------------------------------------
                // CONFIRMATION FAB BUTTON
                // -------------------------------------------------------------

                .on('click', '#confirm-fab', function(e) {
                    app.baseUi.openModal('#confirm-modal','cartConfirm',{});
                })

                // -------------------------------------------------------------
                // CONFIRMATION MODAL BUTTONS
                // -------------------------------------------------------------

                .on('click', '#cancel-btn', function(e) {
                    app.baseUi.closeModal();
                })

                .on('click', '#save-btn', function(e) {
                    app.baseUi.closeModal();
                })

                // -----------------------------------------------------------------
                // EVENTS SAVE CART
                // -----------------------------------------------------------------

                .on('click', '#save-btn', function(e) {
                    app.cart.validateCart().then(function() {
                        app.baseUi.closeModal();
                        app.ctrl.showEventsAction(true);
                    });
                })

            ;
        },

        getCart: function() {
            var defer = jQuery.Deferred();
            app.ws.getCart().then(function(res) {
                var cart = res._embedded.items[0];
                if (isDefined(cart)) {
                    if (!$.isArray(cart.items))
                        cart.items = [];
                    $.extend(app.core.session, {
                        cart: cart
                    });
                    app.core.session.save();
                    defer.resolve();
                } else {
                    app.core.session.destroy();
                    defer.reject();
                }
            }, function() {
                defer.reject();
            });
            return defer.promise();
        },

        applyCart: function() {
            var defer = jQuery.Deferred();

            var items = app.core.session.cart.items;

            var promises = [];

            // LOOP OVER CART ITEMS
            $.each(items, function(i, item) {
                if (isDefined(item) && item !== null) {
                    var declinaisonId = item.declination.id;
                    var manif = app.cart.private.findManifestationWithDeclinaison(declinaisonId);

                    // ASSIGN CART ITEM ID TO MANIFESTATION IN FLAT « ARRAY »
                    if (manif !== null) {
                        manif.cartItemId = item.id;
                        var manifDom = $('li.event[data-id="' + manif.id + '"]');

                        manifDom.attr('data-rank', item.rank);

                        // UPDATE EVENTS ON UI
                        if (item.hasOwnProperty('state') && item.state !== "none") {
                            app.events.ui.requiredParticipationButton(manifDom.find('.presence-btn'));
                            app.events.disableTimeSlot(manifDom.closest('.period'));
                        } else {
                            app.events.ui.presenceButton(manifDom.find('.presence-btn'));
                        }
                        promises.push(jQuery.Deferred().resolve());
                    } else {
                        promises.push(jQuery.Deferred().reject());
                    }
                }
            });

            app.events.ui.sortManifestations();

            $.when.apply($, promises).always(function() {
                if (app.core.session.cart.checkoutState !== "cart" || moment(app.config.closingDate).isBefore(moment())) {
                    app.events.disableTimeSlot();
                    app.events.disableCartValidationButton();
                    app.events.ui.initSortables();
                    if (app.core.session.cart.checkoutState === "fulfilled") {
                        $('.event.disabled').remove();
                        $('.period').each(function() {
                            var items = $(this).find('.event');
                            if (items.length === 0) {
                                $(this).remove();
                            }
                        });
                    } else if (moment(app.config.closingDate).isBefore(moment())) {
                        app.core.session.cart.checkoutState = "outdated";
                        app.events.disableCartValidationButton();
                    }
                }

                defer.resolve();
            }, function(e) {
                defer.reject();
            });

            return defer.promise();
        },

        validateCart: function() {

            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/checkouts/complete/' + app.core.session.cart.id, {}, function(res) {
                defer.resolve(res);
            });

            return defer.promise();
        },

        private: {
            findManifestationWithDeclinaison: function(declinaisonId) {
                var manifestation = null;
                Object.keys(app.events.manifestations).forEach(function(key) {
                    var manif = app.events.manifestations[key];
                    if (manif.gauges[0].id == declinaisonId)
                        manifestation = manif;
                });
                return manifestation;
            }
        },
    },
});
