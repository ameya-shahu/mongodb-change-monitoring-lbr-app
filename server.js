const { MongoClient } = require("mongodb");
var http = require('http'),
fs = require('fs'),
index = fs.readFileSync(__dirname + '/index.html');


var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

var io = require('socket.io')(app);

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb://localhost/lbr-web-app?replicaSet=rs0";
const client = new MongoClient(uri);

client.connect()
.then(()=>{
    const database = client.db("lbr-web-app");
    //const collection = database.collection("haikus");
    // open a Change Stream on the "haikus" collection
    changeStream = database.watch();
    // set up a listener when change events are emitted
    changeStream.on("change", data => {
      // process any change event
      console.log("received a change to the collection: \t", data);
      const {operationType} = data;
      const collection = data.ns.coll;

      if(operationType == 'insert' && collection == 'users'){
          io.emit('userInsert', data.fullDocument)
      }
      if(operationType == 'insert' && collection == 'roundwisedatas'){
          io.emit('dataInsert',data.fullDocument)
      }
    });
})




const PORT = process.env.PORT || 1234;
app.listen(PORT, ()=>{
    console.log(`Backend server is running on port no ${PORT}`)
});