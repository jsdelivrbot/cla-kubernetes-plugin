(function(params) {
    var data = params.data || {};


    var configEditor = Cla.ui.codeEditor({
        name: 'podConfig',
        fieldLabel: 'Pod configuration',
        mode: 'Pod',
        value: params.rec.podConfig || '',
        height: 500,
        anchor: '100%'
    });

    return [configEditor];
})