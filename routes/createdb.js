const nano = require("nano")

exports.create = (req, res) => {
    nano.db.create(req.body.dbname,() => {
        if (err) {
            res.send('Error creating database' + err)
            return;
        }
        res.send("Database created successfully");
    })
}