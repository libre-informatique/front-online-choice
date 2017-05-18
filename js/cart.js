app.register({
    cart: {
        init: function () {
            app.core.ws.createCart().always(function (cart) {
                $.extend(app.core.session, {cart: cart});
            });
        }
    }
});