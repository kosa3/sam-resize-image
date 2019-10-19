const sharp = require('sharp');
const AWS = require('aws-sdk');
const config = {
    endpoint: "http://docker.for.mac.host.internal:4572",
    s3ForcePathStyle: true
}

const s3 = new AWS.S3(config)

exports.lambdaHandler = async (event, context, callback) => {
        let response = {};
        const s3OrgImageFile = {
            Bucket: 'test-bucket',   // S3で作ったバケット
            Key: event.pathParameters.filename,   // リクエストで指定された画像名
        };

        // リクエストで指定された画像横幅
        const size = event.pathParameters.size.split('x');
        const width = size[0];
        const height = size[1];
        const type = event.pathParameters.type;
        await s3.getObject(s3OrgImageFile).promise()
            .then(data => sharp(data.Body)
                .rotate()
                // .toFormat('jpg')
                .toBuffer())
            .then(buffer => {
                response.statusCode = 200;
                response.body = buffer.toString('base64');
                response.isBase64Encoded = true;
                response.headers = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Api-Key,X-Amz-Security-",
                    "Content-Type": "image/jpg"
                };
                callback(null, response);
            });

        // await s3.getObject(s3OrgImageFile, (err, data) => {
        //     // try {
        //         if (type === 'resize') {
        //             // リサイズ実施
        //             console.log(data);
        //             sharp(data.Body)
        //                 .rotate()
        //                 .resize(parseInt(width))
        //                 .toBuffer(function (err, stdout) {
        //                     if (err) {
        //                         // リサイズ失敗
        //                         console.log('resize失敗:' + err);
        //                         throw err;
        //                     } else {
        //                         // リサイズ成功
        //                         console.log('resize成功');
        //                         callback(null, new Buffer(stdout, 'binary').toString('base64'));
        //                         console.log('変換完了');
        //                     }
        //                 });
        //         } else if (type === 'trim') {
        //             // リサイズ実施
        //             sharp(data.Body)
        //                 .rotate()
        //                 .resize(parseInt(width), parseInt(height))
        //                 .crop()
        //                 .toBuffer(function (err, stdout, stderr) {
        //                     if (err) {
        //                         // リサイズ失敗
        //                         console.log('crop失敗:' + err);
        //                         throw err;
        //                     } else {
        //                         // リサイズ成功
        //                         console.log('crop成功');
        //                         callback(null, new BUffer(stdout, 'binary').toString('base64'));
        //                         console.log('変換完了');
        //                     }
        //                 });
        //         } else {
        //             // 取得失敗
        //             console.log('不明なタイプです');
        //             throw err;
        //         }
        //     // } catch (e) {
        //     //     console.log(e);
        //     // }
        // })();
    // } catch (err) {
    //     console.log(event);
    //     return err;
    // }
    // return {
    //     'statusCode': 200,
    //     'body': JSON.stringify({
    //         message: 'hello world',
    //         // location: ret.data.trim()
    //     })
    // }
};
