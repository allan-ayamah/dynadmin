const exampleColor = '#F00';
const connectorStyle = {
    fill: exampleColor,
}

export const jsPlumbConfig = {
    DragOptions: { cursor: 'pointer', zIndex: 2000 }, 
    Connector: [ "Straight", { cssClass: "normalLinkConnect"}],
    ConnectionsDetachable:false,
    Anchor: [ 
        [ 0.2, 0, 0, -1 ],  
        [ 1, 0.2, 1, 0 ], 
        [ 0.8, 1, 0, 1 ], 
        [ 0, 0.8, -1, 0 ]
    ],
    Endpoint: ["Dot", { radius: 4 } ], 
    Overlays: [
        [ 
            "Arrow",
            {
                location: 1,
                id: "normal",
                length: 10,
                width: 10,
                fill: exampleColor,
                foldback: 0.9,
            }
        ],
    ],
    allowLoopback:false
}

const OKLinkSettings = {

}