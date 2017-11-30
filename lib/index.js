'use strict';
var require = patchRequire(require);
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

module.exports = {
  getAccountInformation: getBnpAccountInformation,
  casper: casper,
};

/**
 * Get account information for BNP customers
 * @param userId: the account ID of the customer
 * @param userPassword: the account password of the customer
 * @param valueConsumerFn: this function will be called with the accounts info of the customer when they have been retrieved.
 * See also account-info.schema.json
 */
function getBnpAccountInformation(userId, userPassword, valueConsumerFn) {
  var startUrl = 'https://mabanque.bnpparibas/sitedemo/ident.html';
  var identificationFormSelector = 'form[name="logincanalnet"]';

  casper.start(startUrl, function waitForIdentificationForm() {
    casper.log('Waiting for BNP demo app on "' + startUrl + '"', 'debug');
    this.waitForSelector(identificationFormSelector);
  });

  casper.then(function fillTheAccountId() {
    casper.log('Setting user ID "' + userId + '"', 'debug');
    this.fill(
      identificationFormSelector,
      {
        ch1: userId
      },
      false
    );
  });

  casper.then(function fillThePassword() {
    // The password input seems visually disabled but is not. I can immediately set the password.
    casper.log('Setting password for user ID "' + userId + '"', 'debug');
    for (var i = 0; i < userPassword.length; i++) {
      var passwordChar = userPassword[i];
      this.click('a[data-value="' + passwordChar + '"]');
    }
  });

  casper.then(function clickToIdentify() {
    casper.log('Submitting identification', 'debug');
    this.click('button#submitIdent:not([disabled])');
  });

  var accountsInfo;
  casper.then(function extractAccountsInfoWhenLoggedIn() {
    // Accounts elements are in the first child iframe
    this.page.switchToChildFrame(0);
    accountsInfo = casper.evaluate(transformAccountsElementsIntoAccountsInfo);
    casper.log('User accounts info have been successfully retrieved', 'info');
  });

  casper.run(function () {
    valueConsumerFn(accountsInfo);
    this.exit();
  });


  function transformAccountsElementsIntoAccountsInfo() {
    var accountElements = document.querySelectorAll('div.row.main.compte-favori');
    return Array.prototype.map.call(accountElements, function transformAccountElementIntoAccountInfo(accountElement) {
      var accountTitle = getElementTextContent(accountElement, 'div.infos-compte-fix h4');
      __utils__.log('Getting information for account "' + accountTitle + '"');
      var accountInfo = {
        title: accountTitle,
      };
      // The account number is the last child node of div.infos-compte-fix
      // See also https://developer.mozilla.org/en-US/docs/Web/API/Text
      var accountElementChildNodes = accountElement.querySelector('div.infos-compte-fix').childNodes;
      accountInfo.number = accountElementChildNodes[accountElementChildNodes.length - 1].wholeText.trim();
      accountInfo.balance = getParsedAmount(accountElement, 'div.infos-solde h4.udc-solde');
      accountInfo.forecastedBalance = getParsedAmount(accountElement, 'div.infos-solde p.info > strong');

      return accountInfo;

      function getParsedAmount(parentElement, selector) {
        return parseAmount(getElementTextContent(parentElement, selector));
      }

      function parseAmount(amount) {
        if (!amount) {
          return
        }
        // As amounts are formatted with the appropriate currency, we need to remove the currency sign before parsing it
        amount = amount.substring(0, amount.length - 2).trim().replace(',', '').replace('.', '');
        return Number(amount);
      }

      function getElementTextContent(parentElement, selector) {
        // Have to do this because " element || element.textContent " does not work when evaluating with casper.evaluate
        var element = parentElement.querySelector(selector);
        if (!!element && !!element.textContent) {
          return element.textContent.trim();
        }
      }
    });
  }
}
