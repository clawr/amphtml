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

import {AmpAdExit} from '../amp-ad-exit';
import * as sinon from 'sinon';

describes.realWin('amp-ad-exit', {
  amp: {
    extensions: ['amp-ad-exit'],
  }
}, env => {

  const ID = 'exit-api';

  const BASIC_CONFIG = {
    targets: {
      simple: {
        final_url: 'https://example.com/simple'
      }
    }
  };

  const START_TIME = 1;

  let win;
  let element;
  let clock;

  function makeElementWithConfig(config) {
    win = env.win;
    element = win.document.createElement('amp-ad-exit');
    element.id = ID;
    const json = win.document.createElement('script');
    json.textContent = JSON.stringify(config);
    json.setAttribute('type', 'application/json');
    element.appendChild(json);
    win.document.body.appendChild(element);
  }

  function makeClickEvent(time = 0, x = 0, y = 0, touch = false) {
    clock.tick(time);
    return {
      clientX: x,
      clientY: y
    }
  }

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    if (element) {
      env.win.document.body.removeChild(element);
      element = undefined;
    }
    clock.restore();
  });

  it('should attempt new-tab navigation', () => {
    makeElementWithConfig(BASIC_CONFIG);
    element.build();
    element.exit({args: {target: 'simple'}, event: makeClickEvent(1001)});
    // expect window open
    expect(element.querySelector('div').textContent).to.equal('hello world');
  });
});
