/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var MainEditor = React.createClass({
    getInitialState: function() {
        return {
            IdBeeingEdited: false
        }
    },

    toggleEditing: function() {
        this.setState({ beeingEdited: !this.state.beeingEdited })
    },

    handleEditId: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            return;
        }
        var updatedProperty = {
            id: e.target[0].form[0].value
        };
        var nextMain = {
            id: e.target[0].form[0].value,
            tasks: this.props.main.tasks,
            collections: this.props.main.collections,
            groups: this.props.main.groups
        };

        this.toggleEditing();
        this.props.onEditMain(nextMain);
    },

    hideEditTasksInMainBtn: function(e) {
        e.preventDefault();
        this.refs.editTasksInMainBtn.toggle();
    },

    hideEditCollectionsInMainBtn: function(e) {
        e.preventDefault();
        this.refs.editCollectionsInMainBtn.toggle();
    },

    handleEditTasksInMain: function(e) {
        e.preventDefault();

        var selectedTasks = [];
        this.props.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var nextMain = {
            id: this.props.main.id,
            tasks: selectedTasks,
            collections: this.props.main.collections,
            groups: this.props.main.groups
        };

        this.refs.editTasksInMainBtn.toggle();
        this.props.onEditMain(nextMain);
    },

    handleEditCollectionsInMain: function(e) {
        e.preventDefault();

        var selectedCollections = [];
        this.props.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[index].value; i++) {
                selectedCollections.push(collection.id);
            }
        });
        var nextMain = {
            id: this.props.main.id,
            tasks: this.props.main.tasks,
            collections: selectedCollections,
            groups: this.props.main.groups
        };

        this.refs.editCollectionsInMainBtn.toggle();
        this.props.onEditMain(nextMain);
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var ButtonInput = ReactBootstrap.ButtonInput;
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];
        var self = this;

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.main.tasks.forEach(function(currentTask, i) {
                if (task.id === currentTask) {
                    count++;
                }
            }); 
            TaskCheckboxes.push(
                <div className="ct-box ct-box-task" key={"t-box" + i}>
                    <div className="element-name" title={task.id}>{task.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        this.props.collections.forEach(function(collection, i) {
            var count = 0;
            self.props.main.collections.forEach(function(currentCollection, i) {
                if (collection.id === currentCollection) {
                    count++;
                }
            }); 
            CollectionCheckboxes.push(
                <div className="ct-box ct-box-collection" key={"c-box" + i}>
                    <div className="element-name" title={collection.id}>{collection.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.state.beeingEdited ?
                        <form onSubmit={this.handleEditId}>
                            <strong>id: </strong>
                            <input className="form-control" type="text" autoFocus defaultValue={this.props.main.id}></input>
                            <button className="btn btn-xs btn-primary" type="submit">ok</button>
                        </form>
                        :
                        <p className="panel-title" onClick={this.toggleEditing}>{this.props.main.id}</p>
                    }
                </div>
                <div id="main-editor-body" className="panel-body">
                    <div className="row">
                        <div className="col-xs-4 centered main-element main-element-tasks">
                            <h5 className="main-header">
                                tasks in main
                                <OverlayTrigger trigger="click" placement="bottom" ref="editTasksInMainBtn" overlay={
                                    <Popover className="add-cg-popover" title="modify tasks in main">
                                        <form onSubmit={this.handleEditTasksInMain}>
                                            <p>Tasks in main:</p>
                                            {TaskCheckboxes}
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditTasksInMainBtn}>cancel</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Popover>
                                }>
                                    <span className="glyphicon glyphicon-edit add-task-btn edit-main-btn" title="edit tasks in main"></span>
                                </OverlayTrigger>
                            </h5>
                            <div className="group-tasks">{this.props.main.tasks}</div>
                        </div>
                        <div className="col-xs-4 centered main-element main-element-collections">
                            <h5 className="main-header">
                                collections in main
                                <OverlayTrigger trigger="click" placement="bottom" ref="editCollectionsInMainBtn" overlay={
                                    <Popover className="add-cg-popover" title="modify collections in main">
                                        <form onSubmit={this.handleEditCollectionsInMain}>
                                            <p>Collections in main:</p>
                                            {CollectionCheckboxes}
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditCollectionsInMainBtn}>cancel</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Popover>
                                }>
                                    <span className="glyphicon glyphicon-edit add-collection-btn edit-main-btn" title="edit collections in main"></span>
                                </OverlayTrigger>
                            </h5>
                            <div className="group-collections">{this.props.main.collections}</div>
                        </div>
                        <div className="col-xs-4 centered main-element main-element-groups">
                            <h5 className="main-header">groups</h5>
                            {this.props.main.groups.map(function(group, index) {
                                return <div className="group-groups" key={index}><span>{group.id} ({group.n})</span></div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

