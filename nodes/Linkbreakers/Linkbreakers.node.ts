import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { linkDescription } from './resources/link';
import { visitorDescription } from './resources/visitor';

export class Linkbreakers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Linkbreakers',
		name: 'linkbreakers',
		icon: { light: 'file:../../icons/linkbreakers.svg', dark: 'file:../../icons/linkbreakers.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create trackable links and QR codes, and identify the visitors who use them',
		defaults: {
			name: 'Linkbreakers',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'linkbreakersApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Link', value: 'link' },
					{ name: 'Visitor', value: 'visitor' },
				],
				default: 'link',
			},
			...linkDescription,
			...visitorDescription,
		],
	};
}
