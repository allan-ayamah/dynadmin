
export const ADMIN_LOG_TYPE = {
    EVERYONE: "",
    USER: "USER",
    DEVELOPER: "DEVELOPER"
}


export default class DynAdminService {
    constructor(mgr) {
        this.mgr = mgr;
    }


    logDebug() {
        const args = Array.from(arguments);
        if(args.length) {
            const logType = args[0];
            if(ADMIN_LOG_TYPE[logType]) {
                console.log(...args)
            } else {
                console.log(...args)
            }
        }
    }

    logError() {
        const args = Array.from(arguments);
        if(args.length) {
            const logType = args[0];
            if(ADMIN_LOG_TYPE[logType]) {
                console.log(...args)
            } else {
                console.log(...args)
            }
        }
    }
}