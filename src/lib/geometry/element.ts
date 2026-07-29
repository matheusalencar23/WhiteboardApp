import { nanoid } from "nanoid";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Bounds, IElement, Point, Properties } from "./types";
import type { DrawingTool } from "../canvas/types";

export abstract class Element implements IElement {
  protected _id: string;
  protected _type: DrawingTool | null;
  protected _x: number;
  protected _y: number;
  protected _width: number;
  protected _height: number;
  protected _stroke: string;
  protected _strokeWidth: number;
  protected _roughness: number;
  protected _bowing: number;
  protected _seed: number;
  protected _angle: number;

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get stroke() {
    return this._stroke;
  }

  get strokeWidth() {
    return this._strokeWidth;
  }

  get roughness() {
    return this._roughness;
  }

  get bowing() {
    return this._bowing;
  }

  get seed() {
    return this._seed;
  }

  get angle() {
    return this._angle;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get properties() {
    return {
      id: this._id,
      stroke: this._stroke,
      strokeWidth: this._strokeWidth,
      roughness: this._roughness,
      bowing: this._bowing,
      seed: this._seed,
      angle: this._angle,
    };
  }

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    properties: Properties = {},
  ) {
    this._id = properties.id || nanoid();
    this._type = null;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._stroke = properties.stroke || "#000000";
    this._strokeWidth = properties.strokeWidth || 2;
    this._roughness = properties.roughness || 1.5;
    this._bowing = properties.bowing || 1;
    this._seed = properties.seed || Math.floor(Math.random() * 100000);
    this._angle = properties.angle || 0;
  }

  abstract draw(_rc: RoughCanvas, _ctx: CanvasRenderingContext2D): void;
  abstract containsPoint(_point: Point): boolean;
  abstract getBounds(): Bounds;
  abstract getLocalBounds(): Bounds;
  abstract clone(overrides: Partial<Bounds & Properties>): IElement;
}
