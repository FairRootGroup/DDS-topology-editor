/** @jsx React.DOM */

/*
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 */

var TopologyEditor = React.createClass({
    getInitialState: function() {
        return {
            topologyName: 'new topology',
            tasks: [],
            collections: [],
            main: {
                name: 'main',
                tasks: [],
                collections: [],
                groups: []
            },
            invalidInput: false
        };
    },

    handleTopologyChange: function(topologyName, tasks, collections, main) {
        this.setState({
            topologyName: topologyName,
            tasks: tasks,
            collections: collections,
            main: main
        });
    },

    handleTopologyNameChange: function(topologyName) {
        this.setState({
            topologyName: topologyName
        });
    },

    handleInputChange: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
    },

    handleAddTask: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var nextTasks = this.state.tasks.concat([{
            inputs: [],
            outputs: [],
            name: e.target[0].form[0].value
        }]);
        this.refs.addTaskBtn.toggle();
        this.setState({
            tasks: nextTasks
        });
    },

    handleAddCollection: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        this.state.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.name);
            }
        });
        var nextCollections = this.state.collections.concat([{
            name: e.target[0].form[0].value,
            tasks: selectedTasks
        }]);
        this.refs.addCollectionBtn.toggle();
        this.setState({
            collections: nextCollections
        });
    },

    handleAddGroup: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        var selectedCollections = [];
        var tasksIndex = 0;
        this.state.tasks.forEach(function(task, index) {
            tasksIndex++;
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.name);
            }
        });
        this.state.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[tasksIndex+index+1].value; i++) {
                selectedCollections.push(collection.name);
            }
        });
        var nextGroups = this.state.main.groups.concat([{
            name: e.target[0].form[0].value,
            n: e.target[0].form[1].value,
            minRequired: e.target[0].form[2].value,
            tasks: selectedTasks,
            collections: selectedCollections
        }]);
        var nextMain = {
                name: this.state.main.name,
                tasks: this.state.main.tasks,
                collections: this.state.main.collections,
                groups: nextGroups
            }
        this.setState({
            main: nextMain
        });
        this.refs.addGroupBtn.toggle();
    },

    hideAddTaskButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addTaskBtn.toggle();
    },

    hideAddCollectionButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addCollectionBtn.toggle();
    },

    hideAddGroupButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.addGroupBtn.toggle();
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];

        this.state.tasks.forEach(function(task, i) {
            TaskCheckboxes.push(
                <div className="ct-box ct-box-task" key={"t-box" + i}>
                    <div className="element-name" title={task.name}>{task.name}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
                </div>
            );
        });

        this.state.collections.forEach(function(collection, i) {
            CollectionCheckboxes.push(
                <div className="ct-box ct-box-collection" key={"c-box" + i}>
                    <div className="element-name" title={collection.name}>{collection.name}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
                </div>
            );
        });

        return (
            <div>
                <TopBar topologyName={this.state.topologyName} onTopologyNameChange={this.handleTopologyNameChange} />

                <div className="container">
                    <div className="row">
                        <div className="col-xs-3">
                            <ul className="list-group left-pane">
                                <FileActions
                                    onFileLoad={this.handleTopologyChange}
                                    topologyName={this.state.topologyName}
                                    tasks={this.state.tasks}
                                    collections={this.state.collections}
                                    main={this.state.main}
                                />

                                <li className="list-group-item tasks-header">
                                    tasks
                                    <OverlayTrigger trigger="click" placement="right" ref="addTaskBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new task">
                                            <form onSubmit={this.handleAddTask}>
                                                <Input type="text" addonBefore="name" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } />
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <Input className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddTaskButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-task-btn" title="add new task"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item tasks">
                                    <TaskList tasks={this.state.tasks} />
                                </li>

                                <li className="list-group-item collections-header">
                                    collections
                                    <OverlayTrigger trigger="click" placement="right" ref="addCollectionBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new collection">
                                            <form onSubmit={this.handleAddCollection}>
                                                <Input type="text" addonBefore="name" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } />
                                                <p>Tasks in this collection:</p>
                                                {TaskCheckboxes}
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <Input className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddCollectionButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item collections">
                                    <CollectionList collections={this.state.collections} />
                                </li>

                                <li className="list-group-item groups-header">
                                    groups
                                    <OverlayTrigger trigger="click" placement="right" ref="addGroupBtn" onClick={this.handleInputChange} overlay={
                                        <Popover className="add-cg-popover" title="add new group">
                                            <form onSubmit={this.handleAddGroup}>
                                                <Input type="text" addonBefore="name" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } />
                                                <div className="row">
                                                    <div className="col-xs-4">
                                                        <Input type="number" min="1" step="1" addonBefore="n" defaultValue="1" />
                                                    </div>
                                                    <div className="col-xs-8">
                                                        <Input type="number" min="1" step="1" addonBefore="minRequired" defaultValue="1" />
                                                    </div>
                                                </div>
                                                <p>Tasks in this group:</p>
                                                {TaskCheckboxes}
                                                <p>Collections in this group:</p>
                                                {CollectionCheckboxes}
                                                <div className="row">
                                                    <div className="col-xs-12">
                                                        <Input className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddGroupButton}>cancel</Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item groups">
                                    <GroupList groups={this.state.main.groups} />
                                </li>

                                <Commands />
                            </ul>
                        </div>
                        <div className="col-xs-9">
                            <MainEditor tasks={this.state.tasks} collections={this.state.collections} main={this.state.main} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var Commands = React.createClass({
    render: function() {
        return (
            <li className="list-group-item">
                
            </li>
        );
    }
});
