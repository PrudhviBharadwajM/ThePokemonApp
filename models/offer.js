const mangooose = require('mongoose');
const Schema = mangooose.Schema;

const offerSchema = new Schema({
    pokemonName: { type: String, required: [true, 'Name of the offered Pokemon cannot be empty.'] },
    pokemonDescription: { type: String, required: [true, 'Pokemon offer Description cannot be empty.'] },
    offeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Offered By cannot be empty.'] },
    status: { type: String, required: [true, 'Status cannot be empty.'] },
    });

module.exports = mangooose.model('Offer', offerSchema);