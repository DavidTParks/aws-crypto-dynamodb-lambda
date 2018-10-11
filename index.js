/*
 * Created by David Parks
 * A lambda handler function for use with AWS Lambda and AWS DynamoDB
 * Pulls specified cryptocurrency tokens from Coinmarketcap API and stores data in a dynamoDB table
 * To customize the endpoint, add or remove tokens you wish to store
 * To customize how data is stored in the table, edit the item parameter
*/

var https = require('https');
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

var options = {
    host: 'pro-api.coinmarketcap.com',
    path: '/v1/cryptocurrency/quotes/latest?symbol=VET,ENG,NANO,ICX,GNT,XLM,DENT,BAT,OMG,BNB,ZIL,FUN,POLY,AMB,STORJ,ZRX,WTC,REP,XRP,ZEC,QTUM,NEO,SC,ONT,XMR,ETH,BTC',
    method: 'GET',
    headers: { 'x-cmc_pro_api_key': 'INSERT_API_KEY' }
};

var table = "INSERT_TABLE_NAME";

exports.handler = function (event, context) {
    https.get(options, function (res) {
        var data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            let jsonData = JSON.parse(data);
            var params = {
                TableName: table,
                Item: {
                    "timestamp": jsonData.status.timestamp,
                    "coinData": jsonData.data
                }
            };
            docClient.put(params, function (err, data) {
                if (err) {
                    context.fail("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                }
            });
            console.log(data);
        });
    }).on('error', (e) => {
        console.log("Got error: " + e.message);
    });
};