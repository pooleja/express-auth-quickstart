const uuidV4 = require('uuid/v4');
var validator = require('validator');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var owasp = require('owasp-password-strength-test');
owasp.config({
  allowPassphrases       : false,
  maxLength              : 128,
  minLength              : 8,
  minOptionalTestsToPass : 3,
});

var UserSchema = new Schema({
    email: {type: String, required: true, validate: [ validator.isEmail, 'Invalid Email Address' ]},
    password: String,
    emailVerificationToken: {type: String, default: uuidV4},
    verified: {type: Boolean, default: false},
    passwordResetToken: {type: String, default: ""}
});


// Find a user token and set the account as verified
UserSchema.statics.verifyToken = function(emailVerificationToken, callback) {
    this.findOne({emailVerificationToken: emailVerificationToken}, function(error, user) {
        if (error) {
            return callback(error);
        }

        if(!user) {
            return callback("Verification Token not found");
        }

        user.verified = true;
        user.save(function(error) {
            if (error){
                return callback(error);
            }

            // Success
            callback(null);
        });
    });
}

// Find a user token and set the account as verified
UserSchema.statics.resetPassword = function(passwordResetToken, password, callback) {

    this.findOne({passwordResetToken: passwordResetToken}, function(error, user) {
        if (error) {
            return callback(error);
        }

        if(!user) {
            return callback("Verification Token not found");
        }

        user.passwordResetToken = "";
        user.password = password;
        user.save(function(error) {

            if (error) {
                return callback(error);
            }

            // Success
            callback(null);
        });
    });
}

// Validate password complexity
function validatePassword(password, callback){
    var result = owasp.test(password);

    // If there are errors, return the first one
    if(result.errors.length != 0){
        return callback(result.errors);
    }

    // Success
    callback(null);
}

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email', passwordValidator: validatePassword});

module.exports = mongoose.model('User', UserSchema);