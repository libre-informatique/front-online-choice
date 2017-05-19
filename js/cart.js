app.register({
    cart: {
        init: function () {
            app.cart.ws.getCart().then(function (res) {
                var cart = res._embedded.items[0];
                $.extend(app.core.session, {cart: cart});
            }, function () {

            });
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

                return defer;
            },

            // ---------------------------------------------------------------------
            // CREATE CART
            // ---------------------------------------------------------------------

            addToCart: function (item) {
                var defer = jQuery.Deferred();

                app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items', {
                    "type": "ticket",
                    "declinationId": 52,
                    "quantity": 1,
                    "priceId": 3
                }, function (res) {
                    defer.resolve(res);
                }, function (jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible d\'ajouter un élément au panier', 'error');
                    defer.reject();
                });

                return defer;
            }
        }
    }
});