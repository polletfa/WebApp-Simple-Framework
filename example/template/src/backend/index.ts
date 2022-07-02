/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import { BackendApplication } from '../../framework/backend/BackendApplication';

import { SampleKeyValueAPI } from './SampleKeyValueAPI';

new BackendApplication([
    // Built-in APIs
    "SingleUserAuthenticationAPI",

    // User-defined APIs
    server => new SampleKeyValueAPI(server)
]);
