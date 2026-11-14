import React, { Component } from 'react'
import Table from '../components/Table/Table'

export class Bills extends Component {
  render() {
    return (
      <div id='bills' className='page'>
        <Table/>
      </div>
    )
  }
}

export default Bills
