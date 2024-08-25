import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBStruct } from "./dynamodb.struct";
import { StorageStruct } from "./storage.struct";

export class VtlMappingsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //RestApi
    const api = new cdk.aws_apigateway.RestApi(this, "VTLMappinRestApi", {
      binaryMediaTypes: ["image/*"],
      deployOptions: {
        dataTraceEnabled: true,
        loggingLevel: cdk.aws_apigateway.MethodLoggingLevel.INFO,
      },
      defaultMethodOptions: {
        methodResponses: [
          { statusCode: "200" },
          { statusCode: "400" },
          { statusCode: "500" },
        ],
      },
    });

    const cars = api.root.addResource("cars");

    //DynamoDB
    const dynamoDBStruct = new DynamoDBStruct(this, "DDBStruct", cars);

    // S3
    const storageStruct = new StorageStruct(this, "S3Struct", cars);
  }
}
