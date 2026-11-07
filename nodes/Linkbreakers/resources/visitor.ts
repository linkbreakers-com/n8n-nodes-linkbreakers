import type { INodeProperties } from 'n8n-workflow';

const RESERVED = ['email', 'phone', 'firstName', 'lastName'];
const ATTRIBUTE_NAMES: Record<string, string> = { company: 'Company', title: 'Title' };

const forIdentify = { show: { resource: ['visitor'], operation: ['identify'] } };

export const visitorDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['visitor'] } },
		options: [
			{
				name: 'Identify',
				value: 'identify',
				action: 'Identify a visitor',
				description: 'Add an email, a name or any attribute to the visitor of a scan or click',
				routing: {
					request: { method: 'POST', url: '/v1/visitor/identify' },
					send: {
						preSend: [
							async function (this, requestOptions) {
								const fields = this.getNodeParameter('fields', {}) as Record<string, string>;
								const custom = this.getNodeParameter('customAttributes', {}) as {
									attribute?: Array<{ key: string; value: string }>;
								};
								const data: Record<string, string> = {};
								// email, phone, firstName and lastName are the visitor's reserved
								// fields ($-prefixed); the others are attributes like any other.
								for (const [key, value] of Object.entries(fields)) {
									if (value === '') continue;
									data[RESERVED.includes(key) ? `$${key}` : (ATTRIBUTE_NAMES[key] ?? key)] = value;
								}
								for (const { key, value } of custom.attribute ?? []) {
									if (key) data[key] = value;
								}
								requestOptions.body = {
									...(requestOptions.body as object),
									visitor: { data },
								};
								return requestOptions;
							},
						],
					},
				},
			},
		],
		default: 'identify',
	},
	{
		displayName: 'LBID',
		name: 'lbid',
		type: 'string',
		required: true,
		default: '',
		description:
			'The visit ID Linkbreakers passes along (lbid), for example from the Linkbreakers Trigger or a form field',
		displayOptions: forIdentify,
		routing: { send: { type: 'body', property: 'lbid' } },
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: forIdentify,
		options: [
			{ displayName: 'Company', name: 'company', type: 'string', default: '' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '' },
			{ displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
			{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Custom Attributes',
		name: 'customAttributes',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Attribute',
		default: {},
		displayOptions: forIdentify,
		options: [
			{
				displayName: 'Attribute',
				name: 'attribute',
				values: [
					{ displayName: 'Key', name: 'key', type: 'string', default: '' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '' },
				],
			},
		],
	},
	{
		displayName: 'Set Only Empty Fields',
		name: 'setOnce',
		type: 'boolean',
		default: false,
		description: 'Whether to keep values the visitor already has and only fill empty ones',
		displayOptions: forIdentify,
		routing: { send: { type: 'body', property: 'setOnce' } },
	},
];
