/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';

import Group from './Group';

import store from '../Store';

@observer export default class GroupList extends Component {
  shouldComponentUpdate = () => true

  render() {
    return (
      <Fragment>
        {store.main.groups.map((g, i) => {
          return <Group group={g} key={i} index={i} />;
        })}
      </Fragment>
    );
  }
}
