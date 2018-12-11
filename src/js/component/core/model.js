import Data from "../data";

export default class Model extends Data {
    constructor(id, data) {
        super({ [id]: data });
        this.id = id;
    }

    getData() {
        return this.get(this.id);
    }
}
