var express = require('express');
var router = express.Router();
require('dotenv').config()
var fs = require('fs');
const nodemailer = require("nodemailer");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/form', async function(req, res, next) {
  console.log(req.body);
  let type = '';
  if((req.body.file).includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')){
    type = 'docx'
  }else if((req.body.file).includes('application/pdf')){
    type = 'pdf'
  }else if((req.body.file).includes('application/msword')){
    type = 'doc'
  }else{
    return res.json({msg:'Error with your CV file, please choose another file.'})
  }
  // fileName = createDate(req.body.firstName);
  let base64file = req.body.file.split(';base64,').pop();
  fs.writeFile(`${req.body.firstName}.${type}`, base64file, {encoding: 'base64'}, function(err) {
    console.log('File created');
});
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    auth: {
      user: process.env.email,
      pass: process.env.password
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
  let mailOption = {
    from:'sales3@daganm.co.il',
    to:'gshachargilad@gmail.com',
    subject:`קורות חיים חדשים - ${req.body.firstName}-${req.body.lastName}`,
    html:`שם פרטי: ${req.body.firstName}
    <br>
    שם משפחה: ${req.body.lastName}
    <br>
    טלפון: ${req.body.phone}
    <br>
    
    `,
    attachments:[{path:`${req.body.firstName}.${type}`}]
  }

  transporter.sendMail(mailOption,function(err,data){
    if(err){
      console.log("error: "+err);
      res.send(500);
    }else{
      console.log("Email sent");
      try {
        fs.unlinkSync(`${req.body.firstName}.${type}`);
      } catch(err) {
        console.error(err);
      }
      return res.json({go:'/'});
    }

  });

});

module.exports = router;
