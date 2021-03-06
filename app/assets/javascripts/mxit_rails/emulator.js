//= require mxit_rails/jquery-1.8.0.min
//= require mxit_rails/jquery.cookie

Emulator = (function() {
  var keys = {
    BACKSPACE: 8,
    ENTER: 13,
    ESCAPE: 27,

    SPACE: 32,

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    ZERO: 48,
    NINE: 57,

    A: 65,
    Z: 90
  };

  return {
    activeLink: 0,

    setCookie: function(mxitId, msisdn) {
      // Create cookies.  Use only lowercase cookie names - the server expects this (case insensitivity seems dodgy)
      $.cookie('x-mxit-login', mxitId, {path: '/'});
      $.cookie('x-mxit-userid-r', 'm987654321', {path: '/'});
      $.cookie('x-mxit-device-info', 'DISTRO_CODE,' + msisdn, {path: '/'});

      // Reset the iframe
      $('#center').attr('src', '/' + MXIT_ROOT);
    },

    clearCookie: function() {
      // Create cookies.  Use only lowercase cookie names - the server expects this (case insensitivity seems dodgy)
      $.cookie('x-mxit-login', null, {path: '/'});
      $.cookie('x-mxit-userid-r', null, {path: '/'});
      $.cookie('x-mxit-device-info', null, {path: '/'});

      // Reset the iframe
      $('#center').attr('src', '/' + MXIT_ROOT);
    },

    enterCredentials: function() {
      $('#default').hide();
      $('#inputs').show();
      $('#mxit-id-input').focus();
    },

    saveCredentials: function() {
      localStorage.setItem('mxitId', $('#mxit-id-input').val());
      localStorage.setItem('msisdn', $('#msisdn-input').val());
      $('#default').show();
      $('#inputs').hide();
      Emulator.setCredentials();
    },

    setCredentials: function() {
      mxitId = localStorage.getItem('mxitId');
      msisdn = localStorage.getItem('msisdn');

      Emulator.setCookie(mxitId, msisdn);
      $('#link').hide();
      $('#unlink').show();
      $('#registered').show();
      $('#not-registered').hide();
      $('#mxit-id').html(mxitId);
    },

    clearCredentials: function() {
      localStorage.removeItem('mxitId');
      localStorage.removeItem('msisdn');

      Emulator.clearCookie();
      $('#link').show();
      $('#unlink').hide();
      $('#registered').hide();
      $('#not-registered').show();
    },

    iframe: function() {
      return $('#center')[0].contentWindow;
    },
    iframeElement: function(queryString) {
      return $(queryString, Emulator.iframe().document);
    },

    collapse: function() {
      $('#phone').removeClass('collapse');
      $('#fadeout').show();
    },

    expand: function() {
      $('#phone').addClass('collapse');
      $('#fadeout').hide();
    },

    refresh: function() {
      Emulator.iframe().location.reload();
    },

    updateIframe: function() {
      Emulator.iframeElement('body').on('keydown', $.proxy(Emulator, 'key'));

      if (this.hasInput()) {
        $('#phone-input').attr('disabled', false);
        this.activeLink = this.numLinks();    
      } else {
        $('#phone-input').attr('disabled', 'disabled').blur();
        this.activeLink = 0;
      }
      this.focusLink();
    },

    key: function(e) {
      if ((e.keyCode == keys.UP) || (e.keyCode == keys.DOWN)) {
        if (e.keyCode == keys.UP) {
          this.activeLink--;
        } else {
          this.activeLink++
        }
        this.focusLink();
      }
    },

    hasInput: function() {
      return Emulator.iframeElement('form').length > 0;
    },

    numLinks: function() {
      return Emulator.iframeElement('a').length;
    },

    focusLink: function() {
      var num = this.numLinks();
      var max = this.hasInput() ? num : num - 1;

      if (this.activeLink < 0) this.activeLink = max;
      if (this.activeLink > max) this.activeLink = 0;

      if (this.activeLink == num) {
        this.focusInput();
      } else {
        $(Emulator.iframeElement('a')[this.activeLink]).focus();
      }
    },

    focusInput: function() {
      if (this.hasInput()) {
        $('#phone-input').attr('disabled', false).focus();
      } else {
        $('#phone-input').attr('disabled', 'disabled').blur();
      }
    },

    submit: function(e) {
      if (e.charCode == keys.ENTER) {
        if (Emulator.iframeElement('form').length > 0) {
          Emulator.iframeElement('input[type=text]').val($('#phone-input').val());
          Emulator.iframeElement('input[type=submit]').click();

          $('#phone-input').val('');
        }
      }
    },
  }
})();

$(function() {

  // Check whether there is a Mxit ID and msisdn in local storage
  var mxitId = localStorage.getItem('mxitId');
  var msisdn = localStorage.getItem('msisdn');

  if (mxitId && msisdn) {
    Emulator.setCredentials();

  } else {
    Emulator.clearCredentials();
  }

  $('body').on('keydown', $.proxy(Emulator, 'key'));
  $('#phone-input').on('keypress', $.proxy(Emulator, 'submit'))

});
