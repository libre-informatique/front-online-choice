app.register({
    override: {
        initEvents: function() {
            $(document)
                .on('modal.open', function() {
                    $('.modal-overlay').css({
                        "zIndex":1010
                    });
                });

                Handlebars.registerHelper('formatDate', function(dateStr, format) {
                    var date = moment.utc(dateStr);
                    return date.format(format);
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
