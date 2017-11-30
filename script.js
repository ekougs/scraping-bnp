var require = patchRequire(require);
var scrapingBnp = require('lib/index.js');

scrapingBnp.getAccountInformation('123', '123456', function(accountsInfo) {
  console.log(JSON.stringify(accountsInfo));
});
