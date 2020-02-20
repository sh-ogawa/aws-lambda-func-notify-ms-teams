const axios = require('axios');

exports.handler = async (event) => {

    const message = JSON.parse(event.Records[0].Sns.Message);

    console.log("Message\n" + message);
    const connectorUrl = process.env['CONNECTOR_URL'];

    let card;
    console.log("source\n" + message.source);
    switch (message.source) {
        case 'aws.codedeploy':
            card = codeDeployCard(message);
            break;
        case 'aws.codepipeline':
            card = codePipelineCard(message);
            break;
        default:
            card = {
                text: message.source,
            }
    }

    await axios.post(connectorUrl, card);

    return {
        statusCode: 200
    };
};

const codePipelineCard = (message) => {
    const detail = message.detail;
    return {
        "@type": "MessageCard",
        "themeColor": "0076D7",
        "summary": message.detailType,
        "sections": [{
            "activityTitle": detail.pipeline,
            "activitySubtitle": detail['execution-id'],
            "facts": [{
                "name": "Datetime",
                "value": message.time
            }, {
                "name": "Status",
                "value": detail.state
            }],
            "markdown": true
        }],
    };
};

const codeDeployCard = (message) => {
    const detail = message.detail;
    return {
        "@type": "MessageCard",
        "themeColor": "0076D7",
        "summary": message.detailType,
        "sections": [{
            "activityTitle": detail.application,
            "activitySubtitle": detail.deploymentGroup,
            "facts": [{
                "name": "Datetime",
                "value": message.time
            }, {
                "name": "Status",
                "value": detail.state
            }, {
                "name": "deploymentId",
                "value": detail.deploymentId
            }, {
                "name": "deploymentGroup",
                "value": detail.deploymentGroup
            }],
            "markdown": true
        }],
    };
};