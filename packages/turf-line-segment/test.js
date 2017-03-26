const test = require('tape');
const fs = require('fs');
const path = require('path');
const load = require('load-json-file');
const write = require('write-json-file');
const featureEach = require('@turf/meta').featureEach;
const featureCollection = require('@turf/helpers').featureCollection;
const lineSegment = require('./');

const directories = {
    in: path.join(__dirname, 'test', 'in') + path.sep,
    out: path.join(__dirname, 'test', 'out') + path.sep
};

const fixtures = fs.readdirSync(directories.in).map(filename => {
    return {
        filename,
        name: path.parse(filename).name,
        geojson: load.sync(directories.in + filename)
    };
});

test('turf-line-segment', t => {
    for (const {name, filename, geojson} of fixtures) {
        const results = colorSegments(lineSegment(geojson));
        featureEach(geojson, feature => {
            feature.properties = {
                stroke: '#000',
                'stroke-width': 3
            };
            results.features.push(feature);
        });

        // Save output
        if (process.env.REGEN) write.sync(directories.out + filename, results);
        t.deepEqual(results, load.sync(directories.out + filename), name);
    }
    t.end();
});

// Preview 2-vertex LineStrings with colors
function colorSegments(segments) {
    const results = featureCollection([]);
    featureEach(segments, (feature, index) => {
        const r = (index % 2 === 0) ? 'F' : '0';
        const g = (index % 2 === 0) ? '0' : '0';
        const b = (index % 2 === 0) ? '0' : 'F';
        feature.properties = Object.assign({
            stroke: '#' + r + g + b,
            'stroke-width': 10
        }, feature.properties);
        results.features.push(feature);
    });
    return results;
}
