import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Point, Properties } from "./types";
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
      seed: this._seed,
    });
  }

  containsPoint(point: Point): boolean {
    const left = this._x;
    const right = this._x + this._width;
    const top = this._y;
    const bottom = this._y + this._height;

    const minX = Math.min(left, right);
    const maxX = Math.max(left, right);
    const minY = Math.min(top, bottom);
    const maxY = Math.max(top, bottom);

    return (
      point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    );
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this._x, y: this._y, width: this._width, height: this._height };
  }
}
