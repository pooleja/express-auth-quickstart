var mongoose = require("mongoose");
var Promise = require("bluebird");
var User = require("../models/user");
var should = require('should');

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/test_quickstart'); 

describe('User', function() {

    // Create a fresh user object
    var currentUser = null;  
    before(function(done) {    

        User.register(new User({ email : "james@test.com" }), "James9887&&", function(err, user) {
            should.not.exist(err);
            currentUser = user;
            done();
        });
    });    

    // Clean up the all users
    after(function(done) {    
        //delete all the customer records    
        User.remove({}, function() {      
        done();    
        });  
    });  

    // Validate the defaults when a new user is created
    describe('Defaults', function(){
        it('should have valid email', function(done){
            currentUser.should.have.property('email', 'james@test.com');            
            done();
        });
        it('should have hashed password', function(done){
            currentUser.should.not.have.property('password', 'James9887&&');            
            done();
        });
        it('should not be verfied by default', function(done){
            currentUser.should.have.property('verified', false);            
            done();
        });
        it('should have a default token', function(done){
            currentUser.emailVerificationToken.should.exist;
            done();
        });
    });

    // Validate the token verification works
    describe('Verification', function(){
        it('should not validate unknown user', function(done){
            User.verifyToken("not_valid_token", function(err){
                should.exist(err);
                done();
            });            
        });

        it('should validate default user', function(done){
            User.verifyToken(currentUser.emailVerificationToken, function(err){
                should.not.exist(err);
                User.findOne({email: currentUser.email}, function(error, user){
                    user.emailVerificationToken.should.equal(currentUser.emailVerificationToken);
                    user.verified.should.equal(true);
                    done();
                });
            });            
        });
    });



});