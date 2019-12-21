const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const optionDetails = {
    oi: Number,
    chngInOi: Number,
    volume: Number,
    iv: Number,
    ltp: Number,
    netChng: Number,
    bid: Number,
    ask: Number
};
const schema = new Schema({
    strikePrice: Number,
    calls: optionDetails,
    puts: optionDetails,
}, { timestamps: true });
module.exports = schema;