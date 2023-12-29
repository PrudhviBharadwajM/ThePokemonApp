const model = require('../models/trade');
const offerModel = require('../models/offer');
const wishlistModel = require('../models/wishlist');
const fs = require('fs');
const multer = require('multer');

exports.index = (req, res, next) => {
    model.find().then(trades =>res.render('../views/trades/index.ejs', { trades }))
    .catch(err => next(err));
};

exports.new = (req, res) => {
    const values = [
        { value: 'Regular', label: 'Regular' },
        { value: 'Legendary', label: 'Legendary' },
      ];
    const status = [
        { value: 'Available', label: 'Available' },
        { value: 'Offer pending', label: 'Offer pending' },
        { value: 'Traded', label: 'Traded' },
    ];
    res.render('../views/trades/new.ejs', {values, status});
};

exports.create = (req, res, next) => {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        let fileName = "newfile";
        cb(null, fileName);
      }
    });
  
    const upload = multer({ storage }).single('image');
  
    upload(req, res, (err) => {
      if (err) {
        next(err);
      } else {
        let newPokemon = new model(req.body);
        newPokemon.author = req.session.user;
        newPokemon.offered = false;
        newPokemon.watchlist = false;
        newPokemon.offerName = '';
        const image = fs.readFileSync('./uploads/newfile');
        newPokemon.image = 'data:image/png;base64,' + image.toString('base64');
        fs.unlinkSync('./uploads/newfile');
        newPokemon.save()
          .then(pokemon => res.redirect('/trades'))
          .catch(err => {
            if (err.name === 'ValidationError') {
              err.status = 400;
            }
            next(err);
          });
      }
    });
  };

exports.show = (req, res, next)=>{
    let id = req.params.id;
    model.findById(id).then(poke => {
        if(poke) {
            return res.render('../views/trades/show.ejs', {poke});
        } else {
            let err = new Error('Cannot find a pokemon with id ' + id);
            err.status = 404;
            next(err);
        }
    }).catch(err => next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    model.findById(id).populate('author', 'firstName lastName')
    .then(pokemon => {
        if(pokemon) {
            const values = [
                { value: 'Regular', label: 'Regular' },
                { value: 'Legendary', label: 'Legendary' },
              ];
            return res.render('../views/trades/edit.ejs', {pokemon, values});
        }
    }).catch(err => next(err));
};

exports.update = (req, res, next)=>{
    let pokemon = req.body;
    let id = req.params.id;

    model.findByIdAndUpdate(id, pokemon, {useFindAndModify:false, runValidators:true}).then(result =>{
            res.redirect('/trades/'+id);
    }).catch(err =>{
        if(err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err);
    });
   
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify:false}).then(result =>{
            res.redirect('/trades');
    }).catch(err => next(err));
};

// trading controller functions

exports.createtrade = (req, res, next) => {
  let user = req.session.user;
  let id = req.params.id;
  model.findByIdAndUpdate(id, 
    {status: 'Offer pending', offered: true},
    {useFindAndModify:false, runValidators:true}).then(result =>{
      let newOffer = new offerModel({
        pokemonName: result.pokemon,
        pokemonDescription: result.content,
        offeredBy: user,
        status: 'Offer pending',
      });
      newOffer.save().then(offer => {
        model.find({author: user}).then(pokemons => {
          res.render('../views/trades/traderpage.ejs', {pokemons});
        }).catch(err => next(err));
      }).catch(err => next(err));
  }).catch(err => next(err));
};

exports.tradepokemon = (req, res, next) => {
  let user = req.session.user;
  let id = req.params.id;
  Promise.all([
    model.findByIdAndUpdate(id,
      {status: 'Offer pending'},{useFindAndModify:false, runValidators:true}),
      offerModel.findOne({offeredBy:user}).sort({_id:-1})
  ]).then((results)=>{
    const [pokemon, offered] = results;
    let pokemonName = offered.pokemonName;
    model.findByIdAndUpdate(id, {offerName: pokemonName}, {useFindAndModify:false, runValidators:true}).then(result =>{
      req.flash('success', 'Offer sent successfully');
      res.redirect('/users/profile');
    }).catch(err => next(err));
  }).catch(err => next(err));
};

