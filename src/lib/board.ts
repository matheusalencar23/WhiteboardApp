import rough from "roughjs";

export class Board {
  private _canvas: HTMLCanvasElement;

  get ctx() {
    return this._canvas.getContext("2d");
  }

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  render() {
    const ctx = this.ctx!;
    const rc = rough.canvas(this._canvas);

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    rc.rectangle(200, 300, 150, 200, {
      stroke: "red",
      strokeWidth: 2,
      roughness: 1.5, // Nível de "imperfeição" da linha
      fill: "blue",
      fillStyle: "hachure",
    });
  }
}
