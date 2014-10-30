/** @jsx React.DOM */

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
            properties = [],
            tasks = [],
            collections = [],
            main = {},
            self = this,
            target = event.target;

        reader.onload = function() {
            var $xml = $(parser.parseFromString(reader.result, 'application/xml'));

            // topology name
            topologyId = $xml.find('topology').attr('id');

            // properties
            $xml.find('topology>property').each(function() {
                var property = {};
                property.id = $(this).attr('id');
                properties.push(property);
            });

            // tasks
            $xml.find('topology>decltask').each(function() {
                var task = {};

                task.id = $(this).attr('id');

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
                    task.properties.push(property);
                });
                tasks.push(task);
            });

            // collections
            $xml.find('topology>declcollection').each(function() {
                var collection = {};
                collection.id = $(this).attr('id');
                collection.tasks = [];
                $(this).find('task').each(function() {
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

            // console.log(properties);
            // console.log(tasks);
            // console.log(collections);
            // console.log(main);

            self.props.onFileLoad(topologyId, properties, tasks, collections, main);

            target.value = "";
        }

        reader.readAsText(event.target.files[0]);
    },

    handleFileSave: function() {
        var xmlDoc = document.implementation.createDocument('', '', null);
        var root = xmlDoc.createElement('topology');
        root.setAttribute('id', this.props.topologyId);

        // properties
        this.props.properties.forEach(function(property) {
            var newProperty = xmlDoc.createElement('property');
            newProperty.setAttribute('id', property.id);
            root.appendChild(newProperty);
        });

        // tasks
        this.props.tasks.forEach(function(task) {
            var newTask = xmlDoc.createElement('decltask');
            newTask.setAttribute('id', task.id);

            var taskExe = xmlDoc.createElement('exe');
            taskExe.textContent = task.exe.valueText;
            if (typeof task.exe.reachable !== typeof undefined) {
                taskExe.setAttribute('reachable', task.exe.reachable);
            }
            newTask.appendChild(taskExe);

            if (typeof task.env !== typeof undefined) {
                var taskEnv = xmlDoc.createElement('env');
                taskEnv.textContent = task.env.valueText;
                if (typeof task.env.reachable !== typeof undefined) {
                    taskEnv.setAttribute('reachable', task.env.reachable);
                }
                newTask.appendChild(taskEnv);
            }

            var propertiesContainer = xmlDoc.createElement('properties');

            task.properties.forEach(function(property) {
                var newProperty = xmlDoc.createElement('id');
                newProperty.textContent = property.id;
                propertiesContainer.appendChild(newProperty);
            });

            newTask.appendChild(propertiesContainer);

            root.appendChild(newTask);
        });

        // collections
        this.props.collections.forEach(function(collection) {
            var newCollection = xmlDoc.createElement('declcollection');
            newCollection.setAttribute('id', collection.id);
            collection.tasks.forEach(function(task) {
                var newTask = xmlDoc.createElement('task');
                newTask.textContent = task;
                newCollection.appendChild(newTask);
            });

            root.appendChild(newCollection);
        });

        // main
        var main = xmlDoc.createElement('main');
        main.setAttribute('id', this.props.main.id);
        // tasks in main
        this.props.main.tasks.forEach(function(task) {
            var newTask = xmlDoc.createElement('task');
            newTask.textContent = task;
            main.appendChild(newTask);
        });
        // collections in main
        this.props.main.collections.forEach(function(collection) {
            var newCollection = xmlDoc.createElement('collection');
            newCollection.textContent = collection;
            main.appendChild(newCollection);
        });
        // groups in main
        this.props.main.groups.forEach(function(group) {
            var newGroup = xmlDoc.createElement('group');
            newGroup.setAttribute('id', group.id);
            newGroup.setAttribute('n', group.n);
            group.tasks.forEach(function(task) {
                var newTask = xmlDoc.createElement('task');
                newTask.textContent = task;
                newGroup.appendChild(newTask);
            });
            group.collections.forEach(function(collection) {
                var newCollection = xmlDoc.createElement('collection');
                newCollection.textContent = collection;
                newGroup.appendChild(newCollection);
            });

            main.appendChild(newGroup);
        });

        root.appendChild(main);

        xmlDoc.appendChild(root);

        var blob = new Blob([vkbeautify.xml((new XMLSerializer).serializeToString(xmlDoc))], {type: "text/plain;charset=utf-8"});
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
