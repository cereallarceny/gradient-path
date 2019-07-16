# gradient-path

A small library to have any gradient follow along any SVG path

- One dependency ([tinygradient](https://github.com/mistic100/tinygradient))
- 1.7kb gzipped
- Use on any SVG `path`
- **Use with D3.js is supported but completely optional**

[This library is a generalization of the work of the great Mike Bostock.](https://bl.ocks.org/mbostock/4163057) We opted to remove the depedency on D3 and generalize the code a bit more to allow other people to more easily use it in their projects.

[Play around with it in Storybook](https://mnsht.github.io/gradient-path/)

[Play around with it on CodeSandbox](https://codesandbox.io/s/gradient-path-wstzn)

## Installation

Installation instructions depend on whether or not you are using D3.js in your project. If you intend to use D3 alongside gradient-path, then you don't need to install `tinygradient`. If you're going to use gradient-path standalone within your Javascript project, you must also install those dependencies (but don't worry, both pacakges gzipped together is around 8kb... so it's negligible).

**Installation with any Javascript project:**

`yarn add gradient-path tinygradient`

**Installation with D3.js**

`yarn add gradient-path`

## Usage

You'll need to keep track of what your current height is. You can do so using component state (`useState` or `this.state` will do) and then pass that value into the `height` props in the component below:

**Usage in Javascript:**

```js
import gradientPath from 'gradient-path';

gradientPath({
  path: document.querySelector('#infinity path'),
  stops: [
    { color: '#E9A36C', pos: 0 },
    { color: '#965167', pos: 0.25 },
    { color: '#231F3C', pos: 0.5 },
    { color: '#965167', pos: 0.75 },
    { color: '#E9A36C', pos: 1 }
  ],
  width: 10,
  precision: 1,
  stroke: 1,
  repeat: false,
  debug: false
});
```

See all options [here](#options).

**Usage in D3.js**

```js
import { getData, getPathPoints, getPathData } from 'gradient-path';

const precision = 1;
const width = 10;

// Any D3 color scale
const color = d3.interpolateRainbow;

// The path in question. Be sure to remove() at the end!
const path = d3.select('path').remove();

d3.select('svg')
  .selectAll('path')
  .data(getData(path.node(), precision))
  .enter()
  .append('path')
  .style('fill', d => color(d.color))
  .attr('d', d => getPathData(getPathPoints(d, width)));
```

## Methods

- **gradientPath**(_config_) - [Receives an object configuration](#options), taking a `path` and other options, and replacing that `path` with a `g` containing the generated gradient `path`. **This is the default export.**

- **getData**(_path_, _precision_) - Receives a `path` DOM node and a `precision` value. Outputs an array of "quads", which are segments taken from a sample of points along the `path`. These segments basically marks the direction of the line at a given chunk. When used with D3, this is your `data`.

- **getPathPoints**(_points_, _width_) - Receives an array of 4 points as well as a width and computes the exact path segment needed for any chunk of the line. It returns 4 "points", which are vertices in a quad. These can be used to render vertices for each corner of each `path` in the gradient. When used with D3, you'll pass `d` as your `points`.

- **getPathData**(_points_) - Receives the points generated from `getPathPoints` and returns a valid `path` data (`d`) attribute.

## Options

- **path** (_required_) - This is the `path` you intend to convert to a gradient path. It must be a valid DOM node (or D3 DOM node).

- **stops** (_required_) - These are the stops on your array. You can pass these in a variety of formats. For more information, [please check the documentation here on tinygradient](https://github.com/mistic100/tinygradient/blob/master/README.md).

- **width** (_required_) - The width of the `path` in pixels.

- **precision** (_required_) - THe precision of the `path` to be generated. **The lower the value, the more precise.** You shouldn't have a value smaller than 1 (the most precise). Depending on the complexity of your path, this value will need to be manually adjusted. It's not a perfect science...

- **stroke** (_optional_) - The stroke width of the `path` in pixels. You may notice that without a `stroke` given, your generated gradient path may have slight spaces between the edges. Having a stroke of `1` should fix this, although it's entirely optional. Like `precision`, you should play out with this value. The color will always be the same as the fill.

- **repeat** (_optional_) - If you want your SVG to repeat, mark this as `true`.

- **debug** (_optional_) - If you need some helpful dots placed at the verticies and center segment edges, this can help.

## Contributing

1. `yarn install` - installs all dev dependencies
2. `yarn start` - your storybook preview

Fork and PR at will!

## Acknowledgements

[Mike Bostock](https://github.com/mbostock), you're my developer crush. It would be an honor to approve a pull request from you.

_- [@cereallarceny](https://github.com/cereallarceny)_
