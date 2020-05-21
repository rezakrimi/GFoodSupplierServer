const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
const { globalStats, MeasureUnit, AggregationType } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');
const { MeterProvider, MetricObservable } = require('@opentelemetry/metrics');
const { MetricExporter } = require('@google-cloud/opentelemetry-cloud-monitoring-exporter');
const express = require('express');
const app = express();
const cors = require('cors');
//remove for production
app.use(cors());
app.options('*', cors());

const projectId = 'opentel-rezakarimi-starter';

const exporter = new MetricExporter({projectId: projectId});


// const provider = new BasicTracerProvider();
// provider.addSpanProcessor(new SimpleSpanProcessor(tracer_exporter));
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// provider.register();

const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
const meter = new MeterProvider({
  exporter,
  interval: 60000,
}).getMeter('example-prometheus');

// Monotonic counters can only be increased.
const requestCount = meter.createCounter('request_count', {
  monotonic: true,
  labelKeys: ['pid'],
  description: 'Counts the number of requests',
});

// Monotonic counters can only be increased.
const errorCount = meter.createCounter('Errors', {
  monotonic: true,
  labelKeys: ['pid'],
  description: 'Counts the number of errors',
});

const responseLatency = meter.createObserver("response_latency", {
  monotonic: false,
  labelKeys: ["pid"],
  description: "Records latency of response"
});




const db = {
    "yeast": ["vendorA", "vendorB"],
    "flour": ["vendorC", "vendorD"],
    "butter": ["vendorB"],
    "egg": ["vendorA", "vendorB", "vendorC", "vendorD"],
    "milk": ["vendorA", "vendorC", "vendorD"],
    "sugar": ["vendorB", "vendorD"]
};

const labels = { pid: "WHAT" };

app.get('/', (req, res) => {
    // opentelemetry.trace.setGlobalTracerProvider(provider);
    // const tracer = opentelemetry.trace.getTracer('basic');
    // const span = tracer.startSpan('foo');

    requestCount.bind(labels).add(1);
  meter.collect();

    // Set attributes to the span.
    // span.setAttribute('key', 'value');

    // Annotate our span to capture metadata about our operation
    // span.addEvent('invoking work');

    if (req.query.ingredient === "yeast") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            // span.end();
        }), 2000);
    }
    else if (req.query.ingredient === "flour") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
        }), 3000);
    }
    else if (req.query.ingredient === "butter") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
        }), 1000);
    }
    else if (req.query.ingredient === "egg") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
        }), 5000);
    }
    else if (req.query.ingredient === "milk") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
        }), 1500);
    }
    else if (req.query.ingredient === "sugar") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
        }), 2500);
    }
    else {
        setTimeout((function () {
            res.status(400);
            res.send(db[req.query.ingredient]);
        }), 7000);
    }
});

app.listen(8000, () => {
    console.log('Supplier app listening on port 8000!');
});
