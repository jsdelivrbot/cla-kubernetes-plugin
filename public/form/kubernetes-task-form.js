(function(params) {
    var data = params.data;

    var serverComboBox = Cla.ui.ciCombo({
        name: 'server',
        role: 'Server',
        fieldLabel: _('Server'),
        value: params.data.server || '',
        allowBlank: false,
        with_vars: 1
    });

    var userTextField = Cla.ui.textField({
        name: 'user',
        fieldLabel: _('User'),
        value: data.user || '',
        allowBlank: true
    });


    var commandComboBox = Cla.ui.comboBox({
        fieldLabel: _('Command'),
        name: 'command',
        value: params.data.command || 'build',
        data: [
            ['build', _('build')],
            ['delete', _('delete')]
        ],
        singleMode: true,
        allowBlank: false
    });

    var createModePillBox = Cla.ui.pill({
        name: 'createMode',
        fieldLabel: _('Create mode'),
        value: params.data.createMode || 'File',
        options: ['File', 'Create', 'Resource'],
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
        fieldLabel: _('Pod Resource'),
        value: params.data.podCi || '',
        allowBlank: true,
        hidden: (params.data.command != 'build' || (params.data.createMode != 'CI' && params.data.command == 'build')),
        width: 400,
        with_vars: 1
    });

    var configEditor = Cla.ui.codeEditor({
        name: 'podConfig',
        fieldLabel: _('Pod configuration'),
        mode: 'Pod',
        value: params.data.podConfig || '',
        height: 300,
        anchor: '100%',
        hidden: (params.data.command != 'build' || (params.data.createMode != 'Create' && params.data.command == 'build'))
    });

    var remoteTempPathTextField = Cla.ui.textField({
        name: 'remoteTempPath',
        fieldLabel: _('Remote path'),
        value: params.data.remoteTempPath || '/tmp',
        allowBlank: true,
        hidden: (params.data.command == 'delete' || params.data.createMode == 'File')
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
                remoteTempPathTextField.hide();
                remoteTempPathTextField.allowBlank = true;
            } else if (pillValue == 'Create') {
                configFilePathTextField.hide();
                configFilePathTextField.allowBlank = true;
                podCiComboBox.hide();
                podCiComboBox.allowBlank = true;
                configEditor.show();
                remoteTempPathTextField.show();
                remoteTempPathTextField.allowBlank = false;
            } else {
                configFilePathTextField.hide();
                configFilePathTextField.allowBlank = true;
                podCiComboBox.show();
                podCiComboBox.allowBlank = false;
                configEditor.hide();
                remoteTempPathTextField.show();
                remoteTempPathTextField.allowBlank = false;
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
            remoteTempPathTextField.hide();
            remoteTempPathTextField.allowBlank = true;
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
            remoteTempPathTextField.hide();
            remoteTempPathTextField.allowBlank = true;
        } else if (v == 'Create' && commandValue == 'build') {
            configFilePathTextField.hide();
            configFilePathTextField.allowBlank = true;
            podCiComboBox.hide();
            podCiComboBox.allowBlank = true;
            configEditor.show();
            remoteTempPathTextField.show();
            remoteTempPathTextField.allowBlank = false;
        } else if (v == 'Resource' && commandValue == 'build') {
            configFilePathTextField.hide();
            configFilePathTextField.allowBlank = true;
            podCiComboBox.show();
            podCiComboBox.allowBlank = false;
            configEditor.hide();
            remoteTempPathTextField.show();
            remoteTempPathTextField.allowBlank = false;
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
            userTextField,
            commandComboBox,
            remoteTempPathTextField,
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