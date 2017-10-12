import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Navbar from 'react-bootstrap/lib/Navbar';
import Grid from './Grid';
import LoadData from './LoadData';
import QueryForm from './QueryForm';
import emitter from './emitter';

import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
PropTypes.component = PropTypes.element;
React.PropTypes = PropTypes;
React.createClass = createReactClass;

const initialState = {
  db: undefined,
  errorMsg: undefined,
  query: '',
  result: undefined,
  status: 'init', // init, parsing-data, creating-db, loaded, running-query, error
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  handleNewClick = () => {
    if (this.state.db !== undefined) {
      this.state.db.close();
    }

    this.setState(initialState);
  };

  componentDidMount() {
    emitter.on('updateState', (state) => {
      console.log('updateState', state);
      this.setState(state);
    });

    emitter.on('runQuery', (query) => {
      console.log('runQuery', query);
      this.setState({
        status: 'running-query',
      });

      const res = this.state.db.exec(query);

      const result = res.length === 0 ? {
        cols: [],
        rows: [],
      } : {
        cols: res[res.length - 1].columns,
        rows: res[res.length - 1].values,
      };

      this.setState({
        result,
        status: 'loaded',
      });
    });
  }

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand style={{color: '#000'}}>
              CSV SQL Live
            </Navbar.Brand>
          </Navbar.Header>
          {this.state.status !== 'init' ? <Navbar.Form pullRight>
            <Button bsStyle="danger" onClick={this.handleNewClick}>Load New CSV</Button>
          </Navbar.Form> : null}
        </Navbar>

        <div className="container">        
          {this.state.status === 'init' ? <LoadData /> : null }
          {this.state.status === 'error' ? <p>{this.state.errorMsg}</p> : null}
          {['loaded', 'running-query', 'error'].includes(this.state.status) ? <QueryForm /> : null}
          {this.state.result !== undefined ? <Grid cols={this.state.result.cols} rows={this.state.result.rows} /> : null}
        </div>
      </div>
    );
  }
}

export default App;
