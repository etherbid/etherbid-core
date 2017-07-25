import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3.js'

import { Container, Row, Col } from 'reactstrap'
import { Progress } from 'reactstrap'


import './css/ChainInfo.css'

class ChainInfo extends Component {
  constructor(props) {
    console.log("Loading ChainInfo")
    super(props)

    this.state = {
      blockNumber: 0,
      blockHash: undefined,
      blockTime: 0,
      blockTimeAvg: 5000,
    }

    this.totalTime = 0;
    this.totalBlocks = 0;

  }

  componentWillMount() {
    this.interval = setInterval(() => this.setState({ blockTime: this.state.blockTime + 100}), 100);

    getWeb3.then((res) => {
    	var web3 = res.web3

    	web3.eth.filter('latest').watch((err, res) =>{
    		if (!err) {

    			this.totalBlocks += 1
    			this.totalTime += this.state.blockTime

    			var block = web3.eth.getBlock(res)
    			this.setState({
    				blockNumber: block.number,
    				blockHash: block.hash,
    				blockTime: 0,
    				blockTimeAvg: this.totalTime/this.totalBlocks
    			})
    		}
    	})
    })
  }

  render() {
    return(
      <Container fluid className="chaininfo">
        <Row>
          <Col xs="2">
            <b>Block Number:</b><br/>
            {this.state.blockNumber}
          </Col>
          <Col xs="2">
            <b>{Math.round(this.state.blockTime/1000)}</b>
          </Col>
          <Col xs="2">
            <b>Hash:</b><br/>
            {this.state.blockHash}
          </Col>
        </Row>
        <Row>
          <Col>
            <Progress value={100*this.state.blockTime/this.state.blockTimeAvg} />
          </Col>
        </Row>
      </Container>
    )
  }
}


export default ChainInfo