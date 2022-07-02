/*****************************************************
 *
 * <!bootstrap:displayName>
 *
 * <!bootstrap:copyright>
 * License: <!bootstrap:license> (see LICENSE.md file)
 *
 *****************************************************/

import { FrontendApplication, CustomWindow } from '../../framework/frontend/FrontendApplication';

// Pages
import { SetPW } from './modules/pages/setpw/SetPW';
import { Login } from './modules/pages/login/Login';
import { Page1 } from './modules/pages/page1/Page1';
import { KeyValue } from './modules/pages/keyvalue/KeyValue';

// Dialogs
import { EditKeyValue } from './modules/dialogs/editKeyValue/EditKeyValue';

// Other modules
import { Main } from './modules/Main';

declare let window: CustomWindow;

new FrontendApplication({
    // Pages
    setpw: new SetPW(),
    login: new Login(),
    page1: new Page1(),
    keyvalue: new KeyValue(),

    // Dialogs
    editKeyValue: new EditKeyValue(),

    // Other modules
    main: new Main()
}, () => {
    // Refresh function
    window.application.modules.main.refresh();
});

