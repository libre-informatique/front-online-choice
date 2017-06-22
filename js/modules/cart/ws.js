app.register({
    ws: {

        // ---------------------------------------------------------------------
        // RETREIVE CART
        // ---------------------------------------------------------------------

        getCart: function() {
            var defer = jQuery.Deferred();

            app.core.ws.call('GET', '/carts', {}, function(res) {
                defer.resolve(res);
            }, function(jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de récupérer le panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // ADD CART ITEM
        // ---------------------------------------------------------------------

        addToCart: function(itemId, priceId) {
            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items', {
                "type": "ticket",
                "declinationId": itemId,
                "quantity": 1,
                "priceId": priceId
            }, function(res) {
                defer.resolve(res);
            }, function(jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible d\'ajouter un élément au panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        // ---------------------------------------------------------------------
        // REMOVE CART ITEM
        // ---------------------------------------------------------------------

        removeFromCart: function(cartItemId) {
            var defer = jQuery.Deferred();

            app.core.ws.call('DELETE', '/carts/' + app.core.session.cart.id + '/items/' + cartItemId, null, function(res) {
                $.each(app.core.session.cart.items, function(i, item) {
                    if (isDefined(item) && item !== null && item.id === cartItemId) {
                        delete app.core.session.cart.items[i];
                    }
                });
                defer.resolve(res);
            }, function(jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de supprimer un élément du panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        updateCartItem: function(cartItemId, data) {
            var defer = jQuery.Deferred();

            app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items/' + cartItemId, data, function(res) {
                defer.resolve(res);
            }, function(jqXHR, textStatus, errorThrown) {
                app.core.ui.toast('Impossible de mettre à jour un élément du panier', 'error');
                defer.reject();
            });

            return defer.promise();
        },

        updateRanks: function(ranks) {
            var defer = jQuery.Deferred();

            $.each(ranks, function(i, r) {
                if (!r.hasOwnProperty('cartItemId')) {
                    delete ranks[i];
                }
            });

            if (ranks.length > 1) {
                app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items/reorder', ranks, function(res) {
                    defer.resolve(res);
                }, function(jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible de mettre à jour les priorités', 'error');
                    defer.reject();
                });
            } else {
                defer.resolve();
            }
            return defer.promise();
        }
    }
});
