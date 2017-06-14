# Kubernetes Task Plugin

Kubernetes plugin will allow you to create new pods remotely from a Clarive instance.

## Requirements

This plugin requires Kubernetes to be installed in the destination server to work properly.

To install Kubernetes you need to click [here](https://kubernetes.io/) and follow the instructions.

## Installation

To install the plugin, place the cla-kubernetes-plugin folder inside the `CLARIVE_BASE/plugins`
directory in a Clarive instance.

## How to use

Once the plugin is correctly installed, you will have a new palette service called 'Kubernetes task', and a new CI for the pods you wish to manage from Clarive, called 'KubernetesPods'.

### KubernetesPod CI:

You will be able to save your configuration code in this CI. The main fields are:

- **Pod configuration** - Write the appropiate code for the pod creation.

Configuration example:

    Pod configuration: apiVersion: v1
                     kind: ReplicationController
                     metadata:
                       name: nginx
                     spec:
                       replicas: 2
                       selector:
                         app: nginx
                       template:
                         metadata:
                           name: nginx
                           labels:
                             app: nginx
                         spec:
                           containers:
                           - name: nginx
                             image: nginx
                             ports:
                             - containerPort: 80

### Kubernetes task:

This palette service will let you choose the method to create the pods in the remote server.

- **Server** - This field will appear when you have the "List VMs", "Custom command" or "Register VM" option(s) selected. This option lets you choose the server where you wish to execute the command. 
- **Command** - Via this parameter you can to build a pod in the remote server or delete it.    
- **Creation mode** - You can choose between creating the pod from an already existing file in Clarive, from the CI, or create it in the rule.

Configuration example:

    Server: Remote_server
    Command: Build
    Creation mode: File
    File path: /dir/seconfdir/podConfig.yaml
    Errors: fail
    Output: 
