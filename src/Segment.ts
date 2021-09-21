import Sample from './Sample';
import { getMiddleSample } from './_utils';

export default class Segment {
  samples: Sample[];
  progress: number;
  
  constructor(samples: Sample[]) {
    this.samples = samples;
    this.progress = getMiddleSample(samples).progress;
  }
}
