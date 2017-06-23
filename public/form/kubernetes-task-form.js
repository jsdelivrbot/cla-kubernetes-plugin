(function(params) {
    var data = params.data || {};

    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        class: 'generic_server',
        fieldLabel: _('Server'),
        value: params.data.server || '',
        allowBlank: false,
        with_vars: 1
    });

    var commandComboBox = Cla.ui.comboBox({
        fieldLabel: _('Command'),
        name: 'command',
        value: params.data.command || 'build',
        data: [
            ['build','build'],
            ['delete','delete']
        ],
        singleMode: true,
        allowBlank: false
    });

    var createModePillBox = Cla.ui.pill({
        name: 'createMode',
        fieldLabel: 'Create mode',
        value: params.data.createMode || 'File',
        options: ['File', 'Create', 'CI'],
        hidden: (params.data.command != 'build')
    })

    var configFilePathTextField = Cla.ui.textField({
        name: 'configFilePath',
        fieldLabel: _('File path'),
        value: params.data.configFilePath || '',
        hidden: (params.data.command != 'build' || (params.data.createMode != 'File' && params.data.command == 'build'))
    });

    var podCiComboBox = Cla.ui.ciCombo({
        name: 'podCi',
        class: 'KubernetesPod',
        fieldLabel: _('Pod CI'),
        value: params.data.podCi || '',
        allowBlank: true,
        hidden: (params.data.command != 'build' || (params.data.createMode != 'CI' && params.data.command == 'build')),
        width: 400,
        with_vars: 1
    });

    var configEditor = Cla.ui.codeEditor({
        name: 'podConfig',
        fieldLabel: 'Pod configuration',
        mode: 'Pod',
        value: params.data.podConfig || '',
        height: 300,
        anchor: '100%',
        hidden: (params.data.command != 'build' || (params.data.createMode != 'Create' && params.data.command == 'build'))
    });

    var deleteTextField = Cla.ui.textField({
        name: 'deletePod',
        fieldLabel: _('Pod config path'),
        value: params.data.deletePod || '',
        allowBlank: true,
        hidden: (params.data.command != 'delete')
    });

    commandComboBox.on('addItem', function() {
        var v = commandComboBox.getValue();
        var pillValue = createModePillBox.getValue();
        if (v == 'build') {
            createModePillBox.show();
            deleteTextField.hide();
            deleteTextField.allowBlank = true;
            if (pillValue == 'File') {
                configFilePathTextField.show();
                configFilePathTextField.allowBlank = false;
                podCiComboBox.hide();
                podCiComboBox.allowBlank = true;
                configEditor.hide();
            } else if (pillValue == 'Create') {
                configFilePathTextField.hide();
                configFilePathTextField.allowBlank = true;
                podCiComboBox.hide();
                podCiComboBox.allowBlank = true;
                configEditor.show();
            } else {
                configFilePathTextField.hide();
                configFilePathTextField.allowBlank = true;
                podCiComboBox.show();
                podCiComboBox.allowBlank = false;
                configEditor.hide();
            }
        } else {
            createModePillBox.hide();
            deleteTextField.show();
            deleteTextField.allowBlank = false;
            configFilePathTextField.hide();
            configFilePathTextField.allowBlank = true;
            podCiComboBox.hide();
            podCiComboBox.allowBlank = true;
            configEditor.hide();
        }
    });

    createModePillBox.on('change', function() {
        var v = createModePillBox.getValue();
        var commandValue = commandComboBox.getValue();
        if (v == 'File' && commandValue == 'build') {
            configFilePathTextField.show();
            configFilePathTextField.allowBlank = false;
            podCiComboBox.hide();
            podCiComboBox.allowBlank = true;
            configEditor.hide();
        } else if (v == 'Create' && commandValue == 'build') {
            configFilePathTextField.hide();
            configFilePathTextField.allowBlank = true;
            podCiComboBox.hide();
            podCiComboBox.allowBlank = true;
            configEditor.show();
        } else if (v == 'CI' && commandValue == 'build') {
            configFilePathTextField.hide();
            configFilePathTextField.allowBlank = true;
            podCiComboBox.show();
            podCiComboBox.allowBlank = false;
            configEditor.hide();
        }
    });


    var errorBox = Cla.ui.errorManagementBox({
        errorTypeName: 'errors',
        errorTypeValue: params.data.errors || 'fail',
        rcOkName: 'rcOk',
        rcOkValue: params.data.rcOk,
        rcWarnName: 'rcWarn',
        rcWarnValue: params.data.rcWarn,
        rcErrorName: 'rcError',
        rcErrorValue: params.data.rcError,
        errorTabsValue: params.data
    });

    var panel = Cla.ui.panel({
        layout: 'form',
        items: [
            serverComboBox,
            commandComboBox,
            createModePillBox,
            configFilePathTextField,
            podCiComboBox,
            configEditor,
            deleteTextField,
            errorBox
        ]
    });

    return panel;
})