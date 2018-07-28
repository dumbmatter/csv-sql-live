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
    createDB(data);

  } catch (err) {
    console.error(err);
    emitter.emit('updateState', {
      errorMsg: err.message,
      status: 'loading-error',
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

const AddNewCSVForm = () => {
  return <div>
    <div className="row">
      <div className="col-xs-12 col-md-6">
        <p>
          With CSV SQL Live you can <strong className="text-success">run SQL queries on data from CSV files</strong>, right in your browser!
        </p>
      </div>
      <div className="col-xs-12 col-md-6">
        <p>
          <strong className="text-success">Your data will not leave your computer.</strong> Processing is done in your browser. No servers involved.
        </p>
      </div>
    </div>

    <div style={{fontSize: '18px', marginTop: '3em'}}>
      <div style={{textAlign: 'center'}}>
        <LoadCSVButton />
      </div>
    </div>
  </div>;
};

export default AddNewCSVForm;
