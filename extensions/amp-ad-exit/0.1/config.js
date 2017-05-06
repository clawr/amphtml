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

import {FilterType} from './filters/filter';
import {assertClickDelaySpec} from './filters/click-delay';
import {assertClickLocationSpec} from './filters/click-location';

/**
 * @typedef {{
 *   targets: !Object<string, NavigationTarget>,
 *   filters: (!Object<string, Filter>|undefined)
 * }}
 */
let AmpAdExitConfig;

/**
 * @typedef {{
 *   final_url: Url,
 *   tracking_urls: (!Array<Url>|undefined),
 *   vars: (Variables|undefined),
 *   filters: (!Array<string>|undefined>
 * }}
 */
let NavigationTarget;

/** @typedef {string} */
let Url;

/** @typedef {string|number|boolean} */
let VariableValue;

/** @typedef {!Object<string, (VariableValue|!Array<VariableValue>)>} */
let Variables;

/**
 * @typedef {{
 *   type: !FilterType,
 *   delay: (number|undefined)
 * }}
 */
let FastClickFilter;

/**
 * @typedef {{
 *   type: (./filters/filter.FilterType),
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined),
 *   selector: (string|undefined)
 * }}
 */
let ClickLocationFilter;

/** @typedef {FastClickFilter|ClickLocationFilter} */
let Filter;

export class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.msg_ = msg;
  }

  toString() {
    return `[AmpAdExitConfig Validation Error] "${this.msg_}"`;
  }
}

function assert(msg, condition) {
  if (!condition) {
    throw new ValidationError(msg);
  }
}

/**
 * Checks whether the object conforms to the AmpAdExitConfig spec.
 *
 * @param {!Object} config The config to validate.
 * @return {!./config.AmpAdExitConfig}
 */
export function assertConfig(config) {
  if (config.filters) {
    assertFilters(config.filters);
  } else {
    config.filters = {};
  }
  assertTargets(config.targets, config);
  return /** @type {!./config.AmpAdExitConfig} */ (config);
}

function assertFilters(filters) {
  for (const name in filters) {
    assert(`Filter specification '${name}' is malformed`,
           typeof filters[name] == 'object');
    const type = filters[name].type;
    switch (type) {
      case FilterType.CLICK_DELAY:
      case FilterType.CLICK_LOCATION:

      default:
      assert(`'${type}' is not a known filter type`);
    }
  }
}

function assertTargets(targets, config) {
  assert(`'targets' must be an object`, typeof targets == 'object');
  for (const target in targets) {
    assertTarget(target, targets[target], config);
  }
}

function assertTarget(name, target, config) {
  assert(
      `final_url of ${name} must be a string`,
      typeof target.final_url == 'string');
  if (target.filters) {
    for (const filter of target.filters) {
      assert(`filter '${filter}' not defined`, config.filters[filter]);
    }
  }
}
