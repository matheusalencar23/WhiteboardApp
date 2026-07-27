import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Point, Properties } from "./types";
import { Element } from "./element";

export class Ellipse extends Element {
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
    this._type = "ellipse";
    this._width = width;
    this._height = height;
    this._fill = properties.fill || null;
    this._fillStyle = properties.fillStyle || "hachure";
  }

  draw(rc: RoughCanvas) {
    rc.ellipse(
      this._x + this._width / 2,
      this._y + this._height / 2,
      Math.abs(this._width),
      Math.abs(this._height),
      {
        stroke: this._stroke,
        strokeWidth: this._strokeWidth,
        roughness: this._roughness,
        fill: this._fill || undefined,
        fillStyle: this._fillStyle,
        bowing: this._bowing,
        seed: this._seed,
      },
    );
  }

  containsPoint(point: Point): boolean {
    const cx = this._x + this._width / 2;
    const cy = this._y + this._height / 2;
    const rx = Math.abs(this._width) / 2;
    const ry = Math.abs(this._height) / 2;

    if (rx === 0 || ry === 0) return false;

    const normalizedX = (point.x - cx) / rx;
    const normalizedY = (point.y - cy) / ry;

    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this._x, y: this._y, width: this._width, height: this._height };
  }
}
