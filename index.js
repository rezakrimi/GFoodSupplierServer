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

// GOOGLE_APPLICATION_CREDENTIALS are expected by a dependency of this code
// and not this code itself. Checking for existence here but not retaining (as not needed)
console.log(projectId)
if (!projectId) {
    throw Error('Unable to proceed without a Project ID');
}

const provider = new NodeTracerProvider();

// Initialize the exporter
const te = new TraceExporter({ projectId: projectId });

// Configure the span processor to send spans to the exporter
provider.addSpanProcessor(new SimpleSpanProcessor(te));
provider.register();
opentelemetry.trace.setGlobalTracerProvider(provider);
const tracer = opentelemetry.trace.getTracer('basic');

const me = new MetricExporter({ projectId: projectId });

// Register the exporter
const meter = new MeterProvider({
    exporter: me,
    interval: 6000,
}).getMeter('example-prometheus');


// creating metrics
const request_count = meter.createCounter('counting_requests', {
    monotonic: true,
    labelKeys: ['pid'],
    description: 'Counts number of requests',
});

const error_count = meter.createCounter('error_count', {
    monotonic: true,
    labelKeys: ['pid'],
    description: 'Counts the number of errors',
});

const latencyObserver = meter.createObserver('latency', {
    monotonic: false,
    labelKeys: ['pid'],
    description: 'Example of a observer',
});

const latency = new MetricObservable();

latencyObserver.setCallback((observerResult) => {
    observerResult.observe(latency, { pid: process.pid.toString() });
});

const db = {
    "yeast": ["vendorA", "vendorB"],
    "flour": ["vendorC", "vendorD"],
    "butter": ["vendorB"],
    "egg": ["vendorA", "vendorB", "vendorC", "vendorD"],
    "milk": ["vendorA", "vendorC", "vendorD"],
    "sugar": ["vendorB", "vendorD"]
};

const labels = { pid: process.pid.toString() };

app.get('/', (req, res) => {
    request_count.bind(labels).add(1);
    error_count.bind(labels).add(3000);
    
    // setting up span for tracer
    const span = tracer.startSpan('query latency');
    // Set attributes to the span.
    span.setAttribute('key', 'value');
    // Annotate our span to capture metadata about our operation
    span.addEvent('invoking work');

    if (req.query.ingredient === "yeast") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(2000);
        }), 2000);
    }
    else if (req.query.ingredient === "flour") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(3000);
        }), 3000);
    }
    else if (req.query.ingredient === "butter") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(1000);
        }), 1000);
    }
    else if (req.query.ingredient === "egg") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(5000);
        }), 5000);
    }
    else if (req.query.ingredient === "milk") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(1500);
        }), 1500);
    }
    else if (req.query.ingredient === "sugar") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(2500);
        }), 2500);
    }
    else {
        setTimeout((function () {
            res.status(400);
            res.send(db[req.query.ingredient]);
            span.end();
            latency.next(7000);
        }), 7000);
    }
});

app.listen(8000, () => {
    console.log('Supplier app listening on port 8000!');
});
