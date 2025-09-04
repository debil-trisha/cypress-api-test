// import { expect } from "chai";

describe('MOOV INTERNET API Tests', () => {
    const validEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway/transaction';

    const invalidEndpoint = 'http://127.0.0.1:8881/Prod_200_AppManagerWildFly21/gateway';

    const randomId = 'Moov-' + Date.now();

    const requestBodyforSelf = {
        "request-id": randomId,
        "command-id": "BILL",
        "sender": "2250102919300",
        "destination": "MOOV_INTERNET",
        "auth": "2222",
        "amount": "156",
        "remarks": "",
        "extended-data": {
            "custommessage": "",
            "account-number": "",
            "cellid": "",
            "biller-reference": "",
            "biller-name": "INTERNET",
            "beneficiary": "2250102919300",
            "biller-code": "",
            "lang": "F",
            "ext4": "MoovMoney",
            "ext2": "MBOPT1",
            "ext1": "MB|1009",
            "refillprofileid": "1009"
        }
    };

    const requestBodyforOthers = {
        "request-id": randomId,
        "command-id": "BILL",
        "sender": "2250102919300",
        "destination": "MOOV_INTERNET",
        "auth": "2222",
        "amount": "213",
        "remarks": "",
        "extended-data": {
            "custommessage": "",
            "channel": "mobileapp-ios",
            "account-number": "",
            "cellid": "",
            "biller-reference": "",
            "biller-name": "INTERNET",
            "beneficiary": "2250142373758",
            "biller-code": "",
            "lang": "F",
            "ext4": "MoovMoney",
            "ext2": "2250142373758",
            "ext1": "MB|1008",
            "refillprofileid": "1008"
        }
    };

    // Validate response structure
    const responseSchema = {
        title: 'MOOV INTERNET Response Schema',
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

    context('Successful MOOV INTERNET', () => {
        it('should process MOOV INTERNET for self and return success response', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: requestBodyforSelf,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                // Validate response status
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);

                // Validate response values
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(0);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);
                expect(response.body.message).to.contains('Débit de');
            });
        });

        it('should process MOOV INTERNET for others and return success response', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: requestBodyforOthers,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                // Validate response status
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);

                // Validate response values
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(0);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);
                expect(response.body.message).to.contains('Débit de');
            });
        });
    });

    context('Failed response', () => {
        it('should return 404 for invalid endpoint', () => {
            cy.request({
                method: 'POST',
                url: invalidEndpoint,
                body: requestBodyforSelf,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Verify Not Found response
                expect(response.status).to.equal(404);
            });
        });

        it('should return 404 for invalid endpoint', () => {
            cy.request({
                method: 'POST',
                url: invalidEndpoint,
                body: requestBodyforOthers,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Verify Not Found response
                expect(response.status).to.equal(404);
            });
        });

        const invalidPINBodySELF = {
                "request-id": randomId,
                "command-id": "BILL",
                "sender": "2250102919300",
                "destination": "MOOV_INTERNET",
                "auth": "1234", //invalid PIN
                "amount": "156",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "account-number": "",
                    "cellid": "",
                    "biller-reference": "",
                    "biller-name": "INTERNET",
                    "beneficiary": "2250102919300",
                    "biller-code": "",
                    "lang": "F",
                    "ext4": "MoovMoney",
                    "ext2": "MBOPT1",
                    "ext1": "MB|1009",
                    "refillprofileid": "1009"
                }
            };

        const invalidPINBodyOTHERS = {
            "request-id": randomId,
            "command-id": "BILL",
            "sender": "2250102919300",
            "destination": "MOOV_INTERNET",
            "auth": "1234", //invalid PIN
            "amount": "213",
            "remarks": "",
            "extended-data": {
                "custommessage": "",
                "channel": "mobileapp-ios",
                "account-number": "",
                "cellid": "",
                "biller-reference": "",
                "biller-name": "INTERNET",
                "beneficiary": "2250142373758",
                "biller-code": "",
                "lang": "F",
                "ext4": "MoovMoney",
                "ext2": "2250142373758",
                "ext1": "MB|1008",
                "refillprofileid": "1008"
            }
            };

        const invalidPINmessage  = [
            "Le code secret que vous avez saisi est errone,veuillez reessayer svp ou  RDV avec votre piece d'identite dans l'agence Moov la plus proche pour le reinitialiser."
            ];

        it('should return invalid PIN message (SELF)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: invalidPINBodySELF,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(8);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);
               
                invalidPINmessage.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return invalid PIN message (OTHERS)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body: invalidPINBodyOTHERS,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(8);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);

                invalidPINmessage.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        const notAuthorizedNumberBodySELF = {
                "request-id": randomId,
                "command-id": "BILL",
                "sender": "2250102919300",
                "destination": "MOOV_INTERNET",
                "auth": "2222",
                "amount": "156",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "account-number": "",
                    "cellid": "",
                    "biller-reference": "",
                    "biller-name": "INTERNET",
                    "beneficiary": "invalid_beneficiary", //not authorized
                    "biller-code": "",
                    "lang": "F",
                    "ext4": "MoovMoney",
                    "ext2": "MBOPT1",
                    "ext1": "MB|1009",
                    "refillprofileid": "1009"
                }
            };

        const notAuthorizedNumberBodyOTHERS = {
                "request-id": randomId,
                "command-id": "BILL",
                "sender": "2250102919300",
                "destination": "MOOV_INTERNET",
                "auth": "2222",
                "amount": "213",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "channel": "mobileapp-ios",
                    "account-number": "",
                    "cellid": "",
                    "biller-reference": "",
                    "biller-name": "INTERNET",
                    "beneficiary": "invalid_beneficiary", //not authorized
                    "biller-code": "",
                    "lang": "F",
                    "ext4": "MoovMoney",
                    "ext2": "2250142373758",
                    "ext1": "MB|1008",
                    "refillprofileid": "1008"
                }
            };

        const notAuthorizedNumMESSAGE  = [
            "Desole, le numero du destinataire n'est pas autorise a recevoir un transfert d'argent."
        ];

        it('should return not authorized destination number message (SELF)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body:notAuthorizedNumberBodySELF,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(51);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);

                notAuthorizedNumMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return not authorized destination number message (OTHERS)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body:notAuthorizedNumberBodyOTHERS,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(51);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);

                notAuthorizedNumMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        const notAuthorizedSenderNumBodySELF = {
                "request-id": randomId,
                "command-id": "BILL",
                "sender": "invalid_sender", //not authorized
                "destination": "MOOV_INTERNET",
                "auth": "2222",
                "amount": "156",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "account-number": "",
                    "cellid": "",
                    "biller-reference": "",
                    "biller-name": "INTERNET",
                    "beneficiary": "2250102919300",
                    "biller-code": "",
                    "lang": "F",
                    "ext4": "MoovMoney",
                    "ext2": "MBOPT1",
                    "ext1": "MB|1009",
                    "refillprofileid": "1009"
                }
            };

        const notAuthorizedSenderNumBodyOTHERS = {
                "request-id": randomId,
                "command-id": "BILL",
                "sender": "invalid_sender", //not authorized
                "destination": "MOOV_INTERNET",
                "auth": "2222",
                "amount": "156",
                "remarks": "",
                "extended-data": {
                    "custommessage": "",
                    "account-number": "",
                    "cellid": "",
                    "biller-reference": "",
                    "biller-name": "INTERNET",
                    "beneficiary": "2250102919300",
                    "biller-code": "",
                    "lang": "F",
                    "ext4": "MoovMoney",
                    "ext2": "MBOPT1",
                    "ext1": "MB|1009",
                    "refillprofileid": "1009"
                }
            };

        const notAuthorizedSenderNumMESSAGE  = [
            "Desole, vous n'etes pas autorise a effectuer cette transaction."
        ];

        it('should return not authorized sender number message (SELF)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body:notAuthorizedSenderNumBodySELF,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(4);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);

                notAuthorizedSenderNumMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });

        it('should return not authorized sender number message (OTHERS)', () => {
            cy.request({
                method: 'POST',
                url: validEndpoint,
                body:notAuthorizedSenderNumBodyOTHERS,
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.jsonSchema(responseSchema);
                expect(response.body['command-id']).to.equal('BILL');
                expect(response.body['request-id']).to.equal(randomId);
                expect(response.body.status).to.equal(4);
                expect(response.body['trans-id']).to.match(/^BILL\d{6}\.\d{4}\.R\d{5}$/);

                notAuthorizedSenderNumMESSAGE.forEach(part => {
                    expect(response.body.message).to.include(part);
                });
            });
        });


        
    });
});