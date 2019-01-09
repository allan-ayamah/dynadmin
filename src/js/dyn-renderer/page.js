import React, { Suspense } from "react";

const GeneratedPage = React.lazy(() => import("./generated-page"));

export class Page extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            page: null
        }
        const _this = this;
    }

    getGeneratedPage = () => {
        return this.state.page;
    }

    render() {
        return (
            <React.Suspense fallback={<div>Loading</div>}>
                <GeneratedPage></GeneratedPage>
            </React.Suspense>
        )
    }
}