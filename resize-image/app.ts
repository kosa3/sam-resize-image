import * as Sharp from 'sharp';
import * as Lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
const config = {
    endpoint: "http://docker.for.mac.host.internal:4572",
    s3ForcePathStyle: true
};

const env = process.env.Env;
const s3 = !env ? new AWS.S3() : new AWS.S3(config);

const createResponse = (filename: string, buffer: Buffer) => {
    return {
        statusCode: 200,
        headers: {
            'content-type': getExtensionType(filename),
            'cache-control': 'max-age=31536000'
        },
        isBase64Encoded: true,
        body: buffer.toString('base64')
    }
};

const getExtensionType = (filename: string) => {
    let matches = filename.match(/(.*)(?:\.([^.]+$))/);

    switch (matches![2]) {
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        default:
            return 'image/jpeg';
    }
};

exports.lambdaHandler = async (event: Lambda.APIGatewayEvent, _context: Lambda.APIGatewayEventRequestContext, callback: Lambda.Callback) => {
    try {
        const s3OrgImageFile = {
            Bucket: 'sam-resize-image',
            Key: `${event.pathParameters!.directory}/${event.pathParameters!.contentId}/${event.pathParameters!.subDirectory}/${event.pathParameters!.filename}`,
        };
        // リクエストで指定された画像横幅
        const size = event.pathParameters!.size.split('x');
        const width = size[0];
        const height = size[1];
        const type = event.pathParameters!.type;
        await s3.getObject(s3OrgImageFile).promise()
            .then(data => {
                // @ts-ignore
                let sharp = Sharp(data.Body);
                if (type === 'resize') {
                    return sharp
                        .rotate()
                        .resize(parseInt(width))
                        .toBuffer()
                } else if (type === 'trim') {
                    return sharp
                        .rotate()
                        .resize(parseInt(width), parseInt(height))
                        .trim()
                        .toBuffer()
                }
            })
            .then(buffer => {
                callback(null, createResponse(event.pathParameters!.filename, buffer));
            });
    } catch (e) {
        throw e;
    }
};
