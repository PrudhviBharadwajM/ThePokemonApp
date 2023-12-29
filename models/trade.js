const mongoose = require('mongoose');
const schema = mongoose.Schema;

const pokemonSchema = new schema({
  pokemon: { type: String, required: [true, 'Name of the pokemon is required.'] },
  category: { type: String, required: [true, 'Category of the pokemon is required.'] },
  author: {type: schema.Types.ObjectId, ref:'User'},
  content: { type: String, required: [true, 'Information about the pokemon is required.'], minLength: [10, 'Description about the pokemon must be at least 10 characters long.'] },
  image: { type: String },
  // new fields
  status: { type: String, required:[true, 'status is required.'], enum: ['Available', 'Offer pending', 'Traded'], default: '' },
  offerName: { type: String },
  offered: { type: Boolean, default: false },
  watchlist: {type: Boolean, default: false}
},
  { timestamps: true }
);

// Collection name will be 'pokemons' in database.
const Pokemon = mongoose.model('Pokemon', pokemonSchema);

let pokemon = new Pokemon({
  pokemon: 'Pikachu',
  category: 'Regular',
  content: 'It is a rodent pokemon and is yellow.',
  status: 'Available',
});

pokemon.validate().then(() => {console.log('validated successfully')}).catch((err) => {console.log(err)});

module.exports = mongoose.model('Pokemon', pokemonSchema);

