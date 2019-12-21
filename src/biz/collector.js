'use strict';
const request = require('axios');

const uri = 'https://www.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp';
const headers = {
    'User-Agent': 'Chrome/71.0.3578.98',
    'X-Requested-With': 'XMLHttpRequest',
    'referer': 'https://www.nseindia.com'
};
class Collector {
    async loadOptions() {
        console.log('start=>>>>>>>>>>>>>>>>>>>>');
        const { data } = await request(uri, {}, headers);
        console.log('got it=>>>>>>>>>>>>>>>>>>>>');
        return data;
    }
}
module.exports = new Collector();

