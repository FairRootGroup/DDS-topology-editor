/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';

import Requirement from './Requirement';

var RequirementList = React.createClass({
    propTypes: {
        requirements: React.PropTypes.array.isRequired,
        onRemoveRequirement: React.PropTypes.func.isRequired,
        onEditRequirement: React.PropTypes.func.isRequired
    },

    render() {
        var self = this;
        return (
            <div>
                {this.props.requirements.map(function(requirement, index) {
                    return <Requirement requirement={requirement}
                        requirements={self.props.requirements}
                        onRemoveRequirement={self.props.onRemoveRequirement}
                        onEditRequirement={self.props.onEditRequirement}
                        key={index}
                        elementKey={index}
                        />;
                })}
            </div>
        );
    }
});

export default RequirementList;
