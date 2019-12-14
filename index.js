const request = require('request-promise-native')
const cheerio = require('cheerio');
const _ = require('lodash');

const options = {
    uri: 'https://www.nseindia.com/live_market/dynaContent/live_watch/option_chain/optionKeys.jsp',
    transform: cheerio.load
};
const StrikePriceIndex = 11;
const totalColumns = (StrikePriceIndex * 2) + 1;

request(options).then(($) => {
    const dataRows = [];
    const columns = [];
    $('.opttbldata > table tr:nth-of-type(2) th').each((i, row) => {
        columns.push(_.camelCase(row.children[0].data))
    });
    dataObject = {};
    $('.opttbldata > table tr td').each((i, row) => {
        const columnIndex = i % totalColumns;
        if (columnIndex === 0) {
            dataRows.push(dataObject);
            dataObject = { calls: {}, puts: {} };
        }
        let value;
        if (row.children && row.children.length && row.children[0].data) {
            value = row.children[0].data
                .replace('\\n', '')
                .replace('\\t', '')
                .replace('-', '')
                .replace(',', '');
            value = Number(value);
        }
        let level = dataObject;
        if (columnIndex !== StrikePriceIndex) {
            level = columnIndex < StrikePriceIndex ? dataObject.calls : dataObject.puts;
        }
        level[columns[columnIndex]] = value;
    });
    dataRows.shift();
    console.log(dataRows);
}).catch((err) => {
    console.log(err);
});