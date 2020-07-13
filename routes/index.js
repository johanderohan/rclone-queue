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

/* GET home page. */
router.get('/', function(req, res, next) {
  rcloneStart();
  res.render('index', { title: 'Express' });
});

router.post('/api/save', function(req, res) {
    req.body.uploaded = false;
        
    db.insert(req.body, function (err, newDoc) {   
      res.send(newDoc);
    });

});

function rcloneStart(file) {
  
  var origin, destino;
  
  origin = file.file_dir+'/'+file.file_name;
  destino = file.remote+':'+file.upload_dir+'/'+file.file_name;
  if(parseInt(file.is_directory)) destino = file.remote+':'+file.upload_dir+'/';

  var rclone = spawn('rclone', ['-P', 'copy', origin , destino,'--ignore-existing']);
  
  rclone.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  rclone.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  rclone.on('exit', function (code) {
    //console.log('child process exited with code ' + code.toString());
    file.uploaded = true;
    db.update({ _id: file._id }, file, {}, function (err, file) {
      pushNotification(file);
      UPLOAD_IN_PROGRES = false;
    });
  });
}

function pushNotification(file) {
  var msg = {
    message: file.file_name,	// required
    title: 'File uploaded to GDrive',
  }
  
  p.send( msg, function( err, result ) {
    if ( err ) {throw err}
  });
}

cron.schedule('*/30 * * * * *', () => {
  if(!UPLOAD_IN_PROGRES){
      console.log('CRON');
      db.findOne({ uploaded: false }, function (err, file) {
        if(file) {
          UPLOAD_IN_PROGRES = true;
          rcloneStart(file);
        }
      });
  }

});

module.exports = router;
