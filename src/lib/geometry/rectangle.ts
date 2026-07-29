import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, IElement, Point, Properties } from "./types";
import { Element } from "./element";
import { rotatePoint } from "./transform";

export class Rectangle extends Element {
  private _fill: string;
  private _fillStyle: string;

  get properties() {
    return {
      ...super.properties,
      fill: this._fill,
      fillStyle: this._fillStyle,
    };
  }

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    properties: Properties = {},
  ) {
    super(x, y, width, height, properties);
    this._type = "rectangle";
    this._fill = properties.fill || "";
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

    rc.rectangle(this._x, this._y, this._width, this._height, {
      stroke: this._stroke,
      strokeWidth: this._strokeWidth,
      roughness: this._roughness,
      fill: this._fill || undefined,
      fillStyle: this._fillStyle,
      bowing: this._bowing,
      seed: this._seed,
    });

    ctx.restore();
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
    const center = { x: cx, y: cy };

    const corners: Point[] = [
      { x: this._x, y: this._y },
      { x: this._x + this._width, y: this._y },
      { x: this._x + this._width, y: this._y + this._height },
      { x: this._x, y: this._y + this._height },
    ];

    const rotatedCorners = corners.map((corner) =>
      rotatePoint(corner, center, this._angle),
    );

    const xs = rotatedCorners.map((p) => p.x);
    const ys = rotatedCorners.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
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

  clone(overrides: Partial<Bounds & Properties> = {}): IElement {
    return new Rectangle(
      overrides.x ?? this.x,
      overrides.y ?? this.y,
      overrides.width ?? this.width,
      overrides.height ?? this.height,
      { ...this.properties, ...overrides },
    );
  }
}
