import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, Point, Properties } from "./types";
import { Element } from "./element";

export class Ellipse extends Element {
  private _fill;
  private _fillStyle;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    properties: Properties = {},
  ) {
    super(x, y, width, height, properties);
    this._type = "ellipse";
    this._fill = properties.fill || null;
    this._fillStyle = properties.fillStyle || "hachure";
  }

  draw(rc: RoughCanvas, ctx: CanvasRenderingContext2D) {
    ctx.save();

    const cx = this._x + this._width / 2;
    const cy = this._y + this._height / 2;

    if (this._angle !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate((this._angle * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

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

    ctx.restore();
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

  getBounds(): Bounds {
    if (this._angle === 0) {
      return {
        x: this._x,
        y: this._y,
        width: this._width,
        height: this._height,
      };
    }

    const cx = this._x + this._width / 2;
    const cy = this._y + this._height / 2;

    const a = Math.abs(this._width) / 2;
    const b = Math.abs(this._height) / 2;

    const rad = (this._angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const halfWidth = Math.sqrt(Math.pow(a * cos, 2) + Math.pow(b * sin, 2));
    const halfHeight = Math.sqrt(Math.pow(a * sin, 2) + Math.pow(b * cos, 2));

    return {
      x: cx - halfWidth,
      y: cy - halfHeight,
      width: halfWidth * 2,
      height: halfHeight * 2,
    };
  }

  getLocalBounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
