'use strict';
const request = require('axios');
const baseUrl = 'https://www.nseindia.com';
const optionsPath = '/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp';
const headers = {
    'User-Agent': 'Chrome/71.0.3578.98',
    'X-Requested-With': 'XMLHttpRequest',
    'referer': baseUrl
};
class Collector {
    async loadOptions() {
        console.log('>>>>>', baseUrl);
        const { data } = await request(`${baseUrl}${optionsPath}`, {}, headers);
        console.log('<<<<<', baseUrl);
        return data;
    }
}
module.exports = new Collector();

