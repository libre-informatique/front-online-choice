
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
    },
    initPlugins: function() {
      $('.period').each(function() {
        var sortable = Sortable.create($(this).find('#event-list')[0], {
          handle: '.priority'
        });
      });
    }
  },
  save: function() {
    //Todo send final choices to the server
    alert('choix sauvergardés');
  }
};

$(document).ready(app.init);
