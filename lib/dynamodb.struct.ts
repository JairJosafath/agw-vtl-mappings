import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { vtlSerializer } from "./util/vtlSerializer";

export class DynamoDBStruct extends Construct {
  constructor(scope: Construct, id: string, cars: cdk.aws_apigateway.Resource) {
    super(scope, id);

    // DynamoDB Table
    const table = new cdk.aws_dynamodb.TableV2(this, "CarsTable", {
      partitionKey: {
        name: "Brand",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "Model", type: cdk.aws_dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      globalSecondaryIndexes: [
        {
          indexName: "CarsByYear",
          partitionKey: {
            name: "Year",
            type: cdk.aws_dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: "Model",
            type: cdk.aws_dynamodb.AttributeType.STRING,
          },
        },
      ],
    });

    // IntegrationRole
    const credentialsRole = new cdk.aws_iam.Role(
      this,
      "DynamodbCredentialsRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonDynamoDBFullAccess"
          ),
        ],
      }
    );

    // Resources for the api

    // input body example for adding a new car
    /*
    {
      "brand": "Toyota",
      "model": "Corolla",
      "year": "2020",
      "price": 20000,
      "colors": ["red", "black"]
    }
    */

    cars.addMethod(
      "POST",
      new cdk.aws_apigateway.AwsIntegration({
        service: "dynamodb",
        action: "PutItem",
        options: {
          credentialsRole,
          requestTemplates: {
            "application/json": vtlSerializer(
              {
                TableName: table.tableName,
                Item: {
                  Brand: {
                    S: "$input.path('$.brand')",
                  },
                  Model: {
                    S: "$input.path('$.model')",
                  },
                  Year: {
                    S: "$input.path('$.year')",
                  },
                  Price: {
                    S: "$input.path('$.price')",
                  },
                  Colors: {
                    SS: "$input.path('$.colors')",
                  },
                },
              },
              ["SS"]
            ),
          },
          integrationResponses: [
            { statusCode: "200" },
            { statusCode: "400", selectionPattern: "4\\d{2}" },
            { statusCode: "500", selectionPattern: "5\\d{2}" },
          ],
        },
      })
    );

    /*
    input params example for querying cars, either by brand or by year
    GET /cars?indexName=CarsByYear&key=Year&value=2020
    GET /cars?brand=Toyota
    */

    cars.addMethod(
      "GET",
      new cdk.aws_apigateway.AwsIntegration({
        service: "dynamodb",
        action: "Query",
        options: {
          credentialsRole,
          requestTemplates: {
            "application/json": `
            #if($input.params('indexName')!="")
            ${JSON.stringify({
              TableName: table.tableName,
              IndexName: "$input.params('indexName')",
              KeyConditionExpression: "#key = :value",
              ExpressionAttributeNames: {
                "#key": "$input.params('key')",
              },
              ExpressionAttributeValues: {
                ":value": {
                  S: "$input.params('value')",
                },
              },
            })}
            #else
            ${JSON.stringify({
              TableName: table.tableName,
              KeyConditionExpression: "Brand = :brand",
              ExpressionAttributeValues: {
                ":brand": {
                  S: "$input.params('brand')",
                },
              },
            })}
            #end
            `,
          },
          integrationResponses: [
            { statusCode: "200" },
            { statusCode: "400", selectionPattern: "4\\d{2}" },
            { statusCode: "500", selectionPattern: "5\\d{2}" },
          ],
        },
      })
    );
  }
}
