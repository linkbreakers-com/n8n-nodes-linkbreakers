import type { INodeProperties } from 'n8n-workflow';

const forLink = (operation: string[]) => ({ show: { resource: ['link'], operation } });

export const linkDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['link'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a link',
				description: 'Create a trackable link with its QR code',
				routing: {
					request: { method: 'POST', url: '/v1/links' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'link' } }] },
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a link',
				routing: { request: { method: 'DELETE', url: '=/v1/links/{{$parameter.linkId}}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a link',
				routing: {
					request: { method: 'GET', url: '=/v1/links/{{$parameter.linkId}}' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'link' } }] },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many links',
				routing: {
					request: { method: 'GET', url: '/v1/links' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'links' } }] },
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Destination',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com',
		description: 'Where the link sends visitors',
		displayOptions: forLink(['create']),
		routing: { send: { type: 'body', property: 'destination' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: forLink(['create']),
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'An internal name to recognise the link',
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'Shortlink',
				name: 'shortlink',
				type: 'string',
				default: '',
				description: 'The path of the short link, for example spring-sale',
				routing: { send: { type: 'body', property: 'shortlink' } },
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated tags',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						value: '={{$value.split(",").map(t => t.trim()).filter(t => t)}}',
					},
				},
			},
			{
				displayName: 'Wait for QR Code',
				name: 'waitForQrcode',
				type: 'boolean',
				default: false,
				description: 'Whether to wait until the QR code image is generated before returning',
				routing: { send: { type: 'body', property: 'waitForQrcode' } },
			},
		],
	},
	{
		displayName: 'Link ID',
		name: 'linkId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the link',
		displayOptions: forLink(['get', 'delete']),
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: forLink(['getAll']),
		routing: { send: { type: 'query', property: 'pageSize' } },
	},
];
