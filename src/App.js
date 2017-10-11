import Papa from 'papaparse';
import EventEmitter from 'events';
import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Navbar from 'react-bootstrap/lib/Navbar';
import sql from 'sql.js';
import Grid from './Grid';

const emitter = new EventEmitter();

const parse = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: ({data}) => {
        resolve(data);
      },
      error: reject,
    });
  })
};

const createDB = (data) => {
  const db = new sql.Database();

  const cols = data.shift();

  const query = `CREATE TABLE csv (${cols.map((col) => `${col} TEXT`).join(',')});`;
  db.run(query);

  const insertStmt = db.prepare(`INSERT INTO csv VALUES (${cols.map((val) => '?').join(',')})`);
  for (const row of data) {
    if (row.length !== cols.length) {
      console.log('skipping row', row);
      continue;
    }
    
    insertStmt.run(row);
  }
  insertStmt.free();

  return db;
};

const handleFile = async (e) => {
  try {
    emitter.emit('updateState', {
      status: 'parsing-file',
    });
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const data = await parse(file);

    emitter.emit('updateState', {
      status: 'creating-db',
    });

    const db = createDB(data);

    const res = db.exec("SELECT * FROM csv");
    console.log(res[0].columns, res[0].values);

    emitter.emit('updateState', {
      db,
      status: 'loaded',
    });
  } catch (err) {
    console.error(err);
    emitter.emit('updateState', {
      errorMsg: err.message,
      status: 'error',
    });
  }
};

const LoadCSVButton = () => {
  return (
    <FormGroup>
      <FormControl
          type="file"
          onChange={handleFile}
      />
    </FormGroup>
  );
};

class QueryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 'SELECT * FROM csv'};
  }

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    emitter.emit('runQuery', this.state.value);
  }

  render() {
    return (
      <Form inline onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>SQL Query</ControlLabel>
          {' '}
          <FormControl value={this.state.value} onChange={this.handleChange} />
        </FormGroup>
        {' '}
        <Button type="submit">Submit</Button>
      </Form>
    );
  };
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      db: undefined,
      errorMsg: undefined,
      query: '',
      result: undefined,
      status: 'init', // init, parsing-file, creating-db, loaded, running-query, error
    }
  }

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
              <a href="#">CSV SQL Live</a>
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>

        <div className="container">
          <LoadCSVButton />
          {this.state.status === 'error' ? <p>{this.state.errorMsg}</p> : null}
          {['loaded', 'running-query', 'error'].includes(this.state.status) ? <QueryForm /> : null}
          {this.state.result !== undefined ? <Grid cols={this.state.result.cols} rows={this.state.result.rows} /> : null}
        </div>
      </div>
    );
  }
}

export default App;
