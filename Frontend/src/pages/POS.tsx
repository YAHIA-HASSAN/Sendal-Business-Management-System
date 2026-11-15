import { Component } from 'react'
import SearchForm from '../components/SearchForm/SearchForm'
import Purchase from '../components/Purchase/Purchase'


export class POS extends Component {
  render() {
    return (
      <div id='pos' className='page flex'>
        <SearchForm/>
        <Purchase/>
      </div>
    )
  }
}

export default POS
