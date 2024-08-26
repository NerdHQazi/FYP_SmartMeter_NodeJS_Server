require('dotenv').config();
var express = require('express');
var router = express.Router();
const SmartMeter = require('../model/schema');

let smartMeterId = process.env.SMART_METER_ID;

router.post('/connect', async function(req, res, next) {
    const {voltage, current, energy, frequency, power, power_factor} = req.body;
    try {
        let smartMeterData = await SmartMeter.findOne({smartMeterAddress: smartMeterId});
        if(!smartMeterData) {
            smartMeterData = new SmartMeter({
                smartMeterAddress: smartMeterId,
                energyUsage: 0,
                energyBalance: 0
            });
            await smartMeterData.save()
        } else {
            smartMeterData.energyUsage = energy;
            smartMeterData.energyBalance = smartMeterData.energyBalance - (energy - smartMeterData.energyUsage);
            await smartMeterData.save()
        }
        return res.status(201).json({
            energy_balance: smartMeterData.energyBalance,
        })
    } catch (e) {
        res.status(-100).send('Error retrieving energy balance');
    } 
});


router.post('/readings', async function(req, res, next) {
    const {voltage, current, energy, frequency, power, power_factor} = req.body;
    try {
        let smartMeterData = await SmartMeter.findOne({smartMeterAddress: smartMeterId});
        if(!smartMeterData) {
            smartMeterData = new SmartMeter({
                smartMeterAddress: smartMeterId,
                energyUsage: 0,
                energyBalance: 0
            });
            await smartMeterData.save()
        } else {
            smartMeterData.energyUsage = energy;
            smartMeterData.energyBalance = smartMeterData.energyBalance - (energy - smartMeterData.energyUsage);
            await smartMeterData.save()
        }
        return res.status(201).json({
            energy_balance: smartMeterData.energyBalance,
        })
    } catch (e) {
        res.status(-100).send('Error retrieving energy balance');
    }
});



module.exports = router;
