const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://epi-go-data:formless_bisexual_declaim_frown_doings_handmade@epi-godata-0-ut0sh.gcp.mongodb.net";
// const client = new MongoClient(uri, { useNewUrlParser: true });
MongoClient.connect(uri).then(client => {
  client.connect((err, res) => {
    const collection = client.db("test").collection("devices");
    // console.dir(collection);
    console.log("WORKED");
    if (err) {
      console.dir(err.db("epi-godata"));
    } else {
      console.dir(res.db("epi-godata"));
    }
    
    client.close();
  });
});
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.dir(collection);
//   console.log("WORKED");
//   client.close();
// });