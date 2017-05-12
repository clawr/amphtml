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
import {rectIntersection} from '../../../../src/layout-rect';
import {FilterType} from './filter';

/** @implements {!./filter.Filter} */
export class ClickLocationFilter {
  constructor(win, ampdoc) {
    this.win_ = win;
    this.ampdoc_ = ampdoc;
  }

  filter(spec, event) {
    const clickableArea = this.getClickableArea_();
    const bounds = this.getBounds_(spec, clickableArea);
    const {clientX, clientY} = this.getClickPosition_(event, clickableArea);
    return clientY >= bounds.top &&
        clientX < bounds.right &&
        clientY < bounds.bottom &&
        clientX >= bounds.left;
  }

  getClickableArea_() {
    const vp = viewportForDoc(this.ampdoc_);
    const bd = this.win_.document.body;
    return rectIntersection(vp.getRect(), vp.getLayoutRect(bd));
  }

  getBounds_(spec, clickableArea) {
    return {
      top: clickableArea.top + (spec.top || 0),
      right: clickableArea.right - (spec.right || 0),
      bottom: clickableArea.bottom - (spec.bottom || 0),
      left: clickableArea.left + (spec.left || 0),
    };
  }

  /** @return {{clientX: number, clientY: number}} */
  getClickPosition_(event, clickableArea) {
    let clientX, clientY;
    if (event.changedTouches && event.changedTouches.length > 0) {
      ({clientX, clientY} = event.changedTouches[0]);
    } else {
      ({clientX, clientY} = event);
    }
    clientX += clickableArea.left;
    clientY += clickableArea.top;
    return {clientX, clientY};
  }
}

/**
 * @param {../config.ClickLocationConfig} spec
 * @return {boolean} Whether spec is a valid ClickLocationConfig.
 */
export function assertClickLocationSpec(spec) {
  const isUndefOrNotNegative = n => {
    const type = typeof n;
    return type == 'undefined' || (type == 'number' && n >= 0);
  };
  return spec.type == FilterType.CLICK_LOCATION &&
      isUndefOrNotNegative(spec.top) &&
      isUndefOrNotNegative(spec.right) &&
      isUndefOrNotNegative(spec.bottom) &&
      isUndefOrNotNegative(spec.left);
}
