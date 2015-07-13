/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var FileActions = React.createClass({
    handleFileLoad: function(event) {
        var parser = new DOMParser(),
            reader = new FileReader(),
            topologyId = '',
            variables = [],
            properties = [],
            requirements = [],
            tasks = [],
            collections = [],
            main = {},
            self = this,
            target = event.target;

        reader.onload = function() {
            var $xml = $(parser.parseFromString(reader.result, 'application/xml'));

            // topology name
            topologyId = $xml.find('topology').attr('id');

            // variables
            $xml.find('topology>var').each(function() {
                var variable = {};
                variable.id = $(this).attr('id');
                variable.value = $(this).attr('value');
                variables.push(variable);
            });

            // properties
            $xml.find('topology>property').each(function() {
                var property = {};
                property.id = $(this).attr('id');
                properties.push(property);
            });

            // requirements
            $xml.find('topology>declrequirement').each(function() {
                var requirement = {};

                requirement.id = $(this).attr('id');
                requirement.type = $(this).find('hostPattern').attr('type');
                requirement.value = $(this).find('hostPattern').attr('value');

                requirements.push(requirement);
            });

            // tasks
            $xml.find('topology>decltask').each(function() {
                var task = {};

                task.id = $(this).attr('id');

                $(this).find('requirement').each(function() {
                    task.requirement = $(this).text();
                });

                $(this).find('exe').each(function() {
                    task.exe = {};
                    if (typeof ($(this).attr('reachable')) !== typeof undefined && ($(this).attr('reachable')) !== false) {
                        task.exe.reachable = $(this).attr('reachable');
                    }
                    task.exe.valueText = $(this).text();
                });

                $(this).find('env').each(function() {
                    task.env = {};
                    if (typeof ($(this).attr('reachable')) !== typeof undefined && ($(this).attr('reachable')) !== false) {
                        task.env.reachable = $(this).attr('reachable');
                    }
                    task.env.valueText = $(this).text();
                });

                task.properties = [];
                $(this).find('properties>id').each(function() {
                    var property = {};
                    property.id = $(this).text();
                    if (typeof ($(this).attr('access')) !== typeof undefined) {
                        property.access = $(this).attr('access');
                    } else {
                        property.access = "readwrite";
                    }
                    task.properties.push(property);
                });
                tasks.push(task);
            });

            // collections
            $xml.find('topology>declcollection').each(function() {
                var collection = {};
                collection.id = $(this).attr('id');

                $(this).find('requirement').each(function() {
                    collection.requirement = $(this).text();
                });

                collection.tasks = [];
                $(this).find('tasks>id').each(function() {
                    collection.tasks.push($(this).text());
                });
                collections.push(collection);
            });

            // main
            $main = $xml.find('topology>main');
            main.id = $main.attr('id');
            main.tasks = [];
            main.collections = [];
            main.groups = [];

            $xml.find('topology>main>task').each(function() {
                main.tasks.push($(this).text());
            });
            $xml.find('topology>main>collection').each(function() {
                main.collections.push($(this).text());
            });

            // groups in main
            $xml.find('topology>main>group').each(function() {
                var group = {};
                group.tasks = [];
                group.collections = [];
                group.id = $(this).attr('id');
                group.n = $(this).attr('n');
                $(this).find('task').each(function() {
                    group.tasks.push($(this).text());
                });
                $(this).find('collection').each(function() {
                    group.collections.push($(this).text());
                });
                main.groups.push(group);
            });

            self.props.onFileLoad(topologyId, variables, properties, requirements, tasks, collections, main);

            target.value = "";
        }

        reader.readAsText(event.target.files[0]);
    },

    handleFileSave: function() {
        var xmlDoc = document.implementation.createDocument('', '', null);
        var root = xmlDoc.createElement('topology');
        root.setAttribute('id', this.props.topologyId);

        var brbr = xmlDoc.createTextNode('\r\n\r\n');
        root.appendChild(brbr);

        // variables
        this.props.variables.forEach(function(variable) {
            var newVariable = xmlDoc.createElement('var');
            newVariable.setAttribute('id', variable.id);
            newVariable.setAttribute('value', variable.value);
            var spaces = xmlDoc.createTextNode('    ');
            root.appendChild(spaces);
            root.appendChild(newVariable);
            var br = xmlDoc.createTextNode('\r\n');
            root.appendChild(br);
        });

        var br = xmlDoc.createTextNode('\r\n');
        root.appendChild(br);

        // properties
        this.props.properties.forEach(function(property) {
            var newProperty = xmlDoc.createElement('property');
            newProperty.setAttribute('id', property.id);
            var spaces = xmlDoc.createTextNode('    ');
            root.appendChild(spaces);
            root.appendChild(newProperty);
            var br = xmlDoc.createTextNode('\r\n');
            root.appendChild(br);
        });

        var br = xmlDoc.createTextNode('\r\n');
        root.appendChild(br);

        // requirements
        this.props.requirements.forEach(function(requirement) {
            var spaces = xmlDoc.createTextNode('    ');
            root.appendChild(spaces);

            // create all elements
            var newRequirement = xmlDoc.createElement('declrequirement');
            newRequirement.setAttribute('id', requirement.id);
            var hostPattern = xmlDoc.createElement('hostPattern');
            hostPattern.setAttribute('type', requirement.type);
            hostPattern.setAttribute('value', requirement.value);

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            newRequirement.appendChild(brspaces);

            // append hostPattern to the requirement
            newRequirement.appendChild(hostPattern);

            var brspaces = xmlDoc.createTextNode('\r\n    ');
            newRequirement.appendChild(brspaces);

            // append requirement to the root
            root.appendChild(newRequirement);

            var br = xmlDoc.createTextNode('\r\n\r\n');
            root.appendChild(br);
        });

        // tasks
        this.props.tasks.forEach(function(task) {
            var spaces = xmlDoc.createTextNode('    ');
            root.appendChild(spaces);

            // create task declaration
            var newTask = xmlDoc.createElement('decltask');
            newTask.setAttribute('id', task.id);

            if (typeof task.requirement !== typeof undefined) {
                var brspaces = xmlDoc.createTextNode('\r\n        ');
                newTask.appendChild(brspaces);
                var taskRequirement = xmlDoc.createElement('requirement');
                taskRequirement.textContent = task.requirement;
                newTask.appendChild(taskRequirement);
            }

            // create and append task exe
            var taskExe = xmlDoc.createElement('exe');
            taskExe.textContent = task.exe.valueText;
            if (typeof task.exe.reachable !== typeof undefined) {
                taskExe.setAttribute('reachable', task.exe.reachable);
            }

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            newTask.appendChild(brspaces);

            newTask.appendChild(taskExe);

            // create and append task env (if it exists)
            if (typeof task.env !== typeof undefined) {
                var taskEnv = xmlDoc.createElement('env');
                taskEnv.textContent = task.env.valueText;
                if (typeof task.env.reachable !== typeof undefined) {
                    taskEnv.setAttribute('reachable', task.env.reachable);
                }

                var brspaces = xmlDoc.createTextNode('\r\n        ');
                newTask.appendChild(brspaces);

                newTask.appendChild(taskEnv);
            }

            // create task properties
            var propertiesContainer = xmlDoc.createElement('properties');

            task.properties.forEach(function(property) {
                var newProperty = xmlDoc.createElement('id');
                newProperty.textContent = property.id;
                newProperty.setAttribute('access', property.access);
                var brspaces = xmlDoc.createTextNode('\r\n            ');
                propertiesContainer.appendChild(brspaces);
                propertiesContainer.appendChild(newProperty);
            });

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            newTask.appendChild(brspaces);
            var brspaces = xmlDoc.createTextNode('\r\n        ');
            propertiesContainer.appendChild(brspaces);

            // append properties container
            newTask.appendChild(propertiesContainer);

            var brspaces = xmlDoc.createTextNode('\r\n    ');
            newTask.appendChild(brspaces);

            root.appendChild(newTask);

            var br = xmlDoc.createTextNode('\r\n\r\n');
            root.appendChild(br);
        });

        // collections
        this.props.collections.forEach(function(collection) {
            var spaces = xmlDoc.createTextNode('    ');
            root.appendChild(spaces);

            // create collection declaration
            var newCollection = xmlDoc.createElement('declcollection');
            newCollection.setAttribute('id', collection.id);

            if (typeof collection.requirement !== typeof undefined) {
                var brspaces = xmlDoc.createTextNode('\r\n        ');
                newCollection.appendChild(brspaces);
                var collectionRequirement = xmlDoc.createElement('requirement');
                collectionRequirement.textContent = collection.requirement;
                newCollection.appendChild(collectionRequirement);
            }

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            newCollection.appendChild(brspaces);

            var tasks = xmlDoc.createElement('tasks');

            collection.tasks.forEach(function(task) {
                var brspaces = xmlDoc.createTextNode('\r\n            ');
                tasks.appendChild(brspaces);
                var newTask = xmlDoc.createElement('id');
                newTask.textContent = task;
                tasks.appendChild(newTask);
            });

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            tasks.appendChild(brspaces);

            newCollection.appendChild(tasks);

            var brspaces = xmlDoc.createTextNode('\r\n    ');
            newCollection.appendChild(brspaces);

            root.appendChild(newCollection);

            var br = xmlDoc.createTextNode('\r\n\r\n');
            root.appendChild(br);
        });

        // main
        var spaces = xmlDoc.createTextNode('    ');
        root.appendChild(spaces);
        var main = xmlDoc.createElement('main');
        main.setAttribute('id', this.props.main.id);
        // tasks in main
        this.props.main.tasks.forEach(function(task) {
            var newTask = xmlDoc.createElement('task');
            newTask.textContent = task;
            var brspaces = xmlDoc.createTextNode('\r\n        ');
            main.appendChild(brspaces);
            main.appendChild(newTask);
        });
        // collections in main
        this.props.main.collections.forEach(function(collection) {
            var newCollection = xmlDoc.createElement('collection');
            newCollection.textContent = collection;
            var brspaces = xmlDoc.createTextNode('\r\n        ');
            main.appendChild(brspaces);
            main.appendChild(newCollection);
        });
        // groups in main
        this.props.main.groups.forEach(function(group) {
            var newGroup = xmlDoc.createElement('group');
            newGroup.setAttribute('id', group.id);
            newGroup.setAttribute('n', group.n);

            group.tasks.forEach(function(task) {
                var brspaces = xmlDoc.createTextNode('\r\n            ');
                newGroup.appendChild(brspaces);
                var newTask = xmlDoc.createElement('task');
                newTask.textContent = task;
                newGroup.appendChild(newTask);
            });
            group.collections.forEach(function(collection) {
                var brspaces = xmlDoc.createTextNode('\r\n            ');
                newGroup.appendChild(brspaces);
                var newCollection = xmlDoc.createElement('collection');
                newCollection.textContent = collection;
                newGroup.appendChild(newCollection);
            });

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            newGroup.appendChild(brspaces);

            var brspaces = xmlDoc.createTextNode('\r\n        ');
            main.appendChild(brspaces);
            main.appendChild(newGroup);
        });

        var brspaces = xmlDoc.createTextNode('\r\n    ');
        main.appendChild(brspaces);

        root.appendChild(main);

        var brspaces = xmlDoc.createTextNode('\r\n\r\n');
        root.appendChild(brspaces);

        xmlDoc.appendChild(root);

        var blob = new Blob([(new XMLSerializer).serializeToString(xmlDoc)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, this.props.topologyId + ".xml");
    },

    render: function() {
        return (
            <li className="list-group-item file-actions">
                <div className="row">
                    <div className="col-xs-6 btn-load">
                        <span className="btn btn-sm btn-default btn-file">
                            <span className="glyphicon glyphicon-floppy-open"></span> load<input type="file" onChange={this.handleFileLoad}/>
                        </span>
                    </div>
                    <div className="col-xs-6 btn-save">
                        <button type="button" className="btn btn-sm btn-default" onClick={this.handleFileSave}>
                            <span className="glyphicon glyphicon-floppy-save"></span> save
                        </button>
                    </div>
                </div>
            </li>
        );
    }
});

                // <button type="button" className="btn btn-sm btn-default" onclick="showXML()" data-toggle='modal' data-target='#codeModal'>
                //     <span className="glyphicon glyphicon-file"></span> Show
                // </button>
