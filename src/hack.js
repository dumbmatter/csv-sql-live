// https://github.com/adazzle/react-data-grid/issues/744

import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';

PropTypes.component = PropTypes.element;
React.PropTypes = PropTypes;
React.createClass = createReactClass;
