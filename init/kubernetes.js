var reg = require('cla/reg');

reg.register('service.kubernete.task', {
    name: _('Kubernetes task'),
    icon: '/plugin/cla-kubernetes-plugin/icon/kubernetes.svg',
    form: '/plugin/cla-kubernetes-plugin/form/kubernetes-task-form.js',
    rulebook: {
        moniker: 'kubernetes_task',
        description: _('Builds or deletes Kubernetes pods'),
        required: [ 'server', 'command' ],
        allow: ['server', 'command', 'create_mode', 'config_file_path', 'pod_resource',
        'pod_config', 'delete_pod', 'remote_path', 'errors'],
        mapper: {
            'create_mode': 'createMode',
            'config_file_path': 'configFilePath',
            'pod_resource': 'podCi',
            'pod_config': 'podConfig',
            'delete_pod': 'deletePod',
            'remote_path': 'remoteTempPath'
        },
        examples: [{
            kubernetes_task: {
                server: 'kubernetes_server',
                command: 'build',
                create_mode: 'File',
                config_file_path: '/dir/seconfdir/podConfig.yaml'
            }
        },{
            kubernetes_task: {
                server: 'kubernetes_server',
                command: 'build',
                remote_path:'/tmp/',
                create_mode: 'Resource',
                pod_resource: 'kubernetes_resource'
            }
        },{
            kubernetes_task: {
                server: 'kubernetes_server',
                command: 'delete',
                delete_pod: 'configFilePath'
            }
        }]
    },
    handler: function(ctx, params) {
        var ci = require("cla/ci");
        var reg = require('cla/reg');
        var log = require('cla/log');
        var fs = require('cla/fs');

        var fullCommand,
            parsedResponse,
            response,
            command;
        var filePath = "";
        var server = params.server || "";
        var commandOption = params.command || "";
        var createMode = params.createMode || "";
        var podCiMid = params.podCi || "";
        var podConfig = params.podConfig || "";
        var configFilePath = params.configFilePath || "";
        var podName = params.deletePod || "";
        var remoteTempPath = params.remoteTempPath || "";
        var errors = params.errors || "fail";
        var fileName = "clarive-kubernetes-pod-" + Date.now() + ".yaml";
        var user = params.user || "";
        var remoteFilePath = path.join(remoteTempPath, fileName);

        function remoteCommand(params, command, server, errors, user) {
            var output = reg.launch('service.scripting.remote', {
                name: _('kubernetes task'),
                config: {
                    errors: errors,
                    server: server,
                    user: user,
                    path: command,
                    output_error: params.output_error,
                    output_warn: params.output_warn,
                    output_capture: params.output_capture,
                    output_ok: params.output_ok,
                    meta: params.meta,
                    rc_ok: params.rcOk,
                    rc_error: params.rcError,
                    rc_warn: params.rcWarn
                }
            });
            return output;
        }

        function shipFiles(server, filePath, remoteTempPath, user) {
            var output = reg.launch('service.fileman.ship', {
                name: _('kubernetes ship'),
                config: {
                    server: server,
                    user: user,
                    local_path: filePath,
                    remote_path: remoteTempPath
                }
            });
        }

        if (commandOption == "build") {
            command = "create";
            errors = "silent";
            if (createMode == "File") {
                remoteFilePath = configFilePath;
            } else if (createMode == "Create") {
                if (podConfig == "") {
                    log.fatal(_("Configuration is empty"));
                }
                fs.createFile("/tmp/" + fileName, podConfig);
                shipFiles(server, filePath, remoteTempPath, user);
            } else if (createMode == "Resource") {
                var podCi = ci.findOne({
                    mid: podCiMid + ""
                });
                if (!podCi) {
                    log.fatal(_("Pod CI doesn't exist"));
                }
                podConfig = podCi.podConfig;
                if (podConfig == "") {
                    log.fatal(_("Configuration is empty"));
                }
                fs.createFile("/tmp/" + fileName, podConfig);
                shipFiles(server, filePath, remoteTempPath, user);
            } else {
                log.fatal(_("No build mode selected"));
            }
            fullCommand = "kubectl " + command + " -f " + remoteFilePath;
        } else if (commandOption == "delete") {
            fullCommand = "kubectl " + commandOption + " -f " + podName;
        } else {
            log.fatal(_("No option selected"));
        }

        var commandLaunch = remoteCommand(params, fullCommand, server, errors, user);
        response = commandLaunch.output;

        if (commandOption = "build") {
            if ((commandLaunch.rc != 0 && params.errors != "custom") || (params.errors == "custom" && params.rcOk != commandLaunch.rc)) {
                parsedResponse = response.match(/ ".*" already exists/);
                if (parsedResponse != null) {
                    log.warn(_("Warning, installation already exists"), response);
                } else {
                    if (params.errors == "fail" || (params.errors == "custom" && params.rcError != commandLaunch.rc)) {
                        log.fatal(_("Creation failed "), response);
                    } else if (params.errors == "warn" || (params.errors == "custom" && params.rcWarn != commandLaunch.rc)) {
                        log.warn(_("Creation failed "), response);
                    } else {
                        log.error(_("Creation failed "), response);
                    }
                }
            } else {
                log.info(_("Done, task finished"), response);
            }
        }

        return response;
    }
});