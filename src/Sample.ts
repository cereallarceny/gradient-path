import Segment from "./Segment";

export default class Sample {
  x: number;
  y: number;
  progress: number;
  segment?: Segment;
  samples: Sample[] = [];

  constructor({ x, y, progress, segment }: Omit<Sample, "samples">) {
    this.x = x;
    this.y = y;
    this.progress = progress;
    this.segment = segment;
  }
}
