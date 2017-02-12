//This is test code to understand how to get and parse json API
//data from a website 

var https = require('https'); var options = {
  host: 'callook.info',
  port: 443,
  path: '/kd8psj/json',
  method: 'GET'
};

var req = https.get(options, function(res) {


    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
			try {
				var getResponse = JSON.parse(body);
				//console.log("Response body: ", getResponse);
				console.log("status: ", getResponse.status);
				console.log("current.operClass: ", getResponse.current.operClass);
				console.log("name: ", getResponse.name);
				console.log("address line 2: ", getResponse.address.line2);
				console.log("otherInfo.expiryDate: ", getResponse.otherInfo.expiryDate);
				}
			catch (e) {
					console.log('Error parsing JSON!');
				}
    });
});
req.end(); req.on('error', function(e) {
  console.error(e);
});


