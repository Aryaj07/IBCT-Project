// src/components/Policies.js

import React, { useEffect, useState } from 'react';
import { fetchPolicies } from '../utils/fetch'; // Import the fetch function

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const userPolicies = await fetchPolicies();
        setPolicies(userPolicies);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Your Policies</h2>
      {policies.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>Insured</th>
              <th>Premium</th>
              <th>Payout Amount</th>
              <th>Policy Type</th>
              <th>Status</th>
              <th>Claim Trigger Time</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.policyId}>
                <td>{policy.policyId}</td>
                <td>{policy.insured}</td>
                <td>{policy.premium}</td>
                <td>{policy.payoutAmount}</td>
                <td>{policy.policyType}</td>
                <td>{policy.status}</td>
                <td>{policy.claimTriggerTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No policies found</div>
      )}
    </div>
  );
};

export default Policies;
