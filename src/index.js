import React from 'react';
import ReactDOM from 'react-dom';
import DynAdmin from './dyn-admin';
import * as serviceWorker from './serviceWorker';

const modalEl = document.getElementById('dyn-admin-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

ReactDOM.render(
    <DynAdmin 
        modalRoot={modalEl} 
        modalBackdrop={modalBackdrop}
        />, 
    document.getElementById('dyn-admin-wrap'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
