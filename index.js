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

const me = new MetricExporter({ projectId: projectId });

// Register the exporter
const meter = new MeterProvider({
    exporter: me,
    interval: 6000,
}).getMeter('example-prometheus');



const counter = meter.createCounter('counting_requests', {
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
    labelKeys: ['pid', 'core'],
    description: 'Example of a observer',
});

const latency = new MetricObservable();
let measured_latency = 0;

function latency_reporter(){
    return measured_latency;
}

latencyObserver.setCallback((observerResult) => {
    observerResult.observe(latency_reporter, { pid: process.pid.toString(), core: '1' });
    observerResult.observe(latency, { pid: process.pid.toString(), core: '2' });
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
    counter.bind(labels).add(6000);
    error_count.bind(labels).add(3000);
    opentelemetry.trace.setGlobalTracerProvider(provider);
    const tracer = opentelemetry.trace.getTracer('basic');
    const span = tracer.startSpan('foo');

    // Set attributes to the span.
    span.setAttribute('key', 'value');

    // Annotate our span to capture metadata about our operation
    span.addEvent('invoking work');

    if (req.query.ingredient === "yeast") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            span.end();
            measured_latency = 2000;
            latency.next(latency_reporter());
        }), 2000);
    }
    else if (req.query.ingredient === "flour") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            measured_latency = 3000;
            latency.next(latency_reporter());
        }), 3000);
    }
    else if (req.query.ingredient === "butter") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            measured_latency = 1000;
            latency.next(latency_reporter());
        }), 1000);
    }
    else if (req.query.ingredient === "egg") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            measured_latency = 5000;
            latency.next(latency_reporter());
        }), 5000);
    }
    else if (req.query.ingredient === "milk") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            measured_latency = 1500;
            latency.next(latency_reporter());
        }), 1500);
    }
    else if (req.query.ingredient === "sugar") {
        setTimeout((function () {
            res.send(db[req.query.ingredient]);
            measured_latency = 2500;
            latency.next(latency_reporter());
        }), 2500);
    }
    else {
        setTimeout((function () {
            res.status(400);
            res.send(db[req.query.ingredient]);
            measured_latency = 7000;
            latency.next(latency_reporter());
        }), 7000);
    }
});

app.listen(8000, () => {
    console.log('Supplier app listening on port 8000!');
});
