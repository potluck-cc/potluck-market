import React from "react";
import { View } from "react-native";
import { Svg, G, Rect, Path } from "react-native-svg";
import { AbstractChart } from "react-native-chart-kit";

const Pie = require("paths-js/pie");

export interface ProgressChartProps {
  data: Array<number>;
  width: number;
  height: number;
  chartConfig: object;
}

class ProgressChart extends AbstractChart {
  render() {
    let { width, height, style = {}, data } = this.props;

    const { borderRadius = 0 } = style;

    if (Array.isArray(data)) {
      data = {
        data
      };
    }

    const pies = data.data.map((pieData, i) => {
      const r = ((height / 2 - 32) / data.data.length) * i + 32;
      return Pie({
        r,
        R: r,
        center: [0, 0],
        data: [pieData, 1 - pieData],
        accessor(x) {
          return x;
        }
      });
    });

    const pieBackgrounds = data.data.map((pieData, i) => {
      const r = ((height / 2 - 32) / data.data.length) * i + 32;
      return Pie({
        r,
        R: r,
        center: [0, 0],
        data: [0.999, 0.001],
        accessor(x) {
          return x;
        }
      });
    });

    const withLabel = i => data.labels && data.labels[i];

    return (
      <View
        style={{
          width,
          height,
          padding: 0,
          ...style
        }}
      >
        <Svg width={width} height={height}>
          {this.renderDefs({
            width: this.props.height,
            height: this.props.height,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={this.props.height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G x={this.props.width / 2} y={this.props.height / 2}>
            <G>
              {pieBackgrounds.map((pie, i) => {
                return (
                  <Path
                    key={Math.random()}
                    d={pie.curves[0].sector.path.print()}
                    strokeWidth={16}
                    stroke={this.props.chartConfig.color(0.2, data.colors[i])}
                  />
                );
              })}
            </G>
            <G>
              {pies.map((pie, i) => {
                return (
                  <Path
                    key={Math.random()}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={pie.curves[0].sector.path.print()}
                    strokeWidth={16}
                    stroke={this.props.chartConfig.color(
                      (i / pies.length) * 0.5 + 0.5,
                      data.colors[i]
                    )}
                  />
                );
              })}
            </G>
          </G>
        </Svg>
      </View>
    );
  }
}

export default ProgressChart;
