import React from "react";
import Dyn from "../layout";

const MyPage = () => {
    return ( 
        <div>
            <div>TEST generated page</div>
            <div>
                <div><Dyn.Input key={"fld1"} id={"fld1"} value="" /></div>
                <div><Dyn.Select key={"sfld1"} id={"sfld1"} labels={["Test1", "Other"]} values={["T", "O"]}/></div>    
            </div>    
        </div>   
    )
}
    

export default MyPage;