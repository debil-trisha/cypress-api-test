// import { expect } from "chai";


describe('AGENT CASHOUT API Tests', () => {
    const validEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway/transaction';

    const invalidEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway';

    const randomId = 'agntCashoutID-' + Date.now();

    const requestBody = {
        "request-id": randomId,
        "command-id": "AGNT",
        "sender": "2250101080452",
        "destination": "2250143567896",
        "auth": "2222",
        "amount": "100",
        "remarks": "",
        "extended-data": {
            "lang": "F",
            "cellid": ""
        }
    };

    context('Successful AGENT CASHOUT', () => {
        it('should process agent cashout and return success response', () => {
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
                    title: 'agent cashout Response Schema',
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
                expect(response.body['command-id']).to.equal('AGNT');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(0);
                expect(response.body['trans-id']).to.match(/^AGNT\d{6}\.\d{4}\.R\d{5}$/);
                expect(response.body.message).to.contains('Un retrait de');
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
                "command-id": "AGNT",
                "sender": "2250101080452",
                "destination": "2250143567896",
                "auth": "2222", //invalid PIN
                "amount": "100",
                "remarks": "",
                "extended-data": {
                    "lang": "F",
                    "cellid": ""
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
                expect(response.body['command-id']).to.equal('AGNT');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(8);
                expect(response.body['trans-id']).to.match(/^AGNT\d{6}\.\d{4}\.R\d{5}$/);

                // Validate message content
                const invalidPINmessage  = [
                    "Le code secret que vous avez saisi est errone,veuillez reessayer svp ou  RDV avec votre piece d'identite dans l'agence Moov la plus proche pour le reinitialiser."
                ];

                invalidPINmessage.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return invalid destination number message', () => {
            const invalidDestinationNumberBody = {
                "request-id": randomId,
                "command-id": "AGNT",
                "sender": "2250101080452",
                "destination": "invalid_destination", //invalid destination number
                "auth": "2222",
                "amount": "100",
                "remarks": "",
                "extended-data": {
                    "lang": "F",
                    "cellid": ""
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
                expect(response.body['command-id']).to.equal('AGNT');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(3);
                expect(response.body['trans-id']).to.match(/^AGNT\d{6}\.\d{4}\.R\d{5}$/);

                // Validate message content
                const invalidDestinationNumberMESSAGE  = [
                    "Le numero que vous avez entre n'est pas valide. Merci de verifier et reessayer svp . "
                ];

                invalidDestinationNumberMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return invalid sender number message', () => {
            const invalidsenderNumberBody = {
                "request-id": randomId,
                "command-id": "AGNT",
                "sender": "invalid_sender", //invalid sender number
                "destination": "2250143567896",
                "auth": "2222",
                "amount": "100",
                "remarks": "",
                "extended-data": {
                    "lang": "F",
                    "cellid": ""
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
                expect(response.body['command-id']).to.equal('AGNT');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(4);
                expect(response.body['trans-id']).to.match(/^AGNT\d{6}\.\d{4}\.R\d{5}$/);

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