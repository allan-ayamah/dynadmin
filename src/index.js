import React from 'react';
import ReactDOM from 'react-dom';
import DynAdmin from 'js/component/dyn-admin';
import * as serviceWorker from './serviceWorker';

import { SelectOrCreateTest } from 'js/component/property/select-or-create';
import { IOParameterBinderTest } from "js/component/property/io-data-binder";
import { Page } from "js/dyn-renderer/page";

const modalEl = document.getElementById('dyn-admin-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

ReactDOM.render(
    <DynAdmin 
        modalRoot={modalEl} 
        modalBackdrop={modalBackdrop}
        />, 
    document.getElementById('dyn-admin-wrap'));
/*ReactDOM.render(
    <Page 
        modalRoot={modalEl} 
        modalBackdrop={modalBackdrop}
        />, 
    document.getElementById('dyn-admin-wrap'));

*/
/*ReactDOM.render(
    <IOParameterBinderTest />, 
    document.getElementById('dyn-admin-wrap'));
*/

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
