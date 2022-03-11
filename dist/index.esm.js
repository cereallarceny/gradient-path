import tinygradient from 'tinygradient';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        })
      );
    }

    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++)
      arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === '[object Arguments]'
  )
    return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}

var Sample = function Sample(_ref) {
  var x = _ref.x,
    y = _ref.y,
    progress = _ref.progress,
    segment = _ref.segment;

  _classCallCheck(this, Sample);

  this.x = x;
  this.y = y;
  this.progress = progress;
  this.segment = segment;
};

var svgElem = function svgElem(type, attrs) {
  var elem = document.createElementNS('http://www.w3.org/2000/svg', type),
    attributes = Object.keys(attrs);

  for (var i = 0; i < attributes.length; i++) {
    var attr = attributes[i];
    elem.setAttribute(attr, attrs[attr]);
  }

  return elem;
}; // An internal function to help with the repetition of adding fill, stroke, and stroke-width attributes

var styleAttrs = function styleAttrs(fill, stroke, strokeWidth, progress) {
  var determineColor = function determineColor(type, progress) {
    return typeof type === 'string' ? type : tinygradient(type).rgbAt(progress);
  };

  var attrs = {};

  if (stroke) {
    attrs['stroke'] = determineColor(stroke, progress);
    attrs['stroke-width'] = strokeWidth;
  }

  if (fill) {
    attrs['fill'] = determineColor(fill, progress);
  }

  return attrs;
}; // An internal function to convert any array of samples into a "d" attribute to be passed to an SVG path

var segmentToD = function segmentToD(samples) {
  var d = '';

  for (var i = 0; i < samples.length; i++) {
    var _samples$i = samples[i],
      x = _samples$i.x,
      y = _samples$i.y,
      prevSample = i === 0 ? null : samples[i - 1];

    if (i === 0 && i !== samples.length - 1) {
      d += 'M'.concat(x, ',').concat(y);
    } else if (x !== prevSample.x && y !== prevSample.y) {
      d += 'L'.concat(x, ',').concat(y);
    } else if (x !== prevSample.x) {
      d += 'H'.concat(x);
    } else if (y !== prevSample.y) {
      d += 'V'.concat(y);
    }

    if (i === samples.length - 1) {
      d += 'Z';
    }
  }

  return d;
}; // An internal function for getting the colors of a segment, we need to get middle most sample (sorted by progress along the path)

var getMiddleSample = function getMiddleSample(samples) {
  var sortedSamples = _toConsumableArray(samples).sort(function(a, b) {
    return a.progress - b.progress;
  });

  return sortedSamples[(sortedSamples.length / 2) | 0];
}; // An internal function for converting any D3 selection or DOM-like element into a DOM node

var convertPathToNode = function convertPathToNode(path) {
  return path instanceof Element || path instanceof HTMLDocument
    ? path
    : path.node();
};

var Segment = function Segment(_ref) {
  var samples = _ref.samples;

  _classCallCheck(this, Segment);

  this.samples = samples;
  this.progress = getMiddleSample(samples).progress;
};

// This will take a path, number of samples, number of samples, and a precision value
// It will return an array of Segments, which in turn contains an array of Samples
// This can later be used to generate a stroked path, converted to outlines for a filled path, or flattened for plotting SVG circles

