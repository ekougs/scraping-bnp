'use strict';
var require = patchRequire(require);
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

module.exports.getAccountInformation = getAccountInformation;

function getAccountInformation(accountId, accountPassword, valueConsumer) {
  var startUrl = 'https://mabanque.bnpparibas/sitedemo/ident.html';
  var identificationFormSelector = 'form[name="logincanalnet"]';

  casper.start(startUrl, function() {
    casper.log('Waiting for "' + startUrl + '"', 'info');
    this.waitForSelector(identificationFormSelector);
  });

  casper.then(function() {
    casper.log('Trying to identify account "' + accountId + '"', 'info');
    this.fill(
      identificationFormSelector,
      {
        ch1: accountId
      },
      true
    );
    // The password input seems visually disabled but is not. I can then immediately set the password.
    casper.log('Trying to set password for account "' + accountId + '"', 'debug');
    for (var i = 0; i < accountPassword.length; i++) {
      var passwordChar = accountPassword[i];
      this.click('a[data-value="' + passwordChar + '"]');
    }
  });

  casper.then(function() {
    casper.log('clicking', 'debug');
    this.click('button#submitIdent:not([disabled])');
  });

  var accountsInfo;
  casper.then(function() {
    this.page.switchToChildFrame(0);
    accountsInfo = casper.evaluate(function() {
      var accountElements = document.querySelectorAll('div.row.main.compte-favori');
      return Array.prototype.map.call(accountElements, function mapAccountElementToInfo(accountElement) {
        var accountInfo = {
          title: getElementTextContent(accountElement, 'div.infos-compte-fix h4'),
        };
        accountInfo.number = getElementTextContent(accountElement, 'div.infos-compte-fix').replace(accountInfo.title, '').trim();
        accountInfo.balance = getParsedAmount(accountElement, 'div.infos-solde h4.udc-solde');
        accountInfo.forecastedBalance = getParsedAmount(accountElement, 'div.infos-solde p.info > strong');

        return accountInfo;

        function getParsedAmount(parentElement, selector) {
          return parseAmount(getElementTextContent(parentElement, selector));
        }

        function parseAmount(amount) {
          if(!amount) {
            return
          }
          amount = amount.substring(0, amount.length - 2).trim().replace(',', '').replace('.', '');
          return Number(amount);
        }

        function getElementTextContent(parentElement, selector) {
          // Have to do this because " element || element.textContent " does not work when evaluating with casper.evaluate
          var element = parentElement.querySelector(selector);
          if(!!element && !!element.textContent) {
            return element.textContent.trim();
          }
        }
      });
    });
    casper.log('User accounts info have been retrieved', 'info');
  });

  casper.run(function () {
    valueConsumer(accountsInfo);
    this.exit();
  });

}
