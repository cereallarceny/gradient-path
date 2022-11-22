import Sample from './Sample';
import { getMiddleSample } from './_utils';

export default class Segment {
  public samples: Sample[];
  public progress?: number;

  constructor({ samples }: { samples: Sample[] }) {
    this.samples = samples;
    this.progress = getMiddleSample(samples).progress;
  }
}
