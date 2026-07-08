import { nanoid } from "nanoid";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { IElement, Properties } from "./types";

export class Element implements IElement {
  protected _id: string;
  protected _x: number;
  protected _y: number;
  protected _stroke: string;
  protected _strokeWidth: number;
  protected _roughness: number;
  protected _bowing: number;

  get id() {
    return this._id;
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

  constructor(x: number, y: number, properties: Properties = {}) {
    this._id = properties.id || nanoid();
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


