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

import {assertConfig} from './config';
import {dev, user} from '../../../src/log';
import {urlReplacementsForDoc} from '../../../src/services';
import {isJsonScriptTag, openWindowDialog} from  '../../../src/dom';
import {FilterType} from './filters/filter';
import {ClickDelayFilter, makeClickDelaySpec} from './filters/click-delay';
import {ClickLocationFilter} from './filters/click-location';

const TAG = 'amp-ad-exit';

export class AmpAdExit extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.win_ = window;

    /** @private {!./config.AmpAdExitConfig} */
    this.config_ = {targets: {}, filters: {}};

    this.defaultFilterSpecs_ = {
      'mindelay': makeClickDelaySpec(1000),
    };

    this.clickDelayFilter_ = new ClickDelayFilter();
    this.clickLocationFilter_ = new ClickLocationFilter();

    this.registerAction('exit', this.exit.bind(this));
  }

  exit({args, event}) {
    event.preventDefault();
    const targetName = args.target || 'default';
    const target = this.config_.targets[targetName];
    if (!target) {
      user().error(TAG, `Exit target not found: ${targetName}`);
      return;
    }
    if (!this.filter_(
            Object.keys(this.defaultFilterSpecs_), this.defaultFilterSpecs_,
            event) ||
        !this.filter_(target.filters, this.config_.filters, event)) {
      user().info(TAG, 'Click deemed unintenful');
      return;
    }
    const replacements = urlReplacementsForDoc(this.element);
    const processUrl = url => replacements.expandUrlSync(url);
    // TODO(clawr): Custom variable replacement.
    if (target.tracking_urls) {
      target.tracking_urls.map(processUrl)
          .forEach(url => this.pingTrackingUrl_(url));
    }
    openWindowDialog(this.win_, processUrl(target.final_url), '_blank');
  }

  pingTrackingUrl_(url) {
    user().fine(TAG, `pinging ${url}`)
    if (this.win_.navigator.sendBeacon) {
      this.win_.navigator.sendBeacon(url, '');
      return;
    }
    const req = this.win_.document.createElement('img');
    req.src = url;
  }

  /**
   * Checks the click event against the given filters. Returns true if the event
   * passes.
   * @param {!Array<string>} names
   * @param {!Object<string, !FilterSpec>} specs
   * @param {!Event} event
   * @returns {boolean}
   */
  filter_(names, specs, event) {
    if (!names) { return true; }
    return names.every(name => {
      const spec = specs[name];
      if (!spec) {
        user().warn(TAG, `Filter '${name}' not found`);
        return true;
      }
      const filter = this.findFilterForType_(spec.type);
      if (!filter) {
        user().warn(
            TAG, `Invalid filter type '${spec.type}' for filter '${name}'`);
        return true;
      }
      const result = filter.filter(spec, event);
      user().fine(TAG, `Filter '${name}': ${result ? 'pass' : 'fail'}`);
      return result;
    });
  }

  /** @return {?Filter} */
  findFilterForType_(type) {
    switch (type) {
      case FilterType.CLICK_DELAY:
        return this.clickDelayFilter_;
      case FilterType.CLICK_LOCATION:
        return this.clickLocationFilter_;
      default:
        return null;
    }
  }

  /** @override */
  buildCallback() {
    try {
      const children = this.element.children;
      if (children.length != 1) {
        user().error(
            TAG, 'The tag should contain exactly one <script> child.');
        return;
      }
      const child = children[0];
      if (isJsonScriptTag(child)) {
        this.config_ = assertConfig(JSON.parse(child.textContent));
      } else {
        user().error(
            TAG,
            'The amp-ad-exit config should ' +
                'be put in a <script> tag with type="application/json"');
      }
    }
    catch (e) {
      user().error(TAG, 'Invalid JSON config', e);
    }
  }

  /** @override */
  viewportCallback(inViewport) {
    if (inViewport) {
      this.clickDelayFilter_.resetClock();
    }
  }

  /** @override */
  isLayoutSupported(unused) {
    return true;
  }
}

AMP.registerElement('amp-ad-exit', AmpAdExit);
