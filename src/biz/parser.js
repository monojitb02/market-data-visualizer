const cheerio = require('cheerio');
const { camelCase } = require('lodash');

const StrikePriceIndex = 11;
const totalColumns = (StrikePriceIndex * 2) + 1;
class Parser {
    extractOptions(html) {
        const $ = cheerio.load(html);
        const dataRows = [];
        const columns = [];
        $('.opttbldata > table tr:nth-of-type(2) th').each((i, row) => {
            columns.push(camelCase(row.children[0].data))
        });
        let dataObject = {};
        $('.opttbldata > table tr td').each((i, row) => {
            const columnIndex = i % totalColumns;
            if (columnIndex === 0) {
                dataRows.push(dataObject);
                dataObject = { calls: {}, puts: {} };
            }
            if (columns[columnIndex] === 'chart') {
                return;
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
            if (columnIndex === StrikePriceIndex) {
                value = Number(row.children[0].children[0].children[0].data);
            } else {
                level = columnIndex < StrikePriceIndex ? dataObject.calls : dataObject.puts;
            }
            level[columns[columnIndex]] = value;
        });
        dataRows.shift();
        return dataRows;
    }
}
module.exports = new Parser();