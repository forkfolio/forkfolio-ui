import UserModel from "../UserModel"
import ResModel from "../ResModel"
import { dateUtils } from './../../utils/DateUtils';

export var resModel = new ResModel();
export let userModel = new UserModel([], resModel);


export const rangeSelectorModel = {
    inputPosition: {
        align: 'left',
        x: 0,
        y: 0
    },
    buttonPosition: {
        align: 'right',
        x: 0,
        y: 0
    },
    //selected: 2,
    buttons: [ {
        type: 'day',
        count: 7,
        text: '1w',
        days: 7,
        userFriendlyText: 'Last 7 days',
    },{
        type: 'month',
        count: 1,
        text: '1m',
        days: 30,
        userFriendlyText: 'Last 30 days',
    }, {
        type: 'month',
        count: 3,
        text: '3m',
        days: 90,
        userFriendlyText: 'Last 3 months',
    }, {
        type: 'ytd',
        text: 'YTD',
        days: dateUtils.getDaysSince(new Date(new Date().getFullYear(), 0, 0)),
        userFriendlyText: 'Year-to-date',
    }, {
        type: 'year',
        count: 1,
        text: '1y',
        days: 365,
        userFriendlyText: 'Last year',
    }, {
        type: 'all',
        text: 'All',
        userFriendlyText: 'All time',
    }]
}