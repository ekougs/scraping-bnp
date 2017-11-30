var require = patchRequire(require);
var scrapingBnp = require('lib/index.js');
var casper = scrapingBnp.casper;

var cliArgs = casper.cli.args;

if (cliArgs.length < 2) {
  casper.log('You should provide the account id and password.', 'error');
  casper.exit(1);
} else {
  var userId = getArgAsString(0);
  var userPassword = getArgAsString(1);

  scrapingBnp.getAccountInformation(userId, userPassword, function(accountsInfo) {
    casper.log(JSON.stringify(accountsInfo), 'info');
  });
}

function getArgAsString(index) {
  return '' + cliArgs[index];
}
