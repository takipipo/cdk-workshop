import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { HitCounter } from './hitcounter';
import {TableViewer} from "cdk-dynamo-table-viewer";


export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define an AWS Lambda resource
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler"
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream:hello
    });

    // define an API Gateway 
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloWithCounter.handler
    })
    new TableViewer(this, "ViewCounter", {
      title: "Hello Hits", 
      table: helloWithCounter.table,
      sortBy: "-hits"
    })
  }
}
