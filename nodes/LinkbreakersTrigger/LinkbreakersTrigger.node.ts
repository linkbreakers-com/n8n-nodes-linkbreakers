import {
	NodeConnectionTypes,
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IDataObject,
} from 'n8n-workflow';

async function webhooksUrl(this: IHookFunctions): Promise<string> {
	const credentials = await this.getCredentials('linkbreakersApi');
	const base = ((credentials.apiUrl as string) || 'https://api.linkbreakers.com').replace(/\/$/, '');
	return `${base}/v1/webhooks`;
}

export class LinkbreakersTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Linkbreakers Trigger',
		name: 'linkbreakersTrigger',
		icon: { light: 'file:../../icons/linkbreakers.svg', dark: 'file:../../icons/linkbreakers.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: 'On visit',
		description: 'Starts the workflow when someone scans a QR code or clicks a link',
		defaults: {
			name: 'Linkbreakers Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'linkbreakersApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'Which links, which moments of a visit and how much visitor data are sent is set on the n8n page of your Linkbreakers integrations.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Link ID',
				name: 'linkId',
				type: 'string',
				default: '',
				description:
					'Only the visits of this link. Leave empty to follow the n8n integration settings in Linkbreakers.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (!data.webhookId) return false;
				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'linkbreakersApi', {
						method: 'GET',
						url: `${await webhooksUrl.call(this)}/${data.webhookId as string}`,
						json: true,
					});
					return true;
				} catch {
					delete data.webhookId;
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const linkId = this.getNodeParameter('linkId', '') as string;
				const body: IDataObject = {
					name: `n8n: ${this.getWorkflow().name ?? 'workflow'}`,
					endpointUrl: this.getNodeWebhookUrl('default'),
					source: 'WEBHOOK_SOURCE_N8N',
				};
				if (linkId) body.linkId = linkId;
				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'linkbreakersApi',
					{ method: 'POST', url: await webhooksUrl.call(this), body, json: true },
				)) as { webhook?: { id?: string } };
				if (!response.webhook?.id) return false;
				this.getWorkflowStaticData('node').webhookId = response.webhook.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(this, 'linkbreakersApi', {
							method: 'DELETE',
							url: `${await webhooksUrl.call(this)}/${data.webhookId as string}`,
							json: true,
						});
					} catch (error) {
						this.logger.warn(
							`Could not delete the Linkbreakers webhook ${data.webhookId as string}: ${(error as Error).message}`,
						);
						return false;
					}
					delete data.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// The delivery envelope: id, type (visit.entered, visit.interacted,
		// visit.routed, visit.exited), createdAt, webhook, and data with the
		// event, the workflow step, the link, the visitor and the lbid.
		return { workflowData: [this.helpers.returnJsonArray(this.getBodyData())] };
	}
}
