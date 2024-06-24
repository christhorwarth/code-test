
const _ = require('lodash')

const float = function (num, precision, minPrecision) {
    num = parseFloat(num) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: _.isUndefined(minPrecision) ? precision : minPrecision,
      maximumFractionDigits: precision
    });
};
  
const currency = function (amount) {
    if (typeof amount === 'string') {
      amount = amount.replace('$', '');
    }
    amount = '$' + float(amount, 2);
    amount = amount.replace('$-', '-$');
    return amount;
};

module.exports = {
    currency
};