var getData = function getData(_ref) {
  var path = _ref.path,
    segments = _ref.segments,
    samples = _ref.samples,
    _ref$precision = _ref.precision,
    precision = _ref$precision === void 0 ? DEFAULT_PRECISION : _ref$precision;
  // Convert the given path to a DOM node if it isn't already one
  path = convertPathToNode(path); // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment

  if (samples > 1) samples--; // Get total length of path, total number of samples we will be generating, and two blank arrays to hold samples and segments

  var pathLength = path.getTotalLength(),
    totalSamples = segments * samples,
    allSamples = [],
    allSegments = []; // For the number of total samples, get the x, y, and progress values for each sample along the path

  for (var sample = 0; sample <= totalSamples; sample++) {
    var progress = sample / totalSamples;

    var _path$getPointAtLengt = path.getPointAtLength(progress * pathLength),
      x = _path$getPointAtLengt.x,
      y = _path$getPointAtLengt.y; // If the user asks to round our x and y values, do so

    if (precision) {
      x = +x.toFixed(precision);
      y = +y.toFixed(precision);
    } // Create a new Sample and push it onto the allSamples array

    allSamples.push(
      new Sample({
        x: x,
        y: y,
        progress: progress
      })
    );
  } // Out of all the samples gathered previously, sort them into groups of segments
  // Each group includes the samples of the current segment, with the last sample being first sample from the next segment

  for (var segment = 0; segment < segments; segment++) {
    var currentStart = segment * samples,
      nextStart = currentStart + samples,
      segmentSamples = []; // Push all current samples onto segmentSamples

    for (var samInSeg = 0; samInSeg < samples; samInSeg++) {
      segmentSamples.push(allSamples[currentStart + samInSeg]);
    } // Push the first sample from the next segment onto segmentSamples

    segmentSamples.push(allSamples[nextStart]); // Create a new Segment with the samples from segmentSamples

    allSegments.push(
      new Segment({
        samples: segmentSamples
      })
    );
  } // Return our group of segments

  return allSegments;
}; // The function responsible for converting strokable data (from getData()) into fillable data
// This allows any SVG path to be filled instead of just stroked, allowing for the user to fill and stroke paths simultaneously
// We start by outlining the stroked data given a specified width and the we average together the edges where adjacent segments touch

var strokeToFill = function strokeToFill(data, width, precision, pathClosed) {
  var outlinedStrokes = outlineStrokes(data, width, precision),
    averagedSegmentJoins = averageSegmentJoins(
      outlinedStrokes,
      precision,
      pathClosed
    );
  return averagedSegmentJoins;
}; // An internal function for outlining stroked data

var outlineStrokes = function outlineStrokes(data, width, precision) {
  // We need to get the points perpendicular to a startPoint, given an angle, radius, and precision
  var getPerpSamples = function getPerpSamples(
    angle,
    radius,
    precision,
    startPoint
  ) {
    var p0 = new Sample(
        _objectSpread({}, startPoint, {
          x: Math.sin(angle) * radius + startPoint.x,
          y: -Math.cos(angle) * radius + startPoint.y
        })
      ),
      p1 = new Sample(
        _objectSpread({}, startPoint, {
          x: -Math.sin(angle) * radius + startPoint.x,
          y: Math.cos(angle) * radius + startPoint.y
        })
      ); // If the user asks to round our x and y values, do so

    if (precision) {
      p0.x = +p0.x.toFixed(precision);
      p0.y = +p0.y.toFixed(precision);
      p1.x = +p1.x.toFixed(precision);
      p1.y = +p1.y.toFixed(precision);
    }

    return [p0, p1];
  }; // We need to set the radius (half of the width) and have a holding array for outlined Segments

  var radius = width / 2,
    outlinedData = [];

  for (var i = 0; i < data.length; i++) {
    var samples = data[i].samples,
      segmentSamples = []; // For each sample point and the following sample point (if there is one) compute the angle
    // Also compute the sample's various perpendicular points (with a distance of radius away from the sample point)

    for (var j = 0; j < samples.length; j++) {
      // If we're at the end of the segment and there are no further points, get outta here!
      if (samples[j + 1] === undefined) break;
      var p0 = samples[j],
        // First point
        p1 = samples[j + 1],
        // Second point
        angle = Math.atan2(p1.y - p0.y, p1.x - p0.x),
        // Perpendicular angle to p0 and p1
        p0Perps = getPerpSamples(angle, radius, precision, p0),
        // Get perpedicular points with a distance of radius away from p0
        p1Perps = getPerpSamples(angle, radius, precision, p1); // Get perpedicular points with a distance of radius away from p1
      // We only need the p0 perpendenciular points for the first sample
      // The p0 for j > 0 will always be the same as p1 anyhow, so let's not add redundant points

      if (j === 0) {
        segmentSamples.push.apply(segmentSamples, _toConsumableArray(p0Perps));
      } // Always push the second sample point's perpendicular points

      segmentSamples.push.apply(segmentSamples, _toConsumableArray(p1Perps));
    } // segmentSamples is out of order...
    // Given a segmentSamples length of 8, the points need to be rearranged from: 0, 2, 4, 6, 7, 5, 3, 1

    outlinedData.push(
      new Segment({
        samples: [].concat(
          _toConsumableArray(
            segmentSamples.filter(function(s, i) {
              return i % 2 === 0;
            })
          ),
          _toConsumableArray(
            segmentSamples
              .filter(function(s, i) {
                return i % 2 === 1;
              })
              .reverse()
          )
        )
      })
    );
  }

  return outlinedData;
}; // An internal function taking outlinedData (from outlineStrokes()) and averaging adjacent edges
// If we didn't do this, our data would be fillable, but it would look stroked
// This function fixes where segments overlap and underlap each other

