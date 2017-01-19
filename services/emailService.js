var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
    accessKeyId: process.env.AWS_SES_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_KEY
}));

function EmailService(){
}

// Email sent after creating account to verify they gave us a valid email
EmailService.prototype.sendEmailConfirmationLink = function(user, callback){
  transporter.sendMail({
      from: process.env.NOTIFICATION_EMAIL_ADDRESS,
      to: user.email,
      subject: 'Email Verification',
      text: 'Please verify your email by visiting this link: ' + process.env.BASE_URL + '/verify_email/' + user.verificationToken
  }, function(err, info){

    callback(err);
  });
}

// Email sent when they want to reset their password
EmailService.prototype.sendPasswordReset = function(user, callback){
  transporter.sendMail({
      from: process.env.NOTIFICATION_EMAIL_ADDRESS,
      to: user.email,
      subject: 'Password Reset',
      text: 'Please reset your account password by visiting this link: ' + process.env.BASE_URL + '/reset_password/' + user.passwordToken
  }, function(err, info){

    callback(err);
  });
}

module.exports = EmailService;