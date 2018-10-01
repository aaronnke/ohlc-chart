import React, { Component } from 'react';
import PropTypes from 'prop-types';

// width of viewport - padding - buttons width
const CANVAS_WIDTH = window.innerWidth - (30 * 2) - 200;
const CANVAS_HEIGHT = 480;
const PADDING = 12;
const CANVAS_ACTUAL_WIDTH = CANVAS_WIDTH - PADDING * 2;
const CANVAS_ACTUAL_HEIGHT = CANVAS_HEIGHT - PADDING * 2;

// where the Y scale horizontal lines begin
const SCALE_MARKER_X_VALUE = PADDING + 24;
const SCALE_WIDTH = 8;

// shift data lines by this value (used by scale)
const VALUE_PADDING = SCALE_MARKER_X_VALUE - 4;
// keep scale to 10 for 'consistent' comparison between stocks
const GRID_SCALE = 10;

const BAR_WIDTH = 4;
const TICK_HEIGHT = 2;
const TICK_WIDTH = 6;


const RED = '#E53935';
const GREEN = '#81C784';
const LIGHT_GRAY = '#BDBDBD';
const DARK_GRAY = '#9E9E9E';
const FONT_STYLE = 'bold 12px Arial';

class Chart extends Component {
  static drawLine(ctx, startX, startY, endX, endY, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  static drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
    ctx.restore();
  }

  static drawMarker(ctx, color, font, gridValue, gridX, gridY) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'right';
    ctx.fillText(`$${gridValue}`, gridX, gridY + 4);
    ctx.restore();
  }

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidUpdate() {
    const { data } = this.props;
    if (data.length) {
      this.drawChart(data);
    }
  }

  drawChart(data) {
    const ctx = this.canvas.current.getContext('2d');
    // clear canvas before repainting
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // value for highest marker, true value set below
    let maxValue = 0;
    // value for lowest marker, true value set below
    let minValue = 99999;

    // get the highest and lowest stock price
    data.forEach((day) => {
      maxValue = Math.max(maxValue, day['2. high']);
      minValue = Math.min(minValue, day['3. low']);
    });

    // round down to nearest $10
    minValue = Math.floor(minValue / 10) * 10;
    // round up to nearest $10
    maxValue = Math.ceil(maxValue / 10) * 10;

    // draw Y-axis scale
    let gridValue = minValue;
    while (gridValue <= maxValue) {
      // canvas 0, 0 is top left, but we want scale to start from bottom
      // so we flip the multiple using 1 - percentage to maxValue
      const gridY = CANVAS_ACTUAL_HEIGHT * (1 - ((gridValue - minValue) / (maxValue - minValue)))
        + PADDING;
      Chart.drawLine(ctx, SCALE_MARKER_X_VALUE, gridY,
        SCALE_MARKER_X_VALUE + SCALE_WIDTH, gridY, DARK_GRAY);
      Chart.drawMarker(ctx, DARK_GRAY, FONT_STYLE, gridValue, SCALE_MARKER_X_VALUE, gridY);
      gridValue += GRID_SCALE;
    }

    // draw full-length line at 0 (bottom of chart)
    Chart.drawLine(ctx, SCALE_MARKER_X_VALUE, CANVAS_ACTUAL_HEIGHT + PADDING,
      CANVAS_ACTUAL_WIDTH + PADDING, CANVAS_ACTUAL_HEIGHT + PADDING, DARK_GRAY);

    // draw vertical lines
    let x = 0;
    while (x <= data.length) {
      const gridX = (((CANVAS_ACTUAL_WIDTH - VALUE_PADDING) / data.length) * x)
        + VALUE_PADDING + PADDING;
      Chart.drawLine(ctx, gridX, PADDING, gridX, CANVAS_ACTUAL_HEIGHT + PADDING, LIGHT_GRAY);
      x += 1;
    }

    // draw ohlc data
    data.forEach((day, index) => {
      // high-low bars
      const open = day['1. open'];
      const high = day['2. high'];
      const low = day['3. low'];
      const close = day['4. close'];
      const color = open > close ? RED : GREEN;
      const upperLeftCornerX = (((CANVAS_ACTUAL_WIDTH - VALUE_PADDING) / data.length) * (index + 1))
        + VALUE_PADDING + PADDING - (BAR_WIDTH / 2);
      const upperLeftCornerY = CANVAS_ACTUAL_HEIGHT
        * (1 - ((high - minValue) / (maxValue - minValue))) + PADDING;
      const lowerLeftCornerY = CANVAS_ACTUAL_HEIGHT
        * (1 - ((low - minValue) / (maxValue - minValue))) + PADDING;
      const height = lowerLeftCornerY - upperLeftCornerY;

      Chart.drawBar(ctx, upperLeftCornerX, upperLeftCornerY, BAR_WIDTH, height, color);

      // open ticks
      const openUpperLeftCornerX = (((CANVAS_ACTUAL_WIDTH - VALUE_PADDING) / data.length)
        * (index + 1)) + VALUE_PADDING + PADDING - (BAR_WIDTH / 2) - TICK_WIDTH;
      const openUpperLeftCornerY = CANVAS_ACTUAL_HEIGHT
        * (1 - ((open - minValue) / (maxValue - minValue))) + PADDING - (TICK_HEIGHT / 2);

      Chart.drawBar(ctx, openUpperLeftCornerX, openUpperLeftCornerY,
        TICK_WIDTH, TICK_HEIGHT, color);

      // close ticks
      const closeUpperLeftCornerX = openUpperLeftCornerX + TICK_WIDTH + BAR_WIDTH;
      const closeUpperLeftCornerY = CANVAS_ACTUAL_HEIGHT
        * (1 - ((close - minValue) / (maxValue - minValue))) + PADDING - (TICK_HEIGHT / 2);

      Chart.drawBar(ctx, closeUpperLeftCornerX, closeUpperLeftCornerY,
        TICK_WIDTH, TICK_HEIGHT, color);
    });
  }

  render() {
    return (
      <div className="ChartContainer">
        <canvas ref={this.canvas} className="Chart" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
    );
  }
}

Chart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      '1. open': PropTypes.string,
      '2. high': PropTypes.string,
      '3. low': PropTypes.string,
      '4. close': PropTypes.string,
    }),
  ).isRequired,
};

export default Chart;
