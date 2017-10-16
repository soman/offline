Number.prototype.formatMoney = function(c, p, d, t) {
  var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      p = p == undefined ? "" : p,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
  return p + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function PMT(rate, nper, pv, fv, type) {
  if (!fv) fv = 0;
  if (!type) type = 0;

  if (rate == 0) return (pv + fv) / nper; // removed multiplication with minus 1

  var pvif = Math.pow(1 + rate, nper);
  var pmt = rate / (pvif - 1) * (pv * pvif + fv); // removed multiplication with minus 1

  if (type == 1) {
    pmt /= (1 + rate);
  };

  return pmt;
} // end of PMT
