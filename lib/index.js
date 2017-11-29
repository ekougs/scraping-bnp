'use strict';
var require = patchRequire(require);
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

module.exports.getAccountInformation = getAccountInformation;

function getAccountInformation() {
  var identificationFormSelector = 'form[name="logincanalnet"]';
  var startUrl = 'https://mabanque.bnpparibas/sitedemo/ident.html';
  casper.start(startUrl, function() {
    casper.log('Waiting for "' + startUrl + '"', 'info');
    this.waitForSelector(identificationFormSelector);
  });

  casper.then(function() {
    var account = '123';
    casper.log('Trying to identify account "' + account + '"', 'info');
    this.fill(
      identificationFormSelector,
      {
        ch1: account
      },
      true
    );
    // The password input seems visually disabled but is not. I can then immediately set the password.
    var password = '123456';
    casper.log('Trying to set password for account "' + account + '"', 'debug');
    for (var i = 0; i < password.length; i++) {
      var passwordChar = password[i];
      this.click('a[data-value="' + passwordChar + '"]');
    }
  });

  var submitIdentNotDisabledSelector = 'button#submitIdent:not([disabled])';
  casper.waitForSelector(submitIdentNotDisabledSelector, function() {
    casper.log('clicking', 'debug');
    this.click(submitIdentNotDisabledSelector);
  });

  casper.run();
}
