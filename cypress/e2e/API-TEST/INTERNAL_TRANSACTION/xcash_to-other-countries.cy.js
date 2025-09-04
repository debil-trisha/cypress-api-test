// import { expect } from "chai";


describe('XCASH API Tests', () => {
    const validEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway/transaction';

    const invalidEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway';

    const randomId = 'XCASHID-' + Date.now();

    const requestBody = {
        "request-id": randomId,
        "sender": "2250102919300",
        "destination": "XBORDER_SEND_BJ",
        "command-id": "XCASH",
        "auth": "2222",
        "amount": "1354",
        "remarks": "",
        "extended-data": {
            "custommessage": "",
            "lang": "F",
            "cellid": "1234",
            "biller-reference": "",
            "ext2": "",
            "ext1": "",
            "biller-code": "",
            "biller-name": "XBORDER_SEND_BJ",
            "account-number":"",
            "recipient":"2290101080452"
        }
    };

    context('Successful XCASH Transfer', () => {
        it('should process of xcash transaction and return success response', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: requestBody,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                // Validate response status
                expect(response.status).to.equal(200);

                // Validate response structure
                const responseSchema = {
                    title: 'Cash Transfer Response Schema',
                    type: 'object',
                    required: ['command-id', 'trans-id', 'request-id', 'status', 'message'],
                    properties: {
                        'command-id': { type: 'string' },
                        'trans-id': { type: 'string' },
                        'request-id': { type: 'string' },
                        'status': { type: 'integer' },
                        'message': { type: 'string' }
                    }
                };

                expect(response.body).to.be.jsonSchema(responseSchema);

                // Validate response values
                expect(response.body['command-id']).to.equal('XCASH');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(0);
                expect(response.body['trans-id']).to.match(/^XCASH\d{6}\.\d{4}\.R\d{5}$/);
                expect(response.body.message).to.contains('Vous avez transfere');
            });
        });
    });

    context('Failed response', () => {
        it('should return 404 for invalid endpoint', () => {
            cy.request({
                method: 'POST',
                url: invalidEndpoint,
                body: requestBody,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Verify Not Found response
                expect(response.status).to.equal(404);
            });
        });


        it('should return invalid PIN message', () => {
            const invalidPINBody = {
                "request-id": randomId,
                "sender": "2250102919300",
                "destination": "XBORDER_SEND_BJ",
                "command-id": "XCASH",
                "auth": "1234", //invalid PIN
                "amount": "500",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "lang": "F",
                    "cellid": "1234",
                    "biller-reference": "",
                    "ext2": "",
                    "ext1": "",
                    "biller-code": "",
                    "biller-name": "XBORDER_SEND_BJ",
                    "account-number":"",
                    "recipient":"2290101080452"
                }
            };

            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: invalidPINBody,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body['command-id']).to.equal('XCASH');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(8);
                expect(response.body['trans-id']).to.match(/^XCASH\d{6}\.\d{4}\.R\d{5}$/);

                // Validate message content
                const invalidPINmessage  = [
                    "Le code secret que vous avez saisi est errone,veuillez reessayer svp ou  RDV avec votre piece d'identite dans l'agence Moov la plus proche pour le reinitialiser."
                ];

                invalidPINmessage.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return not authorized destination number message', () => {
            const invalidDestinationNumberBody = {
                "request-id": randomId,
                "sender": "2250102919300",
                "destination": "invalid_destination", //not authorized
                "command-id": "XCASH",
                "auth": "2222",
                "amount": "200",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "lang": "F",
                    "cellid": "1234",
                    "biller-reference": "",
                    "ext2": "",
                    "ext1": "",
                    "biller-code": "",
                    "biller-name": "XBORDER_SEND_BJ",
                    "account-number":"",
                    "recipient":"2290101080452"
                }
            };

            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: invalidDestinationNumberBody,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body['command-id']).to.equal('XCASH');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(51);
                expect(response.body['trans-id']).to.match(/^XCASH\d{6}\.\d{4}\.R\d{5}$/);

                // Validate message content
                const invalidDestinationNumberMESSAGE  = [
                    "Desole, le numero du destinataire n'est pas autorise a recevoir un transfert d'argent."
                ];

                invalidDestinationNumberMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return invalid sender number message', () => {
            const invalidsenderNumberBody = {
                "request-id": randomId,
                "sender": "invalid_sender", //invalid sender number
                "destination": "XBORDER_SEND_BJ",
                "command-id": "XCASH",
                "auth": "2222",
                "amount": "200",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "lang": "F",
                    "cellid": "1234",
                    "biller-reference": "",
                    "ext2": "",
                    "ext1": "",
                    "biller-code": "",
                    "biller-name": "XBORDER_SEND_BJ",
                    "account-number":"",
                    "recipient":"2290101080452"
                }
            };

            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: invalidsenderNumberBody,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body['command-id']).to.equal('XCASH');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(4);
                expect(response.body['trans-id']).to.match(/^XCASH\d{6}\.\d{4}\.R\d{5}$/);

                // Validate message content
                const invalidSenderNumberMESSAGE  = [
                    "Desole, vous n'etes pas autorise a effectuer cette transaction."
                ];

                invalidSenderNumberMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });
    });
});