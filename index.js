const {globalStats, MeasureUnit, AggregationType} = require ('@opencensus/core');
const {StackdriverStatsExporter} = require('@opencensus/exporter-stackdriver');
const express = require('express');
const app = express();

const EXPORT_INTERVAL = 20;
const LATENCY_MS = globalStats.createMeasureInt64(
    'stack-doctor-metric',
    MeasureUnit.MS,
    'custom metric for Stack Doctor'
);

//create and register the view
const lastValueView = globalStats.createView(
    'stack_doctor_metric',
    LATENCY_MS,
    AggregationType.LAST_VALUE,
    [],
    'randomly generated value for stack doctor demo'
);
globalStats.registerView(lastValueView);

const exporter = new StackdriverStatsExporter({
    projectId: 'opentel-rezakarimi-starter',
    peroid: EXPORT_INTERVAL * 1000,
});

globalStats.registerExporter(exporter);


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
        globalStats.record([
            {
                measure: LATENCY_MS,
                value: 2000,
            },
        ]);
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
    console.log('Supplier app listening on port 8000!');
});