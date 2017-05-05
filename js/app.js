
var app = {
  init: function() {
    //var tabContent = Handlebars.compile($('#tab-content-template').html());
    //$('body').append(tabContent());
    app.ui.init();
  },
  ui: {
    init: function() {
      this.initPlugins();
      var modal = $('#confirm-modal');
      modal.modal();

      $('#confirm-fab').click(function() {
        modal.modal('open');

        $('#cancel-btn').click(function() {
          modal.modal('close');
        });

        $('#save-btn').click(function() {
          app.save();
          modal.modal('close');
        });
      });

      //presence buttons toggle
      $('.presence-btn')
        .not('.mandatory')
        .click(function(){
          if($(this).hasClass('attend')) {
            $(this)
              .removeClass('attend btn-flat teal')
              .addClass('btn blue')
              .html('Participer')
            ;
          }else {
            $(this)
              .prop('attend', true)
              .removeClass('btn blue')
              .addClass('attend btn-flat teal')
              .html('Présent')
            ;
          }
        })
      ;
    },
    initPlugins: function() {
      $('.period').each(function() {
        Sortable.create($(this).find('#event-list')[0], {
          handle: '.priority'
        });
      });
    }
  },
  save: function() {
    //Todo send final choices to the server
    alert('Choix sauvegardés');
  }
};

$(document).ready(app.init);
