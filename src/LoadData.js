import Papa from 'papaparse';
import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import sql from 'sql.js';
import emitter from './emitter';

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
  emitter.emit('updateState', {
    status: 'creating-db',
  });

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

  emitter.emit('updateState', {
    db,
    status: 'loaded',
  });

  return db;
};

const handleFile = async (e) => {
  try {
    emitter.emit('updateState', {
      status: 'parsing-data',
    });
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    const data = await parse(file);
    const db = createDB(data);

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
      <ControlLabel className="btn btn-primary btn-lg">
        Select CSV File
        <FormControl
            type="file"
            onChange={handleFile}
            style={{display: 'none'}}
        />
      </ControlLabel>
    </FormGroup>
  );
};

class TextCSVForm extends Component {
  constructor(props) {
    super(props);
    this.state = {csvText: ''};
  }

  handleChange = (e) => {
    this.setState({csvText: e.target.value});
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    try {
      emitter.emit('updateState', {
        status: 'parsing-data',
      });

      const data = await parse(this.state.csvText);
      const db = createDB(data);

    } catch (err) {
      console.error(err);
      emitter.emit('updateState', {
        errorMsg: err.message,
        status: 'error',
      });
    }
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <FormGroup controlId="csv-text">
        <ControlLabel>
          Paste a CSV file here
        </ControlLabel>
        <FormControl
          componentClass="textarea"
          onChange={this.handleChange}
          rows={10}
          value={this.state.csvText}
        />
      </FormGroup>
      <Button type="submit">Submit</Button>
    </form>;
  }
}

const LoadData = () => {
  return <div>
    <div className="row">
      <div className="col-xs-12 col-md-4">
        <p>
          With CSV SQL Live you can run SQL queries on data from a CSV file, right in your browser! Powered by <a href="http://papaparse.com/">Papa Parse</a>, <a href="https://github.com/kripken/sql.js/">sql.js</a>, and <a href="https://www.sqlite.org/">SQLite</a>.
        </p>
      </div>
      <div className="col-xs-12 col-md-4">
        <p>
          <span className="text-danger">This is not perfectly accurate.</span> Some files will not parse correctly. If your too file is large, it might freeze your browser.
        </p>
      </div>
      <div className="col-xs-12 col-md-4">
        <p>
          <span className="text-success">Your data will not leave your computer.</span> Processing is done client-side on your machine. Nothing is sent to any remote server.
        </p>
      </div>
    </div>

    <div style={{fontSize: '18px', marginTop: '3em'}}>
      <div style={{textAlign: 'center'}}>
        <LoadCSVButton />
        <p style={{margin: '2em 0'}}>or</p>
      </div>
      <TextCSVForm />
    </div>
  </div>;
};

export default LoadData;
