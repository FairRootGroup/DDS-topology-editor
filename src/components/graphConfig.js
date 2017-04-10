const graphConfig = {
    style: [
        {
            selector: 'node',
            css: {
                'content': 'data(id)',
                'font-family': 'Open Sans, sans-serif',
                'text-valign': 'center',
                'text-halign': 'center',
                'border-width': 0,
                'font-size': '13px',
            }
        },
        {
            selector: '.task',
            css: {
                'background-color': '#03a9f4',
                'text-outline-width': 3,
                'text-outline-color': '#03a9f4',
                'color': 'white'
            }
        },
        {
            selector: '.collection',
            css: {
                'padding-top': '10px',
                'padding-left': '10px',
                'padding-bottom': '10px',
                'padding-right': '10px',
                'text-valign': 'top',
                'text-halign': 'center',
                'background-color': '#607d8b',
                'border-width': 0,
                'font-size': '13px'
            }
        },
        {
            selector: '.group',
            css: {
                'padding-top': '10px',
                'padding-left': '10px',
                'padding-bottom': '10px',
                'padding-right': '10px',
                'text-valign': 'top',
                'text-halign': 'center',
                'background-color': '#009688',
                'border-width': 0,
                'font-size': '13px'
            }
        },
        {
            selector: '.group node, .collection node',
            css: {
                'color': '#fff'
            }
        }
    ],

    minZoom: 0.1,
    maxZoom: 2.0,
};

export default graphConfig;
