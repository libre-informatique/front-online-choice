$.extend(app, {
    cart: {
        init: function () {
            app.ws.createCart().always(function (cart) {
                $.extend(app.session, {cart: cart});
            });
        }
    }
});