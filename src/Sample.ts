export default class Sample {
  public x: number;
  public y: number;
  public progress?: number;
  public segment?: number;

  constructor({
    x,
    y,
    progress,
    segment
  }: {
    x: number;
    y: number;
    progress?: number;
    segment?: number;
  }) {
    this.x = x;
    this.y = y;
    this.progress = progress;
    this.segment = segment;
  }
}
