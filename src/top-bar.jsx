/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var TopBar = React.createClass({
    render: function() {
        return (
            <nav className="navbar navbar-inverse" role="navigation">
                <div className="container">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                        <a className="navbar-brand" href="#">DDS Topology Editor</a>
                    </div>
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav">
                            <li className="active"><a href="#" className="topology-name">{this.props.topologyName}</a></li>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <a href="#" id="fluid-toggle"><span className="glyphicon glyphicon-transfer"></span></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
});
