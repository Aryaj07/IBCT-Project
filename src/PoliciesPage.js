import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const web3 = new Web3(window.ethereum);

  const contractABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "nextPolicyId",
      "outputs": [
        { "name": "", "type": "uint256" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        { "name": "_policyId", "type": "uint256" }
      ],
      "name": "policies",
      "outputs": [
        { "name": "insured", "type": "address" },
        { "name": "premium", "type": "uint256" },
        { "name": "payoutAmount", "type": "uint256" },
        { "name": "policyType", "type": "string" },
        { "name": "status", "type": "uint8" },
        { "name": "claimTriggerTime", "type": "uint256" }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your contract's deployed address
  const insuranceContract = new web3.eth.Contract(contractABI, contractAddress);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch the next policy ID (which is used to calculate total policies)
      const nextPolicyId = await insuranceContract.methods.nextPolicyId().call();
      const policyCount = parseInt(nextPolicyId, 10);

      // Load all policies based on nextPolicyId
      const loadedPolicies = [];
      for (let i = 0; i < policyCount; i++) {
        try {
          const policy = await insuranceContract.methods.policies(i).call();
          
          // Skip uninitialized policies
          if (policy.insured === '0x0000000000000000000000000000000000000000') {
            continue; // Skip uninitialized policies
          }

          // Convert values from wei to ether
          policy.premium = web3.utils.fromWei(policy.premium, 'ether');
          policy.payoutAmount = web3.utils.fromWei(policy.payoutAmount, 'ether');

          loadedPolicies.push(policy);
        } catch (error) {
          console.error("Error loading policy", i, error);
        }
      }

      // Update the state with the loaded policies
      setPolicies(loadedPolicies);
    } catch (error) {
      setError('Error loading policies: ' + error.message);
      console.error("Error loading policies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <div>
      <h2>Insurance Policies</h2>

      {loading ? (
        <p>Loading policies...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div className="policy-list">
          {policies.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Policy ID</th>
                  <th>Policy Type</th>
                  <th>Premium (ETH)</th>
                  <th>Payout (ETH)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy, index) => (
                  <tr key={index}>
                    <td>{index}</td>
                    <td>{policy.policyType}</td>
                    <td>{policy.premium}</td>
                    <td>{policy.payoutAmount}</td>
                    <td>{policy.status === '0' ? 'Active' : 'Claimed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No policies available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PoliciesPage;
