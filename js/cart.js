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
                var deffer = jQuery.Deferred();

                app.core.ws.call('GET', '/carts', {}, function (res) {
                    deffer.resolve(res);
                }, function (jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible de récupérer le panier', 'error');
                    deffer.reject();
                });

                return deffer;
            },

            // ---------------------------------------------------------------------
            // CREATE CART
            // ---------------------------------------------------------------------

            addToCart: function (item) {
                var deffer = jQuery.Deferred();

                app.core.ws.call('POST', '/carts/' + app.core.session.cart.id + '/items', {
                    "type": "ticket",
                    "declinationId": 52,
                    "quantity": 1,
                    "priceId": 3
                }, function (res) {
                    deffer.resolve(res);
                }, function (jqXHR, textStatus, errorThrown) {
                    app.core.ui.toast('Impossible d\'ajouter un élément au panier', 'error');
                    deffer.reject();
                });

                return deffer;
            }
        }
    }
});