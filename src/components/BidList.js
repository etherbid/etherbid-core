import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3.js'

import { Container } from 'reactstrap'

import Bid from './Bid.js'

import EtherBidCoreContract from '../../build/contracts/EtherBidCore.json'

import './css/BidList.css'

class BidList extends Component {
  constructor(props) {
    console.log("Loading BidList")
    super(props)

    this.state = {
    	listBidID: []
    }
  }

  componentWillMount() {
    getWeb3.then((res) => {
    	var web3 = res.web3

    	const contract = require('truffle-contract')
    	this.etherBidCore = contract(EtherBidCoreContract)
    	this.etherBidCore.setProvider(web3.currentProvider)

    	this.etherBidCore.deployed().then((instance) => {
    		// TODO: 1 = BidState.Open
    		instance.GetListBidLen(1).then((len) => {
    			for (var i = 0 ; i < len ; i++) {
    				// TODO: 1 = BidState.Open
    				instance.GetListBidID(1, i).then((bidID) => {
    					this.setState({
    						listBidID: this.state.listBidID.concat([bidID])
    					})
    				})
    			}
    		})
    	})
    })
  }

  render() {
    return(
      <Container fluid className="bidlist">
        {this.state.listBidID.map((bidID)=>{
          return <Bid id={bidID.toString()} />
        })}
      </Container>
    )
  }
}

export default BidList