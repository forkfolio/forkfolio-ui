/*jshint esversion: 6 */

class FormatUtils {
    formatNumber(value, digits) {
        if(value != null) {
          return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
        }
    
        return "0";
      }
}

export let formatUtils = new FormatUtils();