var reg = require('cla/reg');

reg.register('service.kubernete.task', {
    name: _('Kubernetes task'),
    icon: '/plugin/cla-kubernetes-plugin/icon/kubernetes.svg',
    form: '/plugin/cla-kubernetes-plugin/form/kubernetes-task-form.js',

    handler: function(ctx, params) {
        var ci = require("cla/ci");
        var reg = require('cla/reg');
        var log = require('cla/log');
        var fs = require('cla/fs');

        var fullCommand,
            parsedResponse,
            response,
            command;
        var filePath = "/tmp/temp-pod.yaml";
        var server = params.server || "";
        var commandOption = params.command || "";
        var createMode = params.createMode || "";
        var podCiMid = params.podCi || "";
        var podConfig = params.podConfig || "";
        var configFilePath = params.configFilePath || "";
        var podName = params.deletePod || "";
        var errors = params.errors || "fail";

        function remoteCommand(params, command, server, errors) {
            var output = reg.launch('service.scripting.remote', {
                name: _('kubernetes task'),
                config: {
                    errors: errors,
                    server: server,
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

        function shipFiles(server) {
            var output = reg.launch('service.fileman.ship', {
                name: _('kubernetes ship'),
                config: {
                    server: server,
                    local_path: "/opt/clarive/tmp/temp-pod.yaml",
                    remote_path: "/tmp/"
                }
            });
            return output;
        }

        if (commandOption == "build") {
            command = "create";
            errors = "silent";
            if (createMode == "File") {
                filePath = configFilePath;
            } else if (createMode == "Create") {
                if (podConfig == "") {
                    log.fatal(_("Configuration is empty"));
                }
                fs.createFile("/opt/clarive/tmp/temp-pod.yaml", podConfig);
                shipFiles(server);
            } else if (createMode == "CI") {
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
                fs.createFile("/opt/clarive/tmp/temp-pod.yaml", podConfig);
                shipFiles(server);
            } else {
                log.fatal(_("No build mode selected"));
            }
            fullCommand = "kubectl " + command + " -f " + filePath;
        } else if (commandOption == "build") {
            fullCommand = "kubectl " + commandOption + " -f " + filePath;
        } else {
            log.fatal(_("No option selected"));
        }

        var commandLaunch = remoteCommand(params, fullCommand, server, errors);
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