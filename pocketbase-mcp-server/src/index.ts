#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import PocketBase, { RecordModel } from 'pocketbase'; // SchemaField might not be exported directly

const POCKETBASE_URL = process.env.POCKETBASE_URL;
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!POCKETBASE_URL || !POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
  throw new Error('PocketBase environment variables (POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD) are required.');
}

class PocketBaseMcpServer {
  private server: Server;
  private pb: PocketBase;
  private adminAuthPromise: Promise<any> | null = null;

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);

    this.server = new Server(
      {
        name: 'pocketbase-mcp-server', // Matches the name in settings
        version: '0.1.1', // Incremented version
        description: 'MCP Server to interact with a PocketBase instance.',
      },
      {
        capabilities: {
          resources: {}, // No resources defined for now, focusing on tools
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[PocketBase MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async ensureAdminAuth() {
    if (!this.pb.authStore.isValid || !this.pb.authStore.isAdmin) {
        if (!this.adminAuthPromise) {
            this.adminAuthPromise = this.pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL!, POCKETBASE_ADMIN_PASSWORD!)
                .catch(err => {
                    this.adminAuthPromise = null; // Reset promise on error
                    console.error("PocketBase Admin Auth Failed:", err);
                    throw new McpError(ErrorCode.InternalError, `PocketBase Admin Auth Failed: ${err.message}`);
                });
        }
        await this.adminAuthPromise;
        this.adminAuthPromise = null; // Clear promise after successful auth or if it was already resolved
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_collections',
          description: 'Lists all collections in the PocketBase instance.',
          inputSchema: {}, // No input parameters
        },
        {
          name: 'get_collection_schema',
          description: 'Gets the schema for a specific collection.',
          inputSchema: {
            type: 'object',
            properties: {
              collectionNameOrId: { type: 'string', description: 'The name or ID of the collection.' },
            },
            required: ['collectionNameOrId'],
          },
        },
        {
          name: 'list_records',
          description: 'Lists records from a collection with optional query parameters.',
          inputSchema: {
            type: 'object',
            properties: {
              collectionNameOrId: { type: 'string', description: 'The name or ID of the collection.' },
              options: { 
                type: 'object',
                properties: {
                  page: { type: 'number', description: 'Page number (default: 1).' },
                  perPage: { type: 'number', description: 'Records per page (default: 30, max: 500).' },
                  sort: { type: 'string', description: 'Sort order (e.g., "-created,field").' },
                  filter: { type: 'string', description: 'Filter expression (PocketBase syntax).' },
                  expand: { type: 'string', description: 'Comma-separated relations to expand.' },
                },
                additionalProperties: false,
              },
            },
            required: ['collectionNameOrId'],
          },
        },
        {
          name: 'add_field_to_collection',
          description: 'Adds a new field to an existing collection\'s schema.',
          inputSchema: {
            type: 'object',
            properties: {
              collectionNameOrId: { type: 'string', description: 'The name or ID of the collection to update.' },
              fieldDefinition: { 
                type: 'object', 
                description: 'The schema definition for the new field (PocketBase SchemaField format).',
                // Example properties, actual structure depends on PocketBase SchemaField
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['text', 'number', 'bool', 'email', 'url', 'date', 'select', 'relation', 'file', 'json'] },
                    required: { type: 'boolean' },
                    system: { type: 'boolean' }, // Should usually be false for user fields
                    options: { type: 'object' } // Specific to field type, e.g., collectionId for relation
                },
                required: ['name', 'type']
              },
            },
            required: ['collectionNameOrId', 'fieldDefinition'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        await this.ensureAdminAuth(); // Ensure admin is authenticated for all tool calls

        switch (request.params.name) {
          case 'list_collections':
            const collections = await this.pb.collections.getFullList();
            return { content: [{ type: 'text', text: JSON.stringify(collections, null, 2) }] };

          case 'get_collection_schema':
            if (!request.params.arguments || typeof request.params.arguments.collectionNameOrId !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing or invalid collectionNameOrId.');
            }
            const collectionNameOrIdForSchema = request.params.arguments.collectionNameOrId;
            // PocketBase SDK doesn't have a direct "get schema" method.
            // We can list collections and find the one we need, or try to import/export.
            // For simplicity, we'll fetch all and filter. This is not ideal for many collections.
            const allCollections = await this.pb.collections.getFullList();
            const targetCollection = allCollections.find(c => c.id === collectionNameOrIdForSchema || c.name === collectionNameOrIdForSchema);
            if (!targetCollection) {
                 // Use InvalidRequest or a custom error message if a specific "resource not found" code isn't in ErrorCode
                 throw new McpError(ErrorCode.InvalidRequest, `Collection '${collectionNameOrIdForSchema}' not found.`);
            }
            // The full collection object contains its schema.
            return { content: [{ type: 'text', text: JSON.stringify(targetCollection, null, 2) }] };
            
          case 'list_records':
            if (!request.params.arguments || typeof request.params.arguments.collectionNameOrId !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Missing or invalid collectionNameOrId.');
            }
            const collectionNameOrIdForList = request.params.arguments.collectionNameOrId;
            
            interface ListRecordsOptions {
              page?: number;
              perPage?: number;
              sort?: string;
              filter?: string;
              expand?: string;
            }

            const listOptions: ListRecordsOptions = request.params.arguments.options || {};
            
            const page = listOptions.page || 1;
            const perPage = listOptions.perPage || 30;
            
            const pbOptions: { [key: string]: any } = {};
            if (listOptions.sort) pbOptions.sort = listOptions.sort;
            if (listOptions.filter) pbOptions.filter = listOptions.filter;
            if (listOptions.expand) pbOptions.expand = listOptions.expand;

            const records = await this.pb.collection(collectionNameOrIdForList).getList(
              page,
              perPage,
              pbOptions
            );
            return { content: [{ type: 'text', text: JSON.stringify(records, null, 2) }] };

          case 'add_field_to_collection':
            if (!request.params.arguments || 
                typeof request.params.arguments.collectionNameOrId !== 'string' ||
                typeof request.params.arguments.fieldDefinition !== 'object' ||
                request.params.arguments.fieldDefinition === null) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing or invalid collectionNameOrId or fieldDefinition.');
            }
            const collectionId = request.params.arguments.collectionNameOrId;
            const newField = request.params.arguments.fieldDefinition as any; // Cast to any for simplicity, SDK might have proper type

            // Fetch current collection to get existing schema
            console.error(`Attempting to fetch collection: ${collectionId}`);
            const collectionToUpdate = await this.pb.collections.getOne(collectionId);
            console.error("Fetched collection model for update:", JSON.stringify(collectionToUpdate, null, 2));

            // getOne throws if not found, so collectionToUpdate should be valid here.
            // Add a specific check for the schema property.
            if (!collectionToUpdate || typeof collectionToUpdate !== 'object' ) {
                 console.error("collectionToUpdate is null, undefined, or not an object.");
                 throw new McpError(ErrorCode.InternalError, `Collection '${collectionId}' could not be fetched or is invalid.`);
            }
            if (!collectionToUpdate.schema || !Array.isArray(collectionToUpdate.schema)) {
                console.error(`Schema property is missing or not an array for collection '${collectionId}'. Full record:`, JSON.stringify(collectionToUpdate, null, 2));
                throw new McpError(ErrorCode.InternalError, `Collection '${collectionId}' schema is missing or not an array.`);
            }
            
            console.error(`Type of collectionToUpdate.schema: ${typeof collectionToUpdate.schema}`);
            console.error(`Value of collectionToUpdate.schema: ${JSON.stringify(collectionToUpdate.schema, null, 2)}`);

            // Append new field to existing schema fields
            // Define a local interface for SchemaField if not easily importable or for clarity
            interface LocalSchemaField {
                id?: string;
                name: string;
                type: string;
                system?: boolean;
                required?: boolean;
                presentable?: boolean;
                options?: any;
            }

            // Ensure no duplicate field name if PocketBase doesn't handle it
            if (collectionToUpdate.schema.find((f: LocalSchemaField) => f.name === newField.name)) { // Type 'f'
                throw new McpError(ErrorCode.InvalidRequest, `Field '${newField.name}' already exists in collection '${collectionId}'.`);
            }
            const updatedSchema: LocalSchemaField[] = [...collectionToUpdate.schema, newField as LocalSchemaField];

            await this.pb.collections.update(collectionId, { schema: updatedSchema as any[] }); // Cast to any[] for SDK compatibility if LocalSchemaField is too strict
            return { content: [{ type: 'text', text: `Field '${newField.name}' added to collection '${collectionId}'.` }] };

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error: any) {
        console.error(`Error calling tool ${request.params.name}:`, error);
        // Check if it's a PocketBase API error to return a more structured message
        if (error.isAbort === true || (error.originalError && typeof error.originalError === 'object')) { // PocketBase specific error check
            const pbError = error.originalError || error;
            return {
              content: [{ type: 'text', text: `PocketBase API Error: ${pbError.message || JSON.stringify(pbError.data)}` }],
              isError: true,
            };
        }
        return { 
          content: [{ type: 'text', text: error.message || 'An unexpected error occurred.' }], 
          isError: true 
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Use console.error for logs that should go to stderr, so MCP client doesn't parse them as responses
    console.error('PocketBase MCP server running on stdio, connected to:', POCKETBASE_URL);
  }
}

const server = new PocketBaseMcpServer();
server.run().catch(err => {
    console.error("Failed to start PocketBase MCP server:", err);
    process.exit(1);
});
