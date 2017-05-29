app.register({
    cart: {
        init: function () {
            app.cart.getCart().then(function () {

            }, function () {
                app.ctrl.login();
            });
        },

        initEvents: function () {
            $(document)

                // -----------------------------------------------------------------
                // EVENTS SAVE CART
                // -----------------------------------------------------------------

                .on('click', '#save-btn', function (e) {
                    app.cart.validateCart().then(function () {
                        app.core.ui.modal.modal('close');
                        app.ctrl.showEvents(true);
                    });
                })

                ;
        },

        getCart: function () {
            var defer = jQuery.Deferred();
            app.ws.getCart().then(function (res) {
                var cart = res._embedded.items[0];
                if (isDefined(cart)) {
                    $.extend(app.core.session, {cart: cart});
                    app.core.session.save();
                    defer.resolve();
                } else {
                    app.core.session.destroy();
                    defer.reject();
                }
            }, function () {
                defer.reject();
            });
            return defer.promise();
        },

        applyCart: function () {
            var defer = jQuery.Deferred();

            var items = app.core.session.cart.items;

            var promises = [];

            // LOOP OVER CART ITEMS
            $.each(items, function (i, item) {
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

            });

            app.events.ui.sortManifestations();

            $.when.apply($, promises).always(function () {
                if (app.core.session.cart.checkoutState !== "cart") {
                    app.events.disableTimeSlot();
                    app.events.disableCartValidationButton();
                    app.events.ui.initSortables();
                    if (app.core.session.cart.checkoutState === "fulfilled") {
                        $('.event.disabled').remove();
                        $('.period').each(function () {
                            var items = $(this).find('.event');
                            if (items.length === 0) {
                                $(this).remove();
                            }
                        });
                    }
                }

                defer.resolve();
            }, function (e) {
                defer.reject();
            });

            return defer.promise();
        },

        validateCart: function () {

            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/checkouts/complete/' + app.core.session.cart.id, {}, function (res) {
                defer.resolve(res);
            });

            return defer.promise();
        },

        private: {
            findManifestationWithDeclinaison: function (declinaisonId) {
                var manifestation = null;
                Object.keys(app.events.manifestations).forEach(function (key) {
                    var manif = app.events.manifestations[key];
                    if (manif.gauges[0].id == declinaisonId)
                        manifestation = manif;
                });
                return manifestation;
            }
        },
    },
    ws: {

        // ---------------------------------------------------------------------
        // CREATE CART
        // ---------------------------------------------------------------------

        getCart: function () {
            var defer = jQuery.Deferred();

            app.core.ws.call('GET', '/carts', {}, function (res) {
                defer.resolve(res);
            }, function (jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de récupérer le panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // ADD CART ITEM
        // ---------------------------------------------------------------------

        addToCart: function (itemId, priceId) {
            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items', {
                "type": "ticket",
                "declinationId": itemId,
                "quantity": 1,
                "priceId": priceId
            }, function (res) {
                defer.resolve(res);
            }, function (jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible d\'ajouter un élément au panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // REMOVE CART ITEM
        // ---------------------------------------------------------------------

        removeFromCart: function (cartItemId) {
            var defer = jQuery.Deferred();

            app.core.ws.call('DELETE', '/carts/' + app.core.session.cart.id + '/items/' + cartItemId, null, function (res) {
                defer.resolve(res);
            }, function (jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de supprimer un élément du panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        updateCartItem: function (cartItemId, data) {
            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items/' + cartItemId, data, function (res) {
                defer.resolve(res);
            }, function (jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de mettre à jour un élément du panier', 'error');
                defer.reject();
            });

            return defer.promise();
        }
    }
});
