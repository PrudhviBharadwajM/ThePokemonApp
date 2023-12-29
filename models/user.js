const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'firstName is required']},
    lastName: {type: String, required: [true, 'lastName is required']},
    email: {type: String, required: [true, 'Email is required'], unique: [true, 'this email address has been used'] },
    password: {type: String, required: [true, 'Password is required']},
},
{timestamps: true}
);

//replace plain text password with hashed password.
userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return  next();
    bcrypt.hash(user.password, 10).then(hash=>{
        user.password = hash;
        next();
    }).catch(err=>next(err));
});

// implement a method to compare plain text password with hashed password
userSchema.methods.comparePassword = function(loginPassword){
    return bcrypt.compare(loginPassword, this.password);
};

//collection name is users in the database
module.exports = mongoose.model('User', userSchema);