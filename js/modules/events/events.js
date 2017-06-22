/* global app */

app.register({
    events: {
        // HOLDS MANIFESTATIONS IN FLAT OBJECT
        manifestations: {},


        registerTemplates: function() {
            app.core.ui.addTemplate('app', 'introduction', '/js/modules/events/views/introduction.html');
            app.core.ui.addTemplate('app', 'infos', '/js/modules/events/views/infos.html');
        },

        // -------------------------------------------------------------------------
        // ADD UI EVENTS (PRESENCE BUTTONS)
        // -------------------------------------------------------------------------

        initEvents: function() {

            $(document)

                // -----------------------------------------------------------------
                // PRESENCE BUTTONS
                // -----------------------------------------------------------------

                .on('click', '.presence-btn', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (app.core.session.cart.checkoutState === "cart") {
                        if ($(this).hasClass('forced')) {
                            app.core.ui.toast('Votre présence à cette manifestation est obligatoire', 'info');
                            return true;
                        } else {
                            var selectedEventsInTs = $(this).closest('.period').find('.event.selected').length;

                            if (app.config.maximumEventsSelectedPerTimeslots !== -1 && selectedEventsInTs >= app.config.maximumEventsSelectedPerTimeslots && !$(this).hasClass('attend')) {
                                app.core.ui.toast('Vous ne pouvez choisir que ' + app.config.maximumEventsSelectedPerTimeslots + ' éléments maximum par créneau horaire', 'info');
                                return true;
                            } else if (!$(this).hasClass('attend')) {
                                app.events.ui.presenceButton($(this));
                            } else {
                                app.events.ui.participateButton($(this));
                            }

                        }
                        app.events.selectManifestation($(this));
                        return true;
                    }
                })

                .on('click','#introductionButton',function() {
                    app.ctrl.showIntroductionModal();
                })

                // -----------------------------------------------------------------
                // EVENTS REORDERED (SORTABLE END)
                // -----------------------------------------------------------------

                .on('events.reordered', function(e, container) {
                    app.events.eventsReordered(container);
                });

            // -----------------------------------------------------------------
            // CLOSING DATE IS SET
            // -----------------------------------------------------------------

            Handlebars.registerHelper('issetClosingDate', function(options) {
                return app.config.closingDate !== null ? options.fn(this) : options.inverse(this);
            });

            // -----------------------------------------------------------------
            // RENDER CLOSING DATE
            // -----------------------------------------------------------------

            Handlebars.registerHelper('renderChoicesClosingDate', function(format) {
                if (app.config.closingDate !== null) {
                    var date = moment(app.config.closingDate);
                    return date.format(format);
                } else {
                    return '';
                }
            });
        },

        // -------------------------------------------------------------------------
        // TRANSFORM API DATA STRUCTURE TO BE USED IN FRONTEND UI STRUCTURE
        // -------------------------------------------------------------------------

        manageApiResult: function(result, minInterval, maxInterval) {

            var finalFormat = {
                days: {},
                ts: {}, // TEMP FIELD, DELETED WHEN FUNCTION ENDS
            };

            // CREATE DAYS BETWEEN MIN AND MAX INTERVAL
            for (var m = moment(minInterval); m.isBefore(maxInterval); m.add(1, 'days')) {
                var dayId = m.format('dddDDMM');
                finalFormat.days[dayId] = {
                    id: m.format('dddDDMM'),
                    label: m.format('ddd DD/MM'),
                    ts: [],
                    manifCount: 0
                };
                finalFormat.daysCount++;
            }

            // LOOP OVER API RESULTS
            $.each(result, function(i, manif) {
                $.each(manif.timeSlots, function(j, timeslot) {
                    var tsId = timeslot.id;
                    var ts = null;

                    if (!finalFormat.ts.hasOwnProperty(tsId)) {
                        // CREATE TIMESLOT IF NOT EXISTS
                        finalFormat.ts[tsId] = $.extend(timeslot, {
                            manifestations: {}
                        });
                    }
                    ts = finalFormat.ts[tsId];

                    var mId = manif.id;
                    var m = null;

                    if (!ts.manifestations.hasOwnProperty(mId)) {
                        // CREATE MANIFESTATION IF NOT EXISTS
                        ts.manifestations[mId] = manif;
                        delete manif.timeSlots; // AVOID TOO MUCH RECURSION
                    }
                    m = ts.manifestations[mId];

                    m.event.name = m.event.translations[app.config.lang].name;
                    m.event.description = m.event.translations[app.config.lang].description;

                    app.events.manifestations[m.id] = m;
                });
            });

            // MOVE TIMESLOTS INTO TAB DAYS
            Object.keys(finalFormat.ts).forEach(function(key) {
                var ts = finalFormat.ts[key];
                var day = moment(app.core.utils.parseDate(ts.startsAt));
                var dayId = day.format('dddDDMM');

                if (finalFormat.days.hasOwnProperty(dayId)) {
                    finalFormat.days[dayId].ts.push(ts);
                    finalFormat.days[dayId].ts.sort(function(a, b) {
                        return app.core.utils.parseDate(a.startsAt) - app.core.utils.parseDate(b.startsAt);
                    });
                }
            });

            // COUNT MANIFESTATIONS FOR EACH DAYS
            $.each(finalFormat.days, function(i, day) {
                $.each(day.ts, function(j, ts) {
                    $.each(ts.manifestations, function(k, manif) {
                        day.manifCount++;
                    });
                });
            });

            delete finalFormat.ts;

            return finalFormat;
        },

        // -------------------------------------------------------------------------
        // HANDLE MANIFESTATION SELECTION
        // -------------------------------------------------------------------------

        selectManifestation: function(button) {

            var manifId = button.closest('.event').attr('data-id');
            var selecting = button.hasClass('attend');
            var sortable = button.closest('li.event');
            var sortableGroup = sortable.parent();
            var declinaisonId = app.events.manifestations[manifId].gauges[0].id;
            var priceId = app.events.manifestations[manifId].gauges[0].prices[0].id;
            var cartItemId = app.events.manifestations[manifId].cartItemId;
            var allTsButtons = sortableGroup.find('.presence-btn');

            allTsButtons.addClass('loading');

            if (selecting) {
                app.ws.addToCart(declinaisonId, priceId).then(function(res) {
                    sortable.animate({
                        opacity: 0.2
                    }, 500, 'swing', function() {
                        app.events.ui.sortManifestations(sortableGroup, true);
                        app.core.session.cart.items.push(res);
                        app.events.manifestations[manifId].cartItemId = res.id;
                        sortable.attr('data-rank', res.rank);

                        sortable.not('.ghost').animate({
                            opacity: 1
                        }, 500, function() {
                            allTsButtons.removeClass('loading');
                            app.events.ui.initSortables();
                        });

                        app.events.eventsReordered(sortableGroup);
                    });
                }, function() {
                    allTsButtons.removeClass('loading');
                    app.events.ui.initSortables();
                });
            } else {
                app.ws.removeFromCart(cartItemId).then(function() {
                    sortable.animate({
                        opacity: 0.2
                    }, 500, 'swing', function() {
                        sortable.removeAttr('data-rank');
                        app.events.ui.sortManifestations(sortableGroup, true);

                        sortable.not('.ghost').animate({
                            opacity: 1
                        }, 500, function() {
                            allTsButtons.removeClass('loading');
                            app.events.ui.initSortables();
                        });

                        app.events.eventsReordered(sortableGroup);
                    });
                }, function() {
                    allTsButtons.removeClass('loading');
                    app.events.ui.initSortables();
                });
            }

        },

        disableTimeSlot: function(tsDom) {
            var excludes = '.forced';
            if (!isDefined(tsDom)) {
                tsDom = $('.period');
                excludes += ',.selected';
            }

            tsDom.each(function() {

                var events = $(this).find('li.event');
                var eventsToDisable = events.not(excludes);
                var forcedEvent = events.filter('.forced');

                // DISABLING EVENTS
                eventsToDisable
                    .addClass('cantSort disabled')
                    .find('.btn, .btn-flat').attr('disabled', 'disabled');

                forcedEvent
                    .addClass('cantSort');

                $(this).addClass('timeSlotLocked');

            });
        },

        disableCartValidationButton: function() {
            $('#confirm-fab').remove();
            $('.cart-status-message.cart-' + app.core.session.cart.checkoutState).show();
        },

        eventsReordered: function(container) {
            var defer = $.Deferred();
            var events = container.find('li.event:not(.cantSort)');

            var promises = [];

            var i = 1;
            var ranks = [];
            var oldRanks = {};
            events.each(function() {
                var cartItemId = app.events.manifestations[$(this).attr('data-id')].cartItemId;

                if ($(this).attr('data-id') && $(this).attr('data-rank') !== i) {

                    ranks.push({
                        rank: i,
                        cartItemId: cartItemId
                    });

                    oldRanks[$(this).attr('data-id')] = $(this).attr('data-rank');

                    $(this).attr('data-rank', i);

                }
                promises.push($.Deferred().resolve());
                i++;
            });

            $.when.apply($, promises).then(function() {
                app.ws.updateRanks(ranks).then(function() {
                    $.each(app.core.session.cart.items, function(i) {
                        var item = app.core.session.cart.items[i];
                        if (isDefined(item) && item !== null) {
                            $.each(ranks, function(j, r) {
                                if (item.id === r.cartItemId) {
                                    app.core.session.cart.items[i].rank = r.rank;
                                }
                            });
                        }
                    });
                    app.cart.applyCart();
                    defer.resolve();
                }, function() {
                    events.each(function() {
                        $(this).attr('data-rank', oldRanks[$(this).attr('data-id')]);
                    });
                    defer.reject();
                });
            });

            return defer.promise();
        }
    },
});
