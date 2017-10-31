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
  status: 'init', // init, parsing-data, creating-db, loaded, loading-error, running-query, query-error
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
      this.setState(state);
    });

    emitter.on('runQuery', (query) => {
      this.setState({
        status: 'running-query',
      });

      try {
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
      } catch (err) {
        this.setState({
          errorMsg: err.message,
          status: 'query-error',
        });
      }
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
          {['loaded', 'running-query', 'query-error'].includes(this.state.status) ? <QueryForm /> : null}
          {['loading-error', 'query-error'].includes(this.state.status) ? <p className="alert alert-danger"><b>Error!</b> {this.state.errorMsg}</p> : null}
          {['init', 'loading-error'].includes(this.state.status) ? <LoadData /> : null }
          {this.state.result !== undefined ? <Grid cols={this.state.result.cols} rows={this.state.result.rows} /> : null}

          <div className="clearfix" />
          <hr />

          <footer>
            <p><a href="https://github.com/dumbmatter/csv-sql-live">View on GitHub</a></p>
          </footer>
        </div>
      </div>
    );
  }
}

export default App;
