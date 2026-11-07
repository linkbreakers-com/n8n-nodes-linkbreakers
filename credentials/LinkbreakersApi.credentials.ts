import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LinkbreakersApi implements ICredentialType {
	name = 'linkbreakersApi';

	displayName = 'Linkbreakers API';

	icon: Icon = { light: 'file:../icons/linkbreakers.svg', dark: 'file:../icons/linkbreakers.dark.svg' };

	documentationUrl = 'https://linkbreakers.com/help/api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Create one in Linkbreakers under Developers → API Tokens',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: 'https://api.linkbreakers.com',
			description: 'Leave as is unless Linkbreakers support gives you another address',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			url: '/v1/workspace',
			method: 'GET',
		},
	};
}
