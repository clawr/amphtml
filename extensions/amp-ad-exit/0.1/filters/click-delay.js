/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {FilterType} from './filter';

/** @implements {!./filter.Filter} */
export class ClickDelayFilter {
  constructor() {
    this.resetClock();
  }

  filter(spec, event) {
    return (Date.now() - this.inViewportTime_) >= spec.delay;
  }

  resetClock() {
    this.inViewportTime_ = Date.now();
  }
}

/** @return {ClickDelayFilterSpec} */
export function makeClickDelaySpec(delayMs) {
  return {type: FilterType.CLICK_DELAY, delay: delayMs};
}

export function assertClickDelaySpec(spec) {
  return spec.type == FilterType.CLICK_DELAY && typeof spec.delay == 'number' &&
      spec.delay > 0;
}
