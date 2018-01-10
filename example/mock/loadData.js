'use strict';

const qs = require('qs');
//引入mock js
const mockjs = require('mockjs');

module.exports = {
    'POST /api/users': function (req, res) { 
        setTimeout(()=>{
            res.json({
                result : true,
                data: [{
                    name: `a-0-0${new Date().getTime()}`,
                    key: `0-0-0${new Date().getTime()}`,
                    icon:'icon-sousuo',
                },{
                    name: `a-0-0-0${new Date().getTime()}`,
                    key: `0-0-1${new Date().getTime()}`,
                    icon:'icon-chakan',
                }]
            })
            
        },2000);
    }
};