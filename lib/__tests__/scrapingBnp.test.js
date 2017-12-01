var require = patchRequire(require);
var Ajv = require('ajv');
var scrapingBnp = require('../index.js');

var accountInfoSchema = {
  "$schema": "http://json-schema.org/draft-06/schema#",
  "title": "Account Info",
  "description": "Bank account information",
  "type": "object",
  "properties": {
    "title": {
      "description": "The account title",
      "type": "string"
    },
    "number": {
      "description": "The account number",
      "type": "string"
    },
    "balance": {
      "description": "The account balance",
      "type": "number"
    },
    "forecastBalance": {
      "description":
        "The account balance taking into account's validated future transactions",
      "type": "number"
    }
  },
  "required": ["title", "number"]
};

var accountsInfoSchema = {
  "type": "array",
  "items" : accountInfoSchema
};


casper.test.begin('scrapingBnp tests', 2, function(test) {
  var ajv = new Ajv();
  scrapingBnp.getAccountInformation('123', '123456', function assertAccountsInfoValid(accountsInfo) {
    casper.test.assert(accountsInfo.length > 0, 'Account info should have a valid structure');
    casper.test.assert(ajv.validate(accountsInfoSchema, accountsInfo), 'Account info should have a valid structure');
    test.done();
  });
});
