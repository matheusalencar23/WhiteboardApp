import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Properties } from "./types";
import { Element } from "./element";

export class Rectangle extends Element {
  private _width;
  private _height;
  private _fill;
  private _fillStyle;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    properties: Properties = {},
  ) {
    super(x, y, properties);
    this._width = width;
    this._height = height;
    this._fill = properties.fill || null;
    this._fillStyle = properties.fillStyle || "hachure";
  }

  draw(rc: RoughCanvas) {
    rc.rectangle(this._x, this._y, this._width, this._height, {
      stroke: this._stroke,
      strokeWidth: this._strokeWidth,
      roughness: this._roughness,
      fill: this._fill || undefined,
      fillStyle: this._fillStyle,
      bowing: this._bowing,
    });
  }
}
