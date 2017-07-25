import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3.js'

import { Card, CardImg, CardBlock, CardTitle, CardSubtitle, CardText, Button } from 'reactstrap'

import EtherBidCoreContract from '../../build/contracts/EtherBidCore.json'

import './css/Bid.css'


Number.prototype.toHHMMSS = function () {
    var hours   = Math.floor(this / 3600);
    var minutes = Math.floor((this - (hours * 3600)) / 60);
    var seconds = this - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


class Bid extends Component {
  constructor(props) {
    console.log("Loading Bid " + props.id)
    super(props)

    this.BidApply = this.BidApply.bind(this);

    this.state = {
      id: props.id,

      bounty: 0,
      InitialCountdown: 0,
      applyIncrement: 0,
      applyFees: 0,

      state: 0,
      baseCountdown: 0,
      currentCountdown: 0,
      currentWinner: 0x00,
      currentPrice: 0,
    }
  }

  componentWillMount() {
  	this.updateStaticInfo()
  	this.updateDynamicInfo()

  	this.interval = setInterval(() => {
  		if (this.state.currentCountdown > 0) {
  			this.setState({ currentCountdown: this.state.currentCountdown - 1})
  		}
  	}, 1000);

  	// TODO: Implement update using events
  	getWeb3.then((res) => {
  		var web3 = res.web3
  		web3.eth.filter('latest').watch((error, result) => {
  			this.updateDynamicInfo()
  		})
  	})
  }

  updateStaticInfo() {
  	console.log("updateStaticInfo " + this.state.id)
  	getWeb3.then((res) => {
     	var web3 = res.web3

    	const contract = require('truffle-contract')
    	this.etherBidCore = contract(EtherBidCoreContract)
    	this.etherBidCore.setProvider(web3.currentProvider)

    	this.etherBidCore.deployed().then((instance) => {
    		instance.GetBidStaticInfo(this.state.id).then((staticInfo) => {
    			this.setState({
      				bounty: staticInfo[0].toString(),
      				InitialCountdown: staticInfo[1].toString(),
      				applyIncrement: staticInfo[2].toString(),
      				applyFees: staticInfo[3].toString(),
    			})
    		})
    	}) 		
  	})
  }

  updateDynamicInfo() {
  	console.log("updateDynamicInfo " + this.state.id)
  	getWeb3.then((res) => {
     	var web3 = res.web3

    	const contract = require('truffle-contract')
    	this.etherBidCore = contract(EtherBidCoreContract)
    	this.etherBidCore.setProvider(web3.currentProvider)

    	this.etherBidCore.deployed().then((instance) => {
    		instance.GetBidDynamicInfo(this.state.id).then((dynamicInfo) => {
    			this.setState({
      				state: dynamicInfo[0].toString(),
      				baseCountdown: dynamicInfo[1].toString(),
      				currentCountdown: dynamicInfo[2].toString(),
      				currentWinner: dynamicInfo[3].toString(),
      				currentPrice: dynamicInfo[4].toString(),
    			})
    		})
    	}) 		
  	})
  } 

  BidApply() {
  	getWeb3.then((res) => {
     	var web3 = res.web3

    	const contract = require('truffle-contract')
    	var etherBidCore = contract(EtherBidCoreContract)
    	etherBidCore.setProvider(web3.currentProvider)

    	etherBidCore.deployed().then((instance) => {
      		console.log("Apply " + this.state.id)
      		instance.ApplyBid.sendTransaction(this.state.id, {from: web3.eth.coinbase, to: instance.address, value: this.state.applyFees*2, gas: 3000000}).then((tx) => {
        		console.log(tx)
      		})
    	})
  	})
  }

  render() {
    return(
      <Card className="bid" id={this.state.id}>
		<CardImg top width="40%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
        <CardBlock>
          <CardTitle>Bounty: {this.state.bounty}</CardTitle>
          <CardSubtitle>{this.state.currentWinner}</CardSubtitle>
          <CardText><b>{this.state.currentCountdown.toHHMMSS()}</b><br /> {this.state.currentPrice}</CardText>
          <Button color="danger" onClick={this.BidApply}>Apply</Button>
        </CardBlock>     	
      </Card>
    )
  }
}

export default Bid