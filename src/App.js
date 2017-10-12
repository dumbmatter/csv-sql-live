import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Navbar from 'react-bootstrap/lib/Navbar';
import Grid from './Grid';
import LoadData from './LoadData';
import QueryForm from './QueryForm';
import emitter from './emitter';

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
      console.log(res[0].columns, res[0].values);

      this.setState({
        result: {
          cols: res[0].columns,
          rows: res[0].values,
        },
        status: 'loaded',
      });
    });
  }

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
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
