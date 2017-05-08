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

import {viewportForDoc} from '../../../../src/services';
import {Filter, FilterType} from './filter';

/** @implements {Filter} */
export class ClickLocationFilter {
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;
  }

  filter(spec, event) {
    const bounds = this.getBounds_(spec);
    const {clientX, clientY} = this.getClickPosition_(event);
    return clientY >= bounds.top &&
        clientX < bounds.right &&
        clientY < bounds.bottom &&
        clientX >= bounds.left;
  }

  getBounds_(spec) {
    const viewportSize = viewportForDoc(this.ampdoc_).getSize();
    return {
      top: spec.top || 0,
      right: viewportSize.width - (spec.right || 0),
      bottom: viewportSize.height - (spec.bottom || 0),
      left: spec.left || 0,
    }
  }

  /** @return {{clientX: number, clientY: number}} */
  getClickPosition_(event) {
    let clientX, clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
      ({clientX, clientY} = event.changedTouches[0]);
    } else {
      ({clientX, clientY} = event);
    }
    return {clientX, clientY};
  }
}

/**
 * @param {../config.ClickLocationConfig} spec
 * @return {boolean} Whether spec is a valid ClickLocationConfig.
 */
export function assertClickLocationSpec(spec) {
  const isUndefOrNotNegative = (n) => {
    const type = typeof n;
    return type == 'undefined' || (type == 'number' && n >= 0);
  };
  return spec.type == FilterType.CLICK_LOCATION &&
      isUndefOrNotNegative(spec.top) &&
      isUndefOrNotNegative(spec.right) &&
      isUndefOrNotNegative(spec.bottom) &&
      isUndefOrNotNegative(spec.left);
}
