import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiEndpoint } from "@/components/api-docs/api-endpoint"

export default function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-2">Explore and test the available API endpoints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Ingestion APIs</CardTitle>
          <CardDescription>Secure REST APIs to ingest customers and orders data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customers">
            <TabsList className="mb-4">
              <TabsTrigger value="customers">Customers API</TabsTrigger>
              <TabsTrigger value="orders">Orders API</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Receipt API</TabsTrigger>
            </TabsList>

            <TabsContent value="customers">
              <ApiEndpoint
                method="POST"
                endpoint="/api/customers"
                description="Create or update customer data"
                requestBody={{
                  customer_id: "string",
                  name: "string",
                  email: "string",
                  phone: "string (optional)",
                  created_at: "timestamp",
                  last_active: "timestamp",
                  attributes: "object (optional)",
                }}
                responses={{
                  "200": "Customer created/updated successfully",
                  "400": "Invalid request body",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />

              <ApiEndpoint
                method="GET"
                endpoint="/api/customers"
                description="Get all customers with pagination"
                queryParams={{
                  page: "number (default: 1)",
                  limit: "number (default: 20)",
                  sort: "string (default: created_at)",
                  order: "asc|desc (default: desc)",
                }}
                responses={{
                  "200": "List of customers",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />

              <ApiEndpoint
                method="GET"
                endpoint="/api/customers/:id"
                description="Get a specific customer by ID"
                pathParams={{
                  id: "string (customer_id)",
                }}
                responses={{
                  "200": "Customer details",
                  "404": "Customer not found",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />
            </TabsContent>

            <TabsContent value="orders">
              <ApiEndpoint
                method="POST"
                endpoint="/api/orders"
                description="Create a new order"
                requestBody={{
                  order_id: "string",
                  customer_id: "string",
                  amount: "number",
                  currency: "string",
                  status: "string",
                  items: "array",
                  created_at: "timestamp",
                }}
                responses={{
                  "200": "Order created successfully",
                  "400": "Invalid request body",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />

              <ApiEndpoint
                method="GET"
                endpoint="/api/orders"
                description="Get all orders with pagination"
                queryParams={{
                  page: "number (default: 1)",
                  limit: "number (default: 20)",
                  customer_id: "string (optional)",
                  status: "string (optional)",
                }}
                responses={{
                  "200": "List of orders",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />

              <ApiEndpoint
                method="GET"
                endpoint="/api/orders/:id"
                description="Get a specific order by ID"
                pathParams={{
                  id: "string (order_id)",
                }}
                responses={{
                  "200": "Order details",
                  "404": "Order not found",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />
            </TabsContent>

            <TabsContent value="delivery">
              <ApiEndpoint
                method="POST"
                endpoint="/api/delivery/receipt"
                description="Update delivery status for a campaign message"
                requestBody={{
                  message_id: "string",
                  customer_id: "string",
                  campaign_id: "string",
                  status: "string (SENT, FAILED)",
                  timestamp: "timestamp",
                }}
                responses={{
                  "200": "Delivery status updated",
                  "400": "Invalid request body",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />

              <ApiEndpoint
                method="GET"
                endpoint="/api/delivery/stats/:campaign_id"
                description="Get delivery statistics for a campaign"
                pathParams={{
                  campaign_id: "string",
                }}
                responses={{
                  "200": "Campaign delivery statistics",
                  "404": "Campaign not found",
                  "401": "Unauthorized",
                  "500": "Internal server error",
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Overview</CardTitle>
          <CardDescription>Pub-Sub architecture for data ingestion and processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-zinc-800 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">
              {`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   API Layer     │────▶│  Message Broker │────▶│ Consumer Service│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│  Validation &   │                           │   Database      │
│  Authentication │                           │                 │
│                 │                           │                 │
└─────────────────┘                           └─────────────────┘`}
            </pre>
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium">Flow Description</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>API Layer receives requests and performs validation</li>
              <li>Valid requests are published to the Message Broker (Kafka/RabbitMQ)</li>
              <li>Consumer Service processes messages asynchronously</li>
              <li>Data is persisted to the database in batches for efficiency</li>
              <li>Delivery receipts follow the same pattern for high throughput</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
