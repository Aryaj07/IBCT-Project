const Web3 = require('web3');

// Replace with your provider URL and contract ABI
const web3 = new Web3('https://your-provider-url');
const contractAddress = '0x4bCD105E1Dc3a3d467e3bFB23f594fCc8411a9DA';
const contractABI = [[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "policyId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payoutAmount",
				"type": "uint256"
			}
		],
		"name": "ClaimProcessed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "policyId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "insured",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "premium",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payoutAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "policyType",
				"type": "string"
			}
		],
		"name": "PolicyCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_policyType",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_premium",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_payoutAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_claimTriggerTime",
				"type": "uint256"
			}
		],
		"name": "createPolicy",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextPolicyId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "policies",
		"outputs": [
			{
				"internalType": "address",
				"name": "insured",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "premium",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "payoutAmount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "policyType",
				"type": "string"
			},
			{
				"internalType": "enum DecentralizedInsurance.PolicyStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "claimTriggerTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_policyId",
				"type": "uint256"
			}
		],
		"name": "processClaim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdrawPremiums",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]];

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function fetchPolicies() {
  const userAddress = '0xYourUserAddress'; // Replace with the user's address

  // Assuming you want to fetch all policies for the user
  const policyCount = await contract.methods.nextPolicyId().call();

  for (let i = 0; i < policyCount; i++) {
    const policy = await contract.methods.policies(i).call();

    if (policy.insured === userAddress) {
      console.log(`Policy ID: ${i}`);
      console.log(`Insured: ${policy.insured}`);
      console.log(`Premium: ${policy.premium}`);
      console.log(`Payout Amount: ${policy.payoutAmount}`);
      console.log(`Policy Type: ${policy.policyType}`);
      console.log(`Status: ${policy.status}`);
      console.log(`Claim Trigger Time: ${policy.claimTriggerTime}`);
      console.log('--------------------');
    }
  }
}

fetchPolicies();