var averageSegmentJoins = function averageSegmentJoins(
  outlinedData,
  precision,
  pathClosed
) {
  // Find the average x and y between two points (p0 and p1)
  var avg = function avg(p0, p1) {
    return {
      x: (p0.x + p1.x) / 2,
      y: (p0.y + p1.y) / 2
    };
  }; // Recombine the new x and y positions with all the other keys in the object

  var combine = function combine(segment, pos, avg) {
    return _objectSpread({}, segment[pos], {
      x: avg.x,
      y: avg.y
    });
  };

  var init_outlinedData = JSON.parse(JSON.stringify(outlinedData)); //clone initial outlinedData Object

  for (var i = 0; i < outlinedData.length; i++) {
    // If path is closed: the current segment's samples;
    // If path is open: the current segments' samples, as long as it's not the last segment; Otherwise, the current segments' sample of the initial outlinedData object
    var currentSamples = pathClosed
        ? outlinedData[i].samples
        : outlinedData[i + 1]
        ? outlinedData[i].samples
        : init_outlinedData[i].samples,
      // If path is closed: the next segment's samples, otherwise, the first segment's samples
      // If path is open: the next segment's samples, otherwise, the first segment's samples of the initial outlinedData object
      nextSamples = pathClosed
        ? outlinedData[i + 1]
          ? outlinedData[i + 1].samples
          : outlinedData[0].samples
        : outlinedData[i + 1]
        ? outlinedData[i + 1].samples
        : init_outlinedData[0].samples,
      currentMiddle = currentSamples.length / 2,
      // The "middle" sample in the current segment's samples
      nextEnd = nextSamples.length - 1; // The last sample in the next segment's samples
    // Average two sets of outlined samples to create p0Average and p1Average

    var p0Average = avg(currentSamples[currentMiddle - 1], nextSamples[0]),
      p1Average = avg(currentSamples[currentMiddle], nextSamples[nextEnd]); // If the user asks to round our x and y values, do so

    if (precision) {
      p0Average.x = +p0Average.x.toFixed(precision);
      p0Average.y = +p0Average.y.toFixed(precision);
      p1Average.x = +p1Average.x.toFixed(precision);
      p1Average.y = +p1Average.y.toFixed(precision);
    } // Replace the previous values with new Samples

    currentSamples[currentMiddle - 1] = new Sample(
      _objectSpread({}, combine(currentSamples, currentMiddle - 1, p0Average))
    );
    currentSamples[currentMiddle] = new Sample(
      _objectSpread({}, combine(currentSamples, currentMiddle, p1Average))
    );
    nextSamples[0] = new Sample(
      _objectSpread({}, combine(nextSamples, 0, p0Average))
    );
    nextSamples[nextEnd] = new Sample(
      _objectSpread({}, combine(nextSamples, nextEnd, p1Average))
    );
  }

  return outlinedData;
};

