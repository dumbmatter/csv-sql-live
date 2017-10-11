import Papa from 'papaparse';
import EventEmitter from 'events';
import React, { Component } from 'react';
import sql from 'sql.js';
import logo from './logo.svg';
import './App.css';

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

  const res = db.exec("SELECT * FROM csv");
  console.log(res[0].columns, res[0].values);

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

    emitter.emit('updateState', {
      status: 'idle',
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
    <input
        type="file"
        onChange={handleFile}
    />
  );
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: undefined,
      fileData: undefined,
      query: '',
      resultCols: [],
      resultRows: [],
      status: 'idle', // idle, parsing-file, creating-db, running-query, error
    }
  }

  componentDidMount() {
      emitter.on('updateState', (state) => {
        console.log('updateState', state);
        this.setState(state);
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">CSV SQL Live!</h1>
        </header>
        <p className="App-intro">
          <LoadCSVButton />
        </p>
      </div>
    );
  }
}

export default App;
