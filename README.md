# Gradient Path

![Travis (.org)](https://img.shields.io/travis/cereallarceny/gradient-path.svg?color=green)
![npm](https://img.shields.io/npm/v/gradient-path.svg?color=green)
![GitHub](https://img.shields.io/github/license/cereallarceny/gradient-path.svg?color=green)

A small library to have any gradient follow along any SVG path

- 8.8kb gzipped
- Use on any valid SVG `path`
- **You can pair it with D3.js, or use it standalone**

![Gradient Path](./gradient.png)

[This library is inspired of the work of the great Mike Bostock.](https://bl.ocks.org/mbostock/4163057) We opted to remove the depedency on D3 and generalize the code a bit more to allow other people to more easily use it in their projects.

[Play around with it in Storybook](https://cereallarceny.github.io/gradient-path/)

[Play around with it on CodeSandbox](https://codesandbox.io/s/gradient-path-wstzn)

[Read about it on Medium](https://medium.com/@cereallarceny/getting-gradients-to-follow-along-svg-paths-in-javascript-45357b60bed7)

## Installation

Installation instructions depend on whether or not you are using D3.js in your project. If you intend to use D3 alongside `gradient-path`, then you **do not need** to install `tinygradient`. If you're going to use gradient-path standalone within your Javascript project, you must also install those dependencies (but don't worry, both pacakges gzipped together is around 8kb... so it's negligible).

NPM: `npm install --save gradient-path`<br />
Yarn: `yarn add gradient-path`

## Examples

Inspired by the chainable nature of D3, we figured the API should follow suit.

**Example in Javascript:**

```js
import { GradientPath } from 'gradient-path';

const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2 // Optional
});

gp.render({
  type: 'path',
  fill: [
    { color: '#C6FFDD', pos: 0 },
    { color: '#FBD786', pos: 0.25 },
    { color: '#F7797D', pos: 0.5 },
    { color: '#6DD5ED', pos: 0.75 },
    { color: '#C6FFDD', pos: 1 }
  ],
  width: 10
});

gp.render({
  type: 'circle',
  fill: '#eee',
  width: 3,
  stroke: '#444',
  strokeWidth: 0.5
});
```

**Example in D3.js**

```js
import * as d3 from 'd3';
import { getData, strokeToFill } from 'gradient-path';

const segments = 30,
  samples = 3,
  precision = 2, // Optional
  width = 10;

const colors = d3.interpolateRainbow;

// Make sure to remove() the node
const path = d3.select('path').remove();

const data = getData({ path, segments, samples, precision });
const flattenedData = data.flatMap(({ samples }) => samples);

const lineFunc = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

d3.select('svg')
  .selectAll('path')
  .data(strokeToFill(data, width, precision))
  .enter()
  .append('path')
  .attr('fill', d => colors(d.progress))
  .attr('d', d => lineFunc(d.samples));

d3.select('svg')
  .selectAll('circle')
  .data(flattenedData)
  .enter()
  .append('circle')
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .attr('r', 1.5)
  .attr('fill', '#eee')
  .attr('stroke', '#444')
  .attr('stroke-width', 0.5);
```

## Usage

The only options you can pass into the main functions of Gradient Path (the `new GradientPath()` class and the `getData()` function for use with D3) are to always be passed as an object. For instance:

```js
// A new instance of Gradient Path
const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2
});

gp.render(...)
```

... or with D3:

```js
// Always call remove() after
const path = d3.select('path').remove();

// Our Gradient Path data array
const data = getData({ path, segments, samples, precision });

// D3 code here...
```

### Config Object

The four keys are `path`, `segments`, `samples`, and `precision`:

- **path** (_required_) - This is the `path` you intend to convert to a gradient path. **It must be a valid DOM node or D3 selection.**

- **segments** (_required_) - The number of segments you want in your path or circles. You can also think of this as: "how many different colors do I want to display?"

- **samples** (_required_) - The number of sampled points in each segment. You can think of this as the amount of "detail" in each segment. The more samples, the more specifically the path is rounded.

- **precision** (_optional_) - The amount of decimal places to keep for each point in the path. The default is `2`, and for the sake of keeping your path's `d` attribute short and comprehendible, we recommend this stay the same.

### Render function

**This only applies to usage with plain Javascript, it doesn't work with D3.**

The `render()` function is the only function available in the `GradientPath` class. It is responsible for taking it's own configuration object consisting of a few properties:

```js
const colors = [
  { color: '#C6FFDD', pos: 0 },
  { color: '#FBD786', pos: 0.25 },
  { color: '#F7797D', pos: 0.5 },
  { color: '#6DD5ED', pos: 0.75 },
  { color: '#C6FFDD', pos: 1 }
];

gp.render({
  type: 'path',
  fill: colors,
  width: 10,
  stroke: colors,
  strokeWidth: 1
});
```

You may have as many `render()` functions as you desire. Here's the structure of the configuration object:

- **type** (_required_) - Must always have a value of `path` or `circle`. This designates the type of SVG shape being created.

- **fill** (_optional_) - The fill value of the SVG shape in question. This can be either a string value (`#eee` or `rgb(0, 0, 0)`) or a [valid tinygradient array](https://github.com/mistic100/tinygradient#usage).

- **width** (_optional_) - The width of the SVG shape in question. Specifically, this will **always** refer to the `fill`.

- **stroke** (_optional_) - The stroke value of the SVG shape in question. This can be either a string value (`#eee` or `rgb(0, 0, 0)`) or a [valid tinygradient array](https://github.com/mistic100/tinygradient#usage).

- **strokeWidth** (_optional_) - The stroke width of the SVG shape in question. Specifically, this will **always** refer to the `stroke`.

As a general rule, if you use `fill` then you'll need to define a `width`. Likewise, if you use a `stroke` then you will need to defined a `strokeWidth`. Defaults are not set for these values.

### Outlining a stroke

**This only applies to usage with D3.**

A keen eye might have spotted a subtle difference in how we use `getData()` when filling an SVG `path`. In order to work with `fill`, you'll first need to outline your data. You may do this using the `strokeToFill(data, width, precision)` function. You can use it like such:

```js
// We got the data in stroke form
const data = getData({ path, segments, samples, precision });

// Time to outline that data!
const outlinedData = strokeToFill(data, width, precision);

// Declare a basic line function
const lineFunc = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

// Run through our paths
d3.select('svg')
  .selectAll('path')
  .data(outlinedData);
  .enter()
  .append('path')
  .attr('fill', d => colors(d.progress)) // Now we can fill...
  .attr('d', d => lineFunc(d.samples));
```

## A note about antialiasing

[As Mike Bostock mentioned in his example](https://bl.ocks.org/mbostock/4163057):

> This example uses a thin stroke in addition to filling the segments. This avoids antialiasing artifacts due to most web browsers not implementing [full-scene antialiasing](https://bugs.webkit.org/show_bug.cgi?id=35211).

This is true and unavoidable. In both his example and in Gradient Path, you may notice small gaps between the edges of each segment. _Don't worry, your glasses are working just fine._

This is a well-known issue in every browser I've tested.

The fix is simple but annoying. You can add a very subtle stroke the same color as the fill, like this:

```js
gp.render({
  type: 'path',
  fill: myColors,
  width: 10,
  stroke: myColors,
  strokeWidth: 0.5
});
```

![Antialiasing](./antialiasing.png)

## Contributing

1. `yarn install` - installs all dev dependencies
2. `yarn start` - your storybook preview

Fork and PR at will!

## Acknowledgements

[Mike Bostock](https://github.com/mbostock), you're my developer crush. It would be an honor to approve a pull request from you.

_- [@cereallarceny](https://github.com/cereallarceny)_
