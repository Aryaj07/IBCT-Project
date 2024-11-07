// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import Chainlink Oracle to fetch external data (like flight data, weather, etc.)
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DecentralizedInsurance {
    address public owner;

    enum PolicyStatus { Active, Claimed, Expired }

    struct Policy {
        address insured;        // Address of the insured party
        uint256 premium;        // Premium paid for the policy
        uint256 payoutAmount;   // Amount to be paid out in case of claim
        string policyType;      // Type of policy (e.g., Travel, Crop, Home)
        PolicyStatus status;    // Current status of the policy (Active, Claimed, Expired)
        uint256 claimTriggerTime; // Time when claim conditions should be checked
    }

    // Mapping of policyID to Policy
    mapping(uint256 => Policy) public policies;
    uint256 public nextPolicyId;

    // Event that gets emitted when a new policy is created
    event PolicyCreated(uint256 policyId, address insured, uint256 premium, uint256 payoutAmount, string policyType);
    // Event emitted when a claim is processed
    event ClaimProcessed(uint256 policyId, uint256 payoutAmount);

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict access to only the contract owner (insurance company)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to create a new insurance policy
    function createPolicy(
        address _insured,          // Address of the insured party
        string memory _policyType, // Type of the policy (e.g., Travel, Crop, Home)
        uint256 _premium,          // Premium amount
        uint256 _payoutAmount,     // Payout amount in case of claim
        uint256 _claimTriggerTime  // Time when claim conditions should be checked
    ) external payable {
        require(msg.value == _premium, "Premium must be paid in full");

        policies[nextPolicyId] = Policy({
            insured: _insured,               // Set the insured address (could be the caller or a different address)
            premium: _premium,               // Set the premium paid
            payoutAmount: _payoutAmount,     // Set the payout amount
            policyType: _policyType,         // Set the policy type
            status: PolicyStatus.Active,     // Set the status as active initially
            claimTriggerTime: _claimTriggerTime // Set the claim trigger time
        });

        emit PolicyCreated(nextPolicyId, _insured, _premium, _payoutAmount, _policyType);
        nextPolicyId++;
    }

    function fetchExternalData() internal pure returns (bool) {
        // Your logic here for fetching external data like flight/weather info
        return true; // Placeholder: Assume external data matches the claim condition
    }

    // Function to process a claim (called by oracles or owner once the condition is met)
    function processClaim(uint256 _policyId) external onlyOwner {
        Policy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy is not active");
        require(block.timestamp >= policy.claimTriggerTime, "Claim trigger time not reached");
        require(fetchExternalData(), "Claim conditions not met");

        policy.status = PolicyStatus.Claimed;

        // Transfer payout to the insured party
        payable(policy.insured).transfer(policy.payoutAmount);

        emit ClaimProcessed(_policyId, policy.payoutAmount);
    }

    // Owner can withdraw unused premiums
    function withdrawPremiums(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance in contract");
        payable(owner).transfer(_amount);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
