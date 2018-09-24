import UserModel from "../UserModel"
import ResModel from "../ResModel"

// create user model with test transactions for now
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
    selected: 2,
    buttons: [ {
        type: 'day',
        count: 7,
        text: '1w',
        days: 7,
    },{
        type: 'month',
        count: 1,
        text: '1m',
        days: 30,
    }, {
        type: 'month',
        count: 3,
        text: '3m',
        days: 90,
    }, {
        type: 'year',
        count: 1,
        text: '1y',
        days: 365,
    }, {
        type: 'year',
        count: 3,
        text: '3y',
        days: 3 * 365,
    }, {
        type: 'all',
        text: 'All'
    }, {
        type: 'ytd',
        text: 'YTD'
    },]
}