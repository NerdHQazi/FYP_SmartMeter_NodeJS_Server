require('dotenv').config();
var express = require('express');
var router = express.Router();
const SmartMeter = require('../model/schema');
const Transaction = require('../model/transactionSchema');
const { ethers, JsonRpcProvider } = require('ethers');

let smartMeterId = process.env.SMART_METER_ID;

const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const privateKey = process.env.PRIVATE_KEY; // Replace with your actual private key
const wallet = new ethers.Wallet(privateKey, provider);

// Define eNaira contract ABI and address
const eNairaAbi = require("../EnairaABI.json")
const smartMeterAbi = require("../SmartMeterContractABI.json");
const eNairaContractAddress = process.env.ENAIRA_CONTACT_ADDRESS;
const smartMeterAddress = process.env.SMART_METER_ADDRESS;


const eNairaContract = new ethers.Contract(eNairaContractAddress, eNairaAbi, wallet);
const smartMeterContract = new ethers.Contract(smartMeterAddress, smartMeterAbi, wallet);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/me', async  (req, res) => {
  try {
    let eU = 0;
    let eB = 0;

    // Check if the user already has an entry
    let smartMeterData = await SmartMeter.findOne({ smartMeterAddress: smartMeterId });

    if (!smartMeterData) {
      // If no entry exists, create a new one
      smartMeterData = new SmartMeter({
        smartMeterAddress: smartMeterId,
        energyUsage: 0,
        energyBalance: 0,
      });
      // Save the data to the database
      await smartMeterData.save();
    } else {
      // If entry exists, update it
      eU = smartMeterData.energyUsage;
      eB = smartMeterData.energyBalance;
    }
    

    res.status(201).json({
      energyUsage: eU,   
      energyBalance: eB   
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(400).send('EError retrieving transactions')
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ smartMeter: smartMeterId });
    res.status(201).json(transactions)
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    res.status(400).send('Error retrieving transactions')
  }
})


router.post('/buy',async  function(req, res, next) {

  console.log(req.body);
  
  
  const {energyUnits, userAddress} = req.body;

  
  console.log(energyUnits);
  console.log(userAddress);

  try {

    let units = String(energyUnits);
    console.log(units);
    
    let address = String(userAddress);
    if(!units && !address.trim()) throw('Invalid value provided')

    const eNairaAmount = ethers.parseEther(units)
      
    const approvalTx = await eNairaContract.approve(smartMeterAddress, eNairaAmount, {
      from: address
    })
    console.log("Approval Transaction hash:", approvalTx.hash )

    await approvalTx.wait()

    console.log("Approval Transaction Confirmed");
    console.log("Purchasing energy units, please wait ...");

    const purchaseUnits = await smartMeterContract.purchaseEnergyUnits(units, {
      from: address
    })

    const transactionHash = purchaseUnits.hash;
    console.log(transactionHash);

    let smartMeterData = await SmartMeter.findOne({ smartMeterAddress: smartMeterId });

    if (!smartMeterData) {
      // If no entry exists, create a new one
      smartMeterData = new SmartMeter({
        smartMeterAddress: smartMeterId,
        energyUsage: 0,
        energyBalance: units,
      });
      // Save the data to the database
      await smartMeterData.save();
    } else {
      // If entry exists, update it
      smartMeterData.energyBalance = smartMeterData.energyBalance + Number(units)
      await smartMeterData.save()
    }


    const transaction = new Transaction({
      smartMeter: smartMeterId,
      energyUnits: units,
      transactionHash: transactionHash,
      cost: units,
    });

    await transaction.save();


    


    return res.status(201).send('Energy bought');
  }
  catch (e) {
    console.log(e)
    if(e.message === "Invalid value provided") return res.status(400).send("Invalid value provided")
    return res.status(500).send(e.message);
  }
});

module.exports = router;
