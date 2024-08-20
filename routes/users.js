require('dotenv').config();
var express = require('express');
var router = express.Router();


const { ethers, JsonRpcProvider } = require('ethers');

const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const privateKey = process.env.PRIVATE_KEY; // Replace with your actual private key
const wallet = new ethers.Wallet(privateKey, provider);

// Define eNaira contract ABI and address
const eNairaAbi = require("../EnairaABI.json")
const smartMeterAbi = require("../SmartMeterContractABI.json")
const eNairaContractAddress = "0x8F8525b06E7994D5C81c29068f1D12749ab16753"; // Replace with your actual eNaira token contract address
const smartMeterAddress = "0x6030F493594e735C0A68012FdD19bC37C65cCeB0";


const eNairaContract = new ethers.Contract(eNairaContractAddress, eNairaAbi, wallet);
const smartMeterContract = new ethers.Contract(smartMeterAddress, smartMeterAbi, wallet);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/buy',async  function(req, res, next) {
  try {

    const eNairaAmount = ethers.parseEther("5")
    
    const approvalTx = await eNairaContract.approve(smartMeterAddress, eNairaAmount)
    console.log("Approval Transaction hash:", approvalTx.hash )

    await approvalTx.wait()

    console.log("Approval Transaction Confirmed");
    console.log("Purchasing energy units, please wait ...");

    const purchaseUnits = await smartMeterContract.purchaseEnergyUnits(2)
    await purchaseUnits.wait()

    


    return res.send('Energy bought');
  }
  catch (e) {
    console.log(e)
    return res.send('Error buying energy');
  }
});

module.exports = router;
