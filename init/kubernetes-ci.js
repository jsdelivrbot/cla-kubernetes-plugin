var ci = require("cla/ci");

ci.createRole("Kubernetes");

ci.createClass("KubernetesPod", {
    icon: '/plugin/cla-kubernetes-plugin/icon/kubernetes.svg',
    form: '/plugin/cla-kubernetes-plugin/form/kubernetes-ci-form.js',
    roles: ["Kubernetes", "ClariveSE"],
    has: {
        podConfig: {
            is: "rw",
            isa: "Str",
            required: true
        }
    }

});
