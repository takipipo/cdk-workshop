import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda";
import {Construct} from "constructs";

export interface IHitCounterProps {
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct { // allows accessing the counter function
  
	public readonly handler : lambda.Function
	public readonly table: dynamodb.Table;


	constructor(scope : Construct, id : string, props : IHitCounterProps) {
		super(scope, id)

		const table = new dynamodb.Table(this, "Hits", {
				partitionKey: {
						name: "path",
						type: dynamodb.AttributeType.STRING
				}, 
				removalPolicy: cdk.RemovalPolicy.DESTROY
		});
		this.table = table;
		this.handler = new lambda.Function(this, "HitCounterHandler", {
				runtime: lambda.Runtime.NODEJS_16_X,
				handler: "hitcounter.handler",
				code: lambda.Code.fromAsset("lambda"),
				environment: {
						DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
						HITS_TABLE_NAME: table.tableName
				}
		});
		
		// grant r/w access to handler to dynamodb
		table.grantReadWriteData(this.handler);
		// grant invoke access to downstream function
		props.downstream.grantInvoke(this.handler);
}

}
