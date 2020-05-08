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
    res.send(db["egg"]);
});

app.listen(8000, '0.0.0.0', () => {
    console.log('Example app listening on port 8000!');
});