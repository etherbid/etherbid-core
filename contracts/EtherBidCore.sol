pragma solidity ^0.4.11;

contract EtherBidCore {
  
  enum BidState { Undefined, Open, Closed, Claimed }
  struct Bid {
    // Static Information
    uint256 Bounty;
    int256 InitialCountdown;
    uint256 ApplyIncrement;
    uint256 ApplyFees;

    // Dynamic Information
    BidState State;
    int256 BaseCountdown;
    int256 CurrentCountdown;
    address CurrentWinner;
    uint256 CurrentPrice;

    // Internal Information
    uint256 CreatedTimestamp;
    uint256 LastTimestamp;
  }

  uint256 currentBidID = 0;
  mapping(uint256 => Bid) BidMap;
  mapping(uint256 => uint256[]) BidStateList;

  uint256 totalBounty = 0;

  function EtherBidCore() {

  }

  function _newBidID() internal returns(uint256) {
    uint256 newBidID = currentBidID;
    currentBidID += 1;
    return newBidID;
  }

  function _createBid(uint256 bounty, int256 initialCountdown, uint256 applyIncrement, uint256 applyFees, uint256 initialPrice) internal returns(uint256) {
    require(bounty > 0 && initialCountdown > 0 && applyIncrement > 0);

    uint256 bidID = _newBidID();

    BidMap[bidID] = Bid({
      Bounty: bounty,
      InitialCountdown: initialCountdown,
      ApplyIncrement: applyIncrement,
      ApplyFees: applyFees,

      State: BidState.Undefined,
      BaseCountdown: initialCountdown,
      CurrentCountdown: initialCountdown,
      CurrentWinner: 0x00,
      CurrentPrice: initialPrice,

      CreatedTimestamp: block.timestamp,
      LastTimestamp: block.timestamp
    });

    _setBidState(bidID, BidState.Open);

    return bidID;
  }

  function _setBidState(uint256 BidID, BidState State) internal {
    uint256 i;

    if (State == BidState.Open) {
      require(BidMap[BidID].State ==  BidState.Undefined);
      BidMap[BidID].State = BidState.Open;
      BidStateList[uint256(BidState.Open)].push(BidID);
    }

    if (State == BidState.Closed) {
      require( BidMap[BidID].State ==  BidState.Open);
      for (i = 0 ; i < BidStateList[uint256(BidState.Open)].length ; i++) {
        if (BidStateList[uint256(BidState.Open)][i] == BidID) {
          delete BidStateList[uint256(BidState.Open)][i];
        }
      }
      BidMap[BidID].State = BidState.Closed;
      BidStateList[uint256(BidState.Closed)].push(BidID);
    }

    if (State == BidState.Claimed) {
      require( BidMap[BidID].State ==  BidState.Closed);
      for (i = 0 ; i < BidStateList[uint256(BidState.Closed)].length ; i++) {
        if (BidStateList[uint256(BidState.Closed)][i] == BidID) {
          delete BidStateList[uint256(BidState.Closed)][i];
        }
      }
      BidMap[BidID].State = BidState.Claimed;
      BidStateList[uint256(BidState.Claimed)].push(BidID);
    }
  }

  function _updateBid(uint256 BidID) {
    // TODO: Evaluate the use of SafeMath here.
    if (BidMap[BidID].State == BidState.Open && BidMap[BidID].LastTimestamp != block.timestamp) {
      uint256 Time = block.timestamp - BidMap[BidID].LastTimestamp;
      BidMap[BidID].LastTimestamp = block.timestamp;
      BidMap[BidID].CurrentCountdown -= int256(Time);
      if (BidMap[BidID].CurrentCountdown <= 0) {
        BidMap[BidID].CurrentCountdown = 0;
        _setBidState(BidID, BidState.Closed);
      }
    }
  }


  function CreateBid(int256 initialCountdown, uint256 applyIncrement, uint256 applyFees, uint256 initialPrice) public payable returns(uint256) {
    uint256 bounty = msg.value;
    totalBounty += bounty;
    return _createBid(bounty, initialCountdown, applyIncrement, applyFees, initialPrice);
  }

  function GetBidStaticInfo(uint256 BidID) public constant returns(
    uint256 Bounty,
    int256 BaseCountdown,
    uint256 ApplyIncrement,
    uint256 ApplyFees) 
  {
    _updateBid(BidID);
    return(
      BidMap[BidID].Bounty,
      BidMap[BidID].InitialCountdown,
      BidMap[BidID].ApplyIncrement,
      BidMap[BidID].ApplyFees
    );
  }

  function GetBidDynamicInfo(uint256 BidID) public constant returns(
    BidState State,
    int256 BaseCountdown,
    int256 CurrentCountdown,
    address CurrentWinner,
    uint256 CurrentPrice)
  {
    _updateBid(BidID);
    return(
      BidMap[BidID].State,
      BidMap[BidID].BaseCountdown,
      BidMap[BidID].CurrentCountdown,
      BidMap[BidID].CurrentWinner,
      BidMap[BidID].CurrentPrice
    );
  }

  function ApplyBid(uint BidID) public payable {
    require(msg.value >= BidMap[BidID].ApplyFees);
    _updateBid(BidID);
    require(BidMap[BidID].State == BidState.Open);

    BidMap[BidID].CurrentWinner = msg.sender;
    BidMap[BidID].CurrentPrice += BidMap[BidID].ApplyIncrement;
    BidMap[BidID].CurrentCountdown = BidMap[BidID].BaseCountdown;
  }

  function ClaimBid(uint BidID) public payable {
    _updateBid(BidID);
    require(BidMap[BidID].State == BidState.Closed && msg.sender == BidMap[BidID].CurrentWinner && msg.value >= BidMap[BidID].CurrentPrice);
    // TODO: To be implemented.
  }

}