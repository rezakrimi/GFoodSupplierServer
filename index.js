const express = require('express');
const app = express();

const db = {
    "yeast": ["vendorA", "vendorB"],
    "flour": ["vendorC", "vendorD"],
    "butter": ["vendorB"],
    "egg": ["vendorA", "vendorB", "vendorC", "vendorD"],
    "milk": ["vendorA", "vendorC", "vendorD"],
    "sugar": ["vendorB", "vendorD"]
};

app.get('/', (req, res) => {
    if (req.query.ingredient === "yeast"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 2000);
    }
    else if (req.query.ingredient === "flour"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 3000);
    }
    else if (req.query.ingredient === "butter"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 1000);
    }
    else if (req.query.ingredient === "egg"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 5000);
    }
    else if (req.query.ingredient === "milk"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 1500);
    }
    else if (req.query.ingredient === "sugar"){
        setTimeout((function() {res.send(db[req.query.ingredient]);}), 2500);
    }
    else {
        setTimeout((function() {res.status(400);
            res.send({message:"invalid ingredient"})}), 7000);
    }
});

app.listen(8000, '0.0.0.0', () => {
    console.log('Example app listening on port 8000!');
});