exports.managepokemon = (req, res, next) => {
  let id = req.params.id;
  let user = req.session.user;
  model.findById(id).then(results => {
    if(results.offerName === ''){
      let name = results.pokemon;
      model.findOne({offerName: name}).then(poke => {
        res.render('../views/trades/managetrade.ejs', {poke}); 
      }).catch(err => next(err));
    } else {
      let name = results.offerName;
      model.findOne({offerName: name}).then(poke => {
        res.render('../views/trades/manageoffer.ejs', {poke});
      });
    }
  })
};

exports.addtowatchlist = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(id, {watchlist: true}, {useFindAndModify:false, runValidators:true}).then(result =>{
    let name = result.pokemon;
    let saveNewItem = new wishlistModel({
      pokemonName: result.pokemon,
      pokemonType: result.category,
      pokemonDescription: result.content,
      status: result.status,
    });
    saveNewItem.savedBy = req.session.user;
    wishlistModel.findOne({pokemonName: name}).then(poke => {
      if(!poke){
        saveNewItem.save().then(poke => {
          req.flash('success', 'Pokemon added to watchlist successfully');
          res.redirect('/users/profile');
        }).catch(err => {
          if(err.name === 'ValidationError') {
            err.status = 400;
          }
          next(err);
        });
      } else {
        req.flash('error', 'Pokemon already in watchlist');
        res.redirect('/trades');
      }
    }).catch(err => next(err));
  }).catch(err => next(err));
};

exports.deletesavedpokemons = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(id, {watchlist: false}, {useFindAndModify:false, runValidators:true}).then(result =>{
    let name = result.pokemon;
    wishlistModel.findOneAndDelete({pokemonName: name}, {useFindAndModify:false}).then(result =>{
      req.flash('success', 'Pokemon removed from watchlist successfully');
      res.redirect('/users/profile');
    }).catch(err => next(err));
  }).catch(err => next(err));
};

exports.deleteoffer = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(id, {offered: false, status:'Available', offerName: ''}, {useFindAndModify:false, runValidators:true}).then(result =>{
    let name = result.pokemon;
    let offerName = result.offerName;
    Promise.all([
      offerModel.findOneAndDelete({pokemonName: name}, {useFindAndModify:false}),
      model.findOneAndUpdate({pokemon: offerName}, {offered: false, status:'Available', offerName: ''})
    ]).then((results)=>{
      req.flash('success', 'Offer deleted successfully');
      res.redirect('/trades');
    }).catch(err => next(err));
  }).catch(err => next(err));
};

exports.acceptoffer = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(id, {status: 'Traded'}, {useFindAndModify:false, runValidators:true}).then(result =>{
    let name = result.offerName;
    Promise.all([
      model.findOneAndUpdate({pokemon: name}, {status: 'Traded'}, {useFindAndModify:false, runValidators:true}),
      offerModel.findOneAndDelete({pokemonName: name}, {useFindAndModify:false})
    ]).then((results)=>{
      req.flash('success', 'Offer accepted successfully');
      res.redirect('/users/profile');
    }).catch(err => next(err));
  })
};

exports.rejectoffer = (req, res, next) => {
  let id = req.params.id;
  model.findByIdAndUpdate(id, {status: 'Available', offerName: '', offered: false}, {useFindAndModify:false, runValidators:true}).then(result =>{
    let name = result.offerName;
    Promise.all([
      model.findOneAndUpdate({pokemon: name}, {status: 'Available', offerName: '', offered: false}, {useFindAndModify:false, runValidators:true}),
      offerModel.findOneAndDelete({pokemonName: name})
    ]).then((results)=>{
      const [poke, offered] = results;
      let pokemonName = poke.pokemon;
      let status = poke.status;
      if(poke.watchlist){
        wishlistModel.findOneAndUpdate({pokemonName: pokemonName}, {status: status}, {useFindAndModify:false, runValidators:true}).then(result =>{
        }).then(result =>{}).catch(err => next(err));
      }
      req.flash('success', 'You have rejected offer successfully');
      res.redirect('/users/profile');
    }).catch(err => next(err));
  }).catch(err => next(err));
};
