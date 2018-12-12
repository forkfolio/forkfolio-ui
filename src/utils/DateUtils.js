/*jshint esversion: 6 */
import moment from 'moment';

class DateUtils {
  getDaysSince(sinceDate) {
    return moment(new Date()).diff(moment(sinceDate), 'days');
  }
}

export let dateUtils = new DateUtils();