import {
	NodeApiError,
	NodeConnectionTypes,
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IDataObject,
	type JsonObject,
} from 'n8n-workflow';

// The HTTP status of a failed request, whether n8n wrapped it in a NodeApiError
// (httpCode) or passed the raw HTTP error through (status on the response).
function httpStatus(error: unknown): number | undefined {
	const e = error as {
		httpCode?: string | null;
		response?: { status?: number };
		cause?: { response?: { status?: number } };
	};
	if (e.httpCode) return Number(e.httpCode);
	return e.response?.status ?? e.cause?.response?.status;
}

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
				displayName: 'Link ID',
				name: 'linkId',
				type: 'string',
				default: '',
				description:
					'Only the visits of this link. Leave empty to receive the links chosen on the n8n page of your Linkbreakers integrations, where the moments of a visit and how much visitor data are sent are also set.',
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
				} catch (error) {
					// Only a 404 means the webhook is gone (deleted in Linkbreakers, or
					// its workspace removed): n8n can then safely create a new one, as
					// nothing is left on the Linkbreakers side to send a second delivery.
					// Any other failure (bad token, server error, timeout) says nothing
					// about whether the webhook exists, so creating one could duplicate
					// it: fail the activation instead and keep the stored ID.
					const status = httpStatus(error);
					if (status === 404) {
						delete data.webhookId;
						return false;
					}
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						httpCode: status ? String(status) : undefined,
					});
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
