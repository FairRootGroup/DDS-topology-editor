/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var MainEditor = React.createClass({
    render: function() {
        return (
            <MainTask />
        );
    }
});

var MainTask = React.createClass({
    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <p className="panel-title">Topology</p>
                </div>
                <div className="panel-body">
                    main content
                </div>
            </div>
        );
    }
});
