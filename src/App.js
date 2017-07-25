import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap';

import ChainInfo from './components/ChainInfo.js'
import BidList from './components/BidList.js'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


import getWeb3 from './utils/getWeb3.js'
import EtherBidCoreContract from '../build/contracts/EtherBidCore.json'
const contract = require('truffle-contract')
var EtherBidCore = contract(EtherBidCoreContract)
getWeb3.then(res => {
  var web3 = res.web3
  EtherBidCore.setProvider(web3.currentProvider)
  EtherBidCore.deployed().then((instance) => {
    instance.CreateBid.sendTransaction(600,100,1000, 0, {from: web3.eth.coinbase, to: instance.address, value: 10, gas: 3000000}).then((tx) => {
      //console.log(tx)
    })
  })
})


class App extends Component {
  constructor(props) {
    console.log("Loading App")
    super(props)
  }

  componentWillMount() {
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col><ChainInfo /></Col>
        </Row>
        <Row>
          <Col><BidList /></Col>
        </Row>
      </Container>
    )
  }
}

export default App
