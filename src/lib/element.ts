import { nanoid } from "nanoid";
import type { RoughCanvas } from "roughjs/bin/canvas";

interface Properties {
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  fill?: string;
  fillStyle?: string;
  bowing?: number;
}

export class Element {
  protected _id: string;
  protected _x: number;
  protected _y: number;
  protected _stroke: string;
  protected _strokeWidth: number;
  protected _roughness: number;
  protected _bowing: number;

  constructor(x: number, y: number, properties: Properties = {}) {
    this._id = nanoid();
    this._x = x;
    this._y = y;
    this._stroke = properties.stroke || "#000000";
    this._strokeWidth = properties.strokeWidth || 2;
    this._roughness = properties.roughness || 1.5;
    this._bowing = properties.bowing || 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  draw(_rc: RoughCanvas) {
    throw new Error("Method draw() needs to be implemented!");
  }
}

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
