var fs = require("fs");
var path = require("path");
var spawn = require('child_process').spawn;
var komponist = require('komponist');

var mpdClient = komponist.createConnection(6618, 'swyn.fr', function() {
  mpdClient.command('password', 'simplepass2323');
});

var youtubeDl = (function () {

  var downloadPath = path.resolve(__dirname, '../public/download/');

  var testUrl = function(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }

  var getFileDetails = function(request, callback) {
    var buffer = [];

    var proc = spawn('youtube-dl'
      , ['--get-title', '--get-url', '--get-description', '--get-thumbnail', query.url]
    );

    proc.stdout.on('data', function (data) {
      buffer.push(data.toString());
    });

    proc.on('exit', function (code) {
      var data = buffer.join('\n').split('\n');

      query.title = data[0];
      query.downloadUrl = data[1];
      query.thumbnail = data[2];
      query.description = data[3];

      callback(query);
    });
  };

  var download = function(url) {

    var proc = spawn('youtube-dl',
      ['--no-playlist',
      '--restrict-filenames',
      '--no-overwrites',
      '--write-thumbnail',
      '--extract-audio',
      '--audio-format',
      'mp3',
      '--embed-thumbnail',
      url],
      {
        cwd : downloadPath
      }
    );

    downloadData = "";
    errorData = "";
    destination = "";

    proc.stdout.on('data', function (data) {
      data = data.toString();
      downloadData += data;
      if(data.indexOf("Destination:") != -1) {
        destination = data.split('Destination: ').pop();
      }
      console.log('stdout: ' + data);
    });

    proc.stderr.on('data', function (data) {
      data = data.toString();
      errorData += data;
      console.log('stderr: ' + data);
    });

    proc.on('exit', function (code) {
      if(errorData.length == 0) {
        console.log(path.resolve(downloadPath, destination))
        mpdClient.add(path.resolve(downloadPath, destination));
      }
    });
  };

  return {
    testUrl: testUrl,
    download: download
  };

}());

var chatLog = (function () {

  var filepath = path.resolve(__dirname, '../public/chatlog.json');

  var saveMessage = function(message) {
    var log = getLogs();
    fs.writeFile(filepath, JSON.stringify(log.concat(message)));
  };

  var getLogs = function() {
    var file = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(file);
  };

  return {
    saveMessage: saveMessage,
    getLogs: getLogs
  };

}());

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'noname ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

// export function for listening to the socket
module.exports = function (socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get(),
    messages: chatLog.getLogs()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    var message = {
      user: name,
      text: data.text,
      timestamp: data.timestamp
    };
    if(!userNames.claim(message.user) &&
       message.text.length > 0 &&
       message.timestamp > 0) {
      if(youtubeDl.testUrl(message.text)) {
        youtubeDl.download(message.text);
        message.text = message.user + " a rajouté la piste: <a href='" + message.text + "'>" + message.text + "</a>";
        message.user = "BIBOT";
      }
      socket.broadcast.emit('send:message', message);
      chatLog.saveMessage(message);
    }
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
};
