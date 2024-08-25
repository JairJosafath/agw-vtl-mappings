import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class StorageStruct extends Construct {
  constructor(scope: Construct, id: string, cars: cdk.aws_apigateway.Resource) {
    super(scope, id);
    // S3
    const bucket = new cdk.aws_s3.Bucket(this, "CarsBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Integration Role
    const credentialsRole = new cdk.aws_iam.Role(this, "S3IntegrationRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonS3FullAccess"
        ),
      ],
    });

    // Resources
    const thumbs = cars.addResource("thumb").addResource("{key+}");

    thumbs.addMethod(
      "POST",
      new cdk.aws_apigateway.AwsIntegration({
        service: "s3",
        path: `${bucket.bucketName}/{key}`,
        integrationHttpMethod: "PUT",
        options: {
          credentialsRole,
          requestParameters: {
            "integration.request.path.key": "method.request.path.key",
            "integration.request.header.Content-Type":
              "method.request.header.Content-Type",
          },
          requestTemplates: {
            "application/octet-stream": "$input.body",
          },
          integrationResponses: [
            { statusCode: "200" },
            { statusCode: "400", selectionPattern: "4\\d{2}" },
            { statusCode: "500", selectionPattern: "5\\d{2}" },
          ],
        },
      }),
      {
        requestParameters: {
          "method.request.path.key": true,
          "method.request.header.Content-Type": true,
        },
      }
    );
    thumbs.addMethod(
      "GET",
      new cdk.aws_apigateway.AwsIntegration({
        service: "s3",
        path: `${bucket.bucketName}/{key}`,
        integrationHttpMethod: "GET",
        options: {
          credentialsRole,
          requestParameters: {
            "integration.request.path.key": "method.request.path.key",
          },
          requestTemplates: {
            "application/octet-stream": "$input.body",
          },
          integrationResponses: [
            { statusCode: "200" },
            { statusCode: "400", selectionPattern: "4\\d{2}" },
            { statusCode: "500", selectionPattern: "5\\d{2}" },
          ],
        },
      }),
      {
        requestParameters: {
          "method.request.path.key": true,
        },
      }
    );
  }
}
