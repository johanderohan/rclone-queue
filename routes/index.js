var express = require('express');
var fs = require('fs');
var cron = require('node-cron');
var Push = require( 'pushover-notifications' )
var router = express.Router();
var spawn = require('child_process').spawn;

var dir = __dirname + '/../data';

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'data/database.db', autoload: true });
  
  
var p = new Push( {
  user: process.env['PUSHOVER_USER'],
  token: process.env['PUSHOVER_TOKEN'],
})

var UPLOAD_IN_PROGRES = false;
var CURRENT_UPLOAD = {file_name:''};

/* GET home page. */
router.get('/', function(req, res, next) {
	db.find({ uploaded: true }).sort({ date: -1 }).exec(function (err, files_uploaded) {
		db.find({ uploaded: false }, function (err, files_queue) {
  			res.render('index', { title: 'Rclone Status', uploaded: files_uploaded, current: CURRENT_UPLOAD, queue: files_queue });
		});
	});
});

router.post('/api/save', function(req, res) {
    req.body.uploaded = false;
    req.body.date = new Date();
    db.insert(req.body, function (err, newDoc) {   
      res.send(newDoc);
    });

});

function rcloneStart(file) {
  
  CURRENT_UPLOAD = file;
  file.uploaded = true;
  var origin, destino;
  
  origin = file.file_dir+'/'+file.file_name;
  destino = file.remote+':'+file.upload_dir+'/';
  if(parseInt(file.is_directory)) destino = file.remote+':'+file.upload_dir+'/'+file.file_name;

  var rclone = spawn('rclone', ['-P', 'copy', origin , destino,'--ignore-existing']);
  
  rclone.stdout.on('data', function (data) {
    var contains = data.toString().indexOf('Transferred');
    if(contains !== -1 ) {
      var substring = data.toString().substring(data.toString().lastIndexOf("Transferred") + 1, data.toString().lastIndexOf("100%"));
      var substring_01 = data.toString().substring(substring.lastIndexOf(":") + 1, substring.lastIndexOf("/"));
      var substring_02 = data.toString().substring(substring.lastIndexOf("/") + 1, substring.lastIndexOf(","));
      console.log('stdout: ' + data.toString());
      console.log('substring: ' + substring);
      if(substring_01) console.log('substring_01: ' + substring_01);
      if(substring_02) console.log('substring_02: ' + substring_02);
    }
  });

  rclone.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
    file.uploaded = false;
  });

  rclone.on('exit', function (code) {
    //console.log('child process exited with code ' + code.toString());
    db.update({ _id: file._id }, file, {}, function (err, fileUp) {
      pushNotification(file);
      UPLOAD_IN_PROGRES = false;
      CURRENT_UPLOAD = {file_name:''};
    });
  });
}

function pushNotification(file) {
  var msg = {
    message: 'File: '+file.file_name,	// required
    title: 'File uploaded to GDrive',
  }
  
  p.send( msg, function( err, result ) {
    if ( err ) {throw err}
  });
}

cron.schedule('*/30 * * * * *', () => {
  if(!UPLOAD_IN_PROGRES){
      //console.log('CRON');
      db.findOne({ uploaded: false }, function (err, file) {
        if(file) {
          UPLOAD_IN_PROGRES = true;
          rcloneStart(file);
        }
      });
  }

});

module.exports = router;
