var express = require('express');
var spawn   = require('child_process').spawn;

var SECRET = process.env.API_SECRET || "test";

var port = process.env.PORT || 80;

var status = {
  connected: false,
  server_info: "unknown",
  ip: "unknown"
};

var vpn;
var launchVpn = function(){
  status.connected    = false;
  status.server_info  = "unknown";
  status.ip           = "unknown";
  status.last_connect = new Date();

  vpn = spawn(__dirname + '/vpn.sh');

  var nserverinfo = false;
  vpn.stdout.on('data', function(chunk){
    var data = chunk.toString('utf8');
    var lines = data.split("\n");

    lines.forEach(function(line){
      var str = line;
      var idx = str.indexOf("Connecting to:");
      if(idx > -1)
        nserverinfo = true;
      else
      {
        if(nserverinfo)
        {
          status.server_info = line.replace("\t", ", ");
          console.log("Server info: "+status.server_info);
        }
        nserverinfo = false;
      }

      if(str.indexOf("You are now connected to HMA") > -1)
      {
        console.log("Connected to the VPN.");
        status.connected = true;
      }

      if(status.server_info !== "unknown" && str.indexOf("Your IP is") > -1)
      {
        status.last_ip = status.ip;
        status.ip      = str.substring(11, str.length-1);
        if(status.last_ip === "unknown")
          status.last_ip = status.ip;

        console.log("Current IP is: "+status.ip);
      }

      console.log(str);
    });
  });

  vpn.stderr.on('data', function(chunk){
    var str = chunk.toString('utf8');
    console.log(chunk.toString('utf8'));
  });

  vpn.on('exit', function(){
    console.log("vpn exited");
    launchVpn();
  });
};

var restartVpn = function(){
  status.connected = false;
  kill = spawn(__dirname + '/killvpn.sh');
  kill.on('exit', function(){
    console.log("kill vpn exited");
    launchVpn();
  });
};

var app = express();

app.get('/:secret?', function(req, res){
  if(req.params.secret !== SECRET)
  {
    res.status(403);
    res.json({error: "Invalid secret."});
  }else
    res.json(status);
});

app.post('/:secret?', function(req, res){
  if(req.params.secret !== SECRET)
  {
    res.status(403);
    res.json({error: "Invalid secret."});
  }else if(!status.connected)
  {
    res.status(200);
    res.json({status: "connecting"});
  }
  else{
    res.status(200);
    console.log("=== restarting vpn due to request ===");
    restartVpn();
    res.json({status: "restarted"});
  }
});

console.log("starting api on port "+port);
app.listen(port);

launchVpn();
