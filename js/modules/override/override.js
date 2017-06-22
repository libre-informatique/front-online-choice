app.register({
    override: {
        initEvents: function() {
            $(document)
                .on('modal.open', function() {
                    $('.modal-overlay').css({
                        "zIndex":1010
                    });
                });
        }
    },
    baseUi: {
        initEvents: function() {},
        registerTemplates: function() {},
    },
    featureDiscovery: {
        registerTemplates: function() {}
    },
})
