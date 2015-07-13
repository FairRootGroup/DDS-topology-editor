/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var CollectionList = React.createClass({
    render: function() {
        var self = this;
        return (
            <div>
                {this.props.collections.map(function(collection, index) {
                    return <Collection
                                collection={collection}
                                collections={self.props.collections}
                                tasks={self.props.tasks}
                                onEditCollection={self.props.onEditCollection}
                                onRemoveCollection={self.props.onRemoveCollection}
                                key={index}
                                elementKey={index}
                            />;
                })}
            </div>
        );
    }
});

var Collection = React.createClass({
    getInitialState: function() {
        return {
            bodyVisible: false,
            invalidInput: false
        }
    },

    handleInputChange: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
    },

    hideEditCollectionButton: function(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.editCollectionBtn.toggle();
    },

    toggleBodyVisibility: function() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleEditCollection: function(e) {
        e.preventDefault();
        var self = this;
        if (e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var otherCollections = _.filter(this.props.collections, function(collections) {
            return collections.id !== self.props.collection.id;
        });
        if (_.some(otherCollections, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        this.props.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var updatedCollection = {
            id: e.target[0].form[0].value,
            tasks: selectedTasks
        }

        var nextCollections = this.props.collections;
        nextCollections[this.props.elementKey] = updatedCollection;

        this.refs.editCollectionBtn.toggle();
        this.props.onEditCollection(nextCollections);
    },

    handleRemoveCollection: function() {
        this.props.onRemoveCollection(this.props.elementKey);
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var ButtonInput = ReactBootstrap.Input;
        var TaskCheckboxes = [];
        var self = this;

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.collection.tasks.forEach(function(currentTask, i) {
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

        return (
            <div className="collection">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    {this.props.collection.id} 
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>
                    <span className="glyphicon glyphicon-remove" title="remove" onClick={this.handleRemoveCollection}></span>
                    <OverlayTrigger trigger="click" placement="right" ref="editCollectionBtn" onClick={this.handleInputChange} overlay={
                        <Popover className="add-cg-popover" title="edit collection">
                            <form onSubmit={this.handleEditCollection}>
                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } defaultValue={this.props.collection.id} />
                                <p>Tasks in this collection:</p>
                                {TaskCheckboxes}
                                <div className="row">
                                    <div className="col-xs-12">
                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditCollectionButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className="glyphicon glyphicon-edit" title="edit"></span>
                    </OverlayTrigger>
                </h5>
                <div className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    {this.props.collection.tasks}
                </div>
            </div>
        );
    }
});
