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
            topologyName = '',
            tasks = [],
            collections = [],
            main = {},
            self = this,
            target = event.target;

        reader.onload = function() {
            var $xml = $(parser.parseFromString(reader.result, 'application/xml'));

            // topology name
            topologyName = $xml.find('topology').attr('name');

            // tasks
            $xml.find('topology>task').each(function() {
                var task = {};
                task.inputs = [];
                task.outputs = [];
                $.each(this.attributes, function(i, attrib) {
                    task[attrib.name] = attrib.value;
                });
                $(this).find('input').each(function() {
                    var input = {};
                    input.type = $(this).attr('type');
                    input.buffSize = $(this).attr('buffSize');
                    input.method = $(this).attr('method');
                    input.address = $(this).attr('address');
                    input.port = $(this).attr('address').match(/\d+/)[0];
                    task.inputs.push(input);
                });
                $(this).find('output').each(function() {
                    var output = {};
                    output.type = $(this).attr('type');
                    output.buffSize = $(this).attr('buffSize');
                    output.method = $(this).attr('method');
                    output.address = $(this).attr('address');
                    output.port = $(this).attr('address').match(/\d+/)[0];
                    task.outputs.push(output);
                });
                tasks.push(task);
            });

            // collections
            $xml.find('topology>collection').each(function() {
                var collection = {};
                collection.tasks = [];
                collection.name = $(this).attr('name');
                $(this).find('task').each(function() {
                    collection.tasks.push($(this).attr('name'));
                });
                collections.push(collection);
            });

            // main
            $main = $xml.find('topology>main');
            main.name = $main.attr('name');
            main.tasks = [];
            main.collections = [];
            main.groups = [];

            $xml.find('topology>main>task').each(function() {
                main.tasks.push($(this).attr('name'));
            });
            $xml.find('topology>main>collection').each(function() {
                main.collections.push($(this).attr('name'));
            });

            // groups in main
            $xml.find('topology>main>group').each(function() {
                var group = {};
                group.tasks = [];
                group.collections = [];
                group.name = $(this).attr('name');
                group.n = $(this).attr('n');
                group.minRequired = $(this).attr('minRequired');
                $(this).find('task').each(function() {
                    group.tasks.push($(this).attr('name'));
                });
                $(this).find('collection').each(function() {
                    group.collections.push($(this).attr('name'));
                });
                main.groups.push(group);
            });

            // console.log(tasks);
            // console.log(collections);
            // console.log(main);

            self.props.onFileLoad(topologyName, tasks, collections, main);

            target.value = "";
        }

        reader.readAsText(event.target.files[0]);
    },

    handleFileSave: function() {
        var xmlDoc = document.implementation.createDocument("", "", null);
        var root = xmlDoc.createElement("topology");
        root.setAttribute("name", this.props.topologyName);

        // tasks
        this.props.tasks.forEach(function(task) {
            var newTask = xmlDoc.createElement("task");
            _.forIn(task, function(prop, key) {
                if(key !== "inputs" && key !== "outputs") {
                    newTask.setAttribute(key, prop);
                }
            });
            task.inputs.forEach(function(input) {
                var newInput = xmlDoc.createElement("input");
                newInput.setAttribute("type", input.type);
                newInput.setAttribute("buffSize", input.buffSize);
                newInput.setAttribute("method", input.method);
                newInput.setAttribute("address", input.address);
                newTask.appendChild(newInput);
            });
            task.outputs.forEach(function(output) {
                var newOutput = xmlDoc.createElement("output");
                newOutput.setAttribute("type", output.type);
                newOutput.setAttribute("buffSize", output.buffSize);
                newOutput.setAttribute("method", output.method);
                newOutput.setAttribute("address", output.address);
                newTask.appendChild(newOutput);
            });

            root.appendChild(newTask);
        });

        // collections
        this.props.collections.forEach(function(collection) {
            var newCollection = xmlDoc.createElement("collection");
            newCollection.setAttribute("name", collection.name);
            collection.tasks.forEach(function(task) {
                var newTask = xmlDoc.createElement("task");
                newTask.setAttribute("name", task);
                newCollection.appendChild(newTask);
            });

            root.appendChild(newCollection);
        });

        // main
        var main = xmlDoc.createElement("main");
        main.setAttribute("name", this.props.main.name);
        // tasks in main
        this.props.main.tasks.forEach(function(task) {
            var newTask = xmlDoc.createElement("task");
            newTask.setAttribute("name", task);

            main.appendChild(newTask);
        });
        // collections in main
        this.props.main.collections.forEach(function(collection) {
            var newCollection = xmlDoc.createElement("collection");
            newCollection.setAttribute("name", collection);

            main.appendChild(newCollection);
        });
        // groups in main
        this.props.main.groups.forEach(function(group) {
            var newGroup = xmlDoc.createElement("group");
            newGroup.setAttribute("name", group.name);
            newGroup.setAttribute("n", group.n);
            newGroup.setAttribute("minRequired", group.minRequired);
            group.tasks.forEach(function(task) {
                var newTask = xmlDoc.createElement("task");
                newTask.setAttribute("name", task);
                newGroup.appendChild(newTask);
            });
            group.collections.forEach(function(collection) {
                var newCollection = xmlDoc.createElement("collection");
                newCollection.setAttribute("name", collection);
                newGroup.appendChild(newCollection);
            });

            main.appendChild(newGroup);
        });

        root.appendChild(main);

        xmlDoc.appendChild(root);

        var blob = new Blob([vkbeautify.xml((new XMLSerializer).serializeToString(xmlDoc))], {type: "text/plain;charset=utf-8"});
        saveAs(blob, this.props.topologyName + ".xml");
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
