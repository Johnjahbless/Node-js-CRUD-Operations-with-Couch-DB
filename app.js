const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const urlencoded = require('url');
const bodyParser = require('body-parser');
const json = require('json');
const logger = require('logger');
const methodOverride = require('method-override');

const nano = require('nano')('http://localhost:5948');

const db = nano.use('address');
const app = express();


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));





app.get('/', routes.index);

app.post('/createdb', (req, res) => {
    nano.db.create(req.body.dbname, (err) => {
        if(err){
            res.send('Error creating database' + req.body.dbname);
            return;
        }
        res.send('Database' + req.body.dbname + 'created successfully');
    });
});



app.post('/new_contact', (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;


    db.insert({
        name:name,
        phone:phone,
        crazy:true
    }, phone, (err, body, header) => {
        if (err) {
            res.send('Error creating contact')
            return;
        }
        res.send('Contact created successfully')
    });
});



app.post('view_contact', (req, res) => {
    let alldoc = 'Following are the contacts'

    db.get(req.body.phone, {revs_info:true}, (err, body) => {
        if (!err) {
            console.log(body);
        }

        if (body) {
            alldoc += "Name: "+body.name+"<br/>Phone Number: "+body.phone;
        }else{
            alldoc = "No records found"
        }
        res.send(alldoc)
    });

});


app.post('/delete_contact', (req, res) => {
    db.get(req.body.phone, {revs_info:true}, (err, body) => {
        if (!err) {
            db.destroy(req.body.phone, body._rev, (err, body) => {
                if (err) {
                    res.send("Error deleting contact")
                }
            });
            res.send("Contacts deleted successfully");
        }
    });
});

http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port' + app.get('port'));
});