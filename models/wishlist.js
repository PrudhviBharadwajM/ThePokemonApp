const mangooose = require('mongoose');
const Schema = mangooose.Schema;

const wishlistSchema = new Schema({
    pokemonName: { type: String, required: [true, 'Name of the Pokemon to be wishlisted cannot be empty.'] },
    pokemonType: { type: String, required: [true, 'Type of the Pokemon to be wishlisted cannot be empty.'] },
    pokemonDescription: { type: String, required: [true, 'Pokemon Description cannot be empty.'] },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Saved By cannot be empty.'] },
    status: { type: String, required: [true, 'Status cannot be empty.'] },
    });

module.exports = mangooose.model('Wishlist', wishlistSchema);