app.register({
    cart: {
        init: function () {
            app.cart.ws.getCart().then(function (res) {
                var cart = res._embedded.items[0];
                $.extend(app.core.session, {cart: cart});

                app.cart.applyCart();
            }, function () {

            });
        },

        applyCart: function () {
            var items = app.core.session.cart.items;

            // LOOP OVER CART ITEMS
            $.each(items, function (i, item) {
                var declinaisonId = item.declination.id;
                var manif = app.cart.private.findManifestationWithDeclinaison(declinaisonId);

                // ASSIGN CART ITEM ID TO MANIFESTATION IN FLAT « ARRAY »
                if (manif !== null) {
                    manif.cartItemId = item.id;

                    // UPDATE EVENTS ON UI
                    app.events.ui.presenceButton($('li.event[data-id="' + manif.id + '"] .presence-btn'));
                }
            });
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
        }
    }
});
