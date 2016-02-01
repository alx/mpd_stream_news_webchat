var fs = require("fs");
var path = require("path");

var youtubeDl = (function () {

  var downloadPath = 'public/youtube/';

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

  var downloadFromYoutube = function(query) {
    var proc = spawn('youtube-dl'
      , ['-t', '--cookies=cookies.txt', query.url],
      {
        cwd : downloadPath
      }
    );

    downloading = true;

    proc.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      status = {
        file : query,
        message : data.toString()
      };
    });

    proc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    proc.on('exit', function (code) {

      downloading = false;

      if (queue.length) {
        downloadFile(queue.shift());
      }
    });
  };

}());

var chatLog = (function () {

  var filepath = path.resolve(__dirname, '../public/chatlog.json');

  var init = function() {
    try {
      fs.accessSync(filepath, fs.F_OK);
      var log = getLogs();
      if( Object.prototype.toString.call( log ) !== '[object Array]' ) {
        fs.writeFile(filepath, "[]");
      }
    } catch (e) {
      fs.writeFile(filepath, "[]");
    }
  }

  var saveMessage = function(message) {
    var log = getLogs();
    fs.writeFile(filepath, JSON.stringify(log.concat(message)));
  };

  var getLogs = function() {
    var file = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(file);
  };

  return {
    init: init,
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
  chatLog.init();

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
    chatLog.saveMessage(message);
    socket.broadcast.emit('send:message', message);
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
