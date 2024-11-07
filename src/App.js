import React, { useState, useEffect } from 'react';
import web3 from './web3';
import contractABI from './contractABI.json';
import './App.css';

const contractAddress = '0x0cC30d35af745fEB38f0a66c39AaE0EcE3b2a376';
const insuranceContract = new web3.eth.Contract(contractABI, contractAddress);

const App = () => {
  const [account, setAccount] = useState('');
  const [insuredAddress, setInsuredAddress] = useState(''); // New state for insured address
  const [policyType, setPolicyType] = useState('');
  const [premium, setPremium] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [claimTriggerTime, setClaimTriggerTime] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccount();
    loadPolicies();
  }, []);

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Active',
      1: 'Claimed',
      2: 'Expired'
    };
    return statusMap[status] || 'Unknown';
  };
  
  const loadAccount = async () => {
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  };

  const loadPolicies = async () => {
    try {
      // Get the nextPolicyId from the contract (this indicates the number of policies)
      const nextPolicyId = await insuranceContract.methods.nextPolicyId().call();
      const policyCount = Number(nextPolicyId);
      console.log("Policy count:", policyCount);
  
      const loadedPolicies = [];
      for (let i = 0; i < policyCount; i++) {
        try {
          // Directly fetch the policy using the policyId (as a uint256)
          const policy = await insuranceContract.methods.policies(i).call();
          console.log("Policy fetched:", policy);
  
          if (policy.insured === '0x0000000000000000000000000000000000000000') {
            console.log(`Skipping empty insured policy ID: ${i}`);
            continue;
          }
  
          loadedPolicies.push(policy);
        } catch (error) {
          console.error("Error loading policy", i, error);
        }
      }
  
      console.log("Loaded policies:", loadedPolicies);
      setPolicies(loadedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
  };
  
  
  // const handleCreatePolicy = async () => {
  //   try {
  //     setLoading(true);
  //     const accounts = await web3.eth.getAccounts();
  //     const insured = insuredAddress || accounts[0]; // Use provided insured address or default to the sender's address

  //     const result = await insuranceContract.methods
  //       .createPolicy(
  //         insured, // Pass the insured address
  //         policyType, 
  //         web3.utils.toWei(premium, 'ether'), 
  //         web3.utils.toWei(payoutAmount, 'ether'), 
  //         claimTriggerTime
  //       )
  //       .send({ 
  //         from: accounts[0],
  //         value: web3.utils.toWei(premium, 'ether'), // Send the premium amount as msg.value
  //         gas: estimatedGas || 3000000 
  //       });

  //     console.log('Policy created successfully:', result);
  //     loadPolicies();
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("Error creating policy:", error);
  //     alert('Error creating policy: ' + error.message);
  //   }
  // };

  const handleCreatePolicy = async () => {
    try {
      setLoading(true);
      const accounts = await web3.eth.getAccounts();
      const insured = insuredAddress || accounts[0]; 
  
      // Define the gas estimation inside a try-catch block
      let estimatedGas;
      try {
        estimatedGas = await insuranceContract.methods
          .createPolicy(
            insured, 
            policyType, 
            web3.utils.toWei(premium, 'ether'), 
            web3.utils.toWei(payoutAmount, 'ether'), 
            claimTriggerTime
          )
          .estimateGas({ 
            from: accounts[0], 
            value: web3.utils.toWei(premium, 'ether') 
          });
  
        console.log("Estimated gas:", estimatedGas);
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        alert('Gas estimation failed: ' + gasError.message);
        setLoading(false);
        return; // Exit if gas estimation fails
      }
  
      // Proceed with sending the transaction if gas estimation succeeds
      const result = await insuranceContract.methods
        .createPolicy(
          insured, 
          policyType, 
          web3.utils.toWei(premium, 'ether'), 
          web3.utils.toWei(payoutAmount, 'ether'), 
          claimTriggerTime
        )
        .send({ 
          from: accounts[0],
          value: web3.utils.toWei(premium, 'ether'),  // Ensure premium is sent as Ether
          gas: estimatedGas || 3000000  // Use the estimated gas
        });
  
      console.log('Policy created successfully:', result);
      loadPolicies(); // Reload policies after successful creation
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error creating policy:", error);
      alert('Error creating policy: ' + error.message);
    }
  };
  

  const handleProcessClaim = async (policyId) => {
    try {
      setLoading(true);
  
      // Fetch the policy details from the contract
      const policy = await insuranceContract.methods.policies(policyId).call();
      console.log('Processing policy:', policy);
      const gasPrice = await web3.eth.getGasPrice();
      console.log("Current Gas Price:", gasPrice);

  
      // Check if the claim trigger time has passed
      if (Date.now() / 1000 < Number(policy.claimTriggerTime)) {
        alert('Claim trigger time has not been reached yet.');
        setLoading(false);
        return;
      }
  
      // Check the status of the policy
      if (Number(policy.status) !== 0) { // 0 indicates 'Active'
        alert('Policy is not active.');
        setLoading(false);
        return;
      }
          // Estimate gas for the transaction
      const estimatedGas = await insuranceContract.methods.processClaim(policyId).estimateGas({ from: account });
      console.log("Estimated Gas:", estimatedGas);

      // Proceed with claim processing using the estimated gas limit
      await insuranceContract.methods.processClaim(policyId).send({
        from: account,
        gas: estimatedGas, // Use estimated gas
        gasPrice: web3.utils.toWei('50', 'gwei') // Set a custom gas price (50 gwei in this example)
      });      

      loadPolicies();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error processing claim:", error);
      console.log('Error processing claim: ' + error.message);
    }
  };
  
  

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (  
    <div className="container">
      <h1>Decentralized Insurance Platform</h1>
      <div className="account-info">
        <p>Account: {account}</p>
      </div>

      <div className="policy-form">
        <h3>Create Insurance Policy</h3>
        <input
          type="text"
          placeholder="Insured Address (optional)"
          value={insuredAddress}
          onChange={(e) => setInsuredAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Policy Type"
          value={policyType}
          onChange={(e) => setPolicyType(e.target.value)}
        />
        <input
          type="text"
          placeholder="Premium (ETH)"
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payout Amount (ETH)"
          value={payoutAmount}
          onChange={(e) => setPayoutAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Claim Trigger Time (Unix timestamp)"
          value={claimTriggerTime}
          onChange={(e) => setClaimTriggerTime(e.target.value)}
        />
        <button className="btn" onClick={handleCreatePolicy} disabled={loading}>
          {loading ? 'Creating...' : 'Create Policy'}
        </button>
      </div>

      <div className="policy-list">
        <h3>Insurance Policies</h3>
        {policies.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Policy Type</th>
                <th>Premium (ETH)</th>
                <th>Payout (ETH)</th>
                <th>Status</th>
                <th>Claim Trigger Time</th>
                <th>Insured Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy, index) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{policy.policyType}</td>
                  <td>{web3.utils.fromWei(policy.premium, 'ether')}</td>
                  <td>{web3.utils.fromWei(policy.payoutAmount, 'ether')}</td>
                  <td>{getStatusText(Number(policy.status))}</td> {/* Use getStatusText here */}
                  <td>{formatDate(Number(policy.claimTriggerTime))}</td>
                  <td>{policy.insured}</td>
                  <td>
                      {Number(policy.status) === 0 && (
                        <button
                          className="btn-claim"
                          onClick={() => handleProcessClaim(index)}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Process Claim'}
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No policies available</p>
        )}
      </div>
    </div>
  );
};

export default App;