var DEFAULT_PRECISION = 2;

var GradientPath =
  /*#__PURE__*/
  (function() {
    function GradientPath(_ref) {
      var path = _ref.path,
        segments = _ref.segments,
        samples = _ref.samples,
        _ref$precision = _ref.precision,
        precision =
          _ref$precision === void 0 ? DEFAULT_PRECISION : _ref$precision;

      _classCallCheck(this, GradientPath);

      // If the path being passed isn't a DOM node already, make it one
      this.path = convertPathToNode(path);
      this.segments = segments;
      this.samples = samples;
      this.precision = precision; // Check if nodeName is path and that the path is closed, otherwise it's closed by default

      this.pathClosed =
        this.path.nodeName == 'path'
          ? this.path.getAttribute('d').match(/z/gi)
          : true; // Store the render cycles that the user creates

      this.renders = []; // Append a group to the SVG to capture everything we render and ensure our paths and circles are properly encapsulated

      this.svg = path.closest('svg');
      this.group = svgElem('g', {
        class: 'gradient-path'
      }); // Get the data

      this.data = getData({
        path: path,
        segments: segments,
        samples: samples,
        precision: precision
      }); // Append the main group to the SVG

      this.svg.appendChild(this.group); // Remove the main path once we have the data values

      this.path.parentNode.removeChild(this.path);
    }

    _createClass(GradientPath, [
      {
        key: 'render',
        value: function render(_ref2) {
          var type = _ref2.type,
            stroke = _ref2.stroke,
            strokeWidth = _ref2.strokeWidth,
            fill = _ref2.fill,
            width = _ref2.width;
          // Store information from this render cycle
          var renderCycle = {}; // Create a group for each element

          var elemGroup = svgElem('g', {
            class: 'element-'.concat(type)
          });
          this.group.appendChild(elemGroup);
          renderCycle.group = elemGroup;

          if (type === 'path') {
            // If we specify a width and fill, then we need to outline the path and then average the join points of the segments
            // If we do not specify a width and fill, then we will be stroking and can leave the data "as is"
            renderCycle.data =
              width && fill
                ? strokeToFill(
                    this.data,
                    width,
                    this.precision,
                    this.pathClosed
                  )
                : this.data;

            for (var j = 0; j < renderCycle.data.length; j++) {
              var _renderCycle$data$j = renderCycle.data[j],
                samples = _renderCycle$data$j.samples,
                progress = _renderCycle$data$j.progress; // Create a path for each segment and append it to its elemGroup

              elemGroup.appendChild(
                svgElem(
                  'path',
                  _objectSpread(
                    {
                      class: 'path-segment',
                      d: segmentToD(samples)
                    },
                    styleAttrs(fill, stroke, strokeWidth, progress)
                  )
                )
              );
            }
          } else if (type === 'circle') {
            renderCycle.data = this.data.flatMap(function(_ref3) {
              var samples = _ref3.samples;
              return samples;
            });

            for (var _j = 0; _j < renderCycle.data.length; _j++) {
              var _renderCycle$data$_j = renderCycle.data[_j],
                x = _renderCycle$data$_j.x,
                y = _renderCycle$data$_j.y,
                progress = _renderCycle$data$_j.progress; // Create a circle for each sample and append it to its elemGroup

              elemGroup.appendChild(
                svgElem(
                  'circle',
                  _objectSpread(
                    {
                      class: 'circle-sample',
                      cx: x,
                      cy: y,
                      r: width / 2
                    },
                    styleAttrs(fill, stroke, strokeWidth, progress)
                  )
                )
              );
            }
          } // Save the information in the current renderCycle and pop it onto the renders array

          this.renders.push(renderCycle); // Return this for method chaining

          return this;
        }
      }
    ]);

    return GradientPath;
  })();

export default GradientPath;
export { getData, strokeToFill };
