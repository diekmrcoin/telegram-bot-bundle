// https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
export interface APIGatewayV2Event {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  cookies: string[];
  headers: {
    [header: string]: string;
  };
  queryStringParameters: {
    [parameter: string]: string;
  };
  requestContext: {
    accountId: string;
    apiId: string;
    authentication: {
      clientCert: {
        clientCertPem: string;
        subjectDN: string;
        issuerDN: string;
        serialNumber: string;
        validity: {
          notBefore: string;
          notAfter: string;
        };
      };
    };
    authorizer: {
      jwt: {
        claims: {
          [claim: string]: string;
        };
        scopes: string[];
      };
    };
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
  };
  body: string;
  pathParameters: {
    [parameter: string]: string;
  };
  isBase64Encoded: boolean;
  stageVariables: {
    [variable: string]: string;
  };
}
