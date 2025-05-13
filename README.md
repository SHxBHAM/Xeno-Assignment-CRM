# Xeno Marketing Platform API Documentation

This document provides details for all available API endpoints.

**Base URL**: `http://localhost:3000/api` (during development)

## Authentication
Completely Handled by OAuth2.0

# API Structure


## 1. User Management

### 1.1. Ingest Customer Data

- **Endpoint**: `POST /user`
- **Description**: Creates or updates customer data in the system.
- **Request Body**: `application/json`
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "90210",
      "country": "USA"
    }
  }
  ```
  - `name` (string, required): Full name of the customer.
  - `email` (string, required, unique): Email address of the customer.
  - `phone` (string, required): Phone number of the customer.
  - `address` (object, required): Customer's address details.
    - `street`, `city`, `state`, `zipCode`, `country` (all strings, required).
- **Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User data ingested successfully.",
    "data": {
      "id": "generated-uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "createdAt": "iso-timestamp",
      "address": {
        "userId": "generated-uuid",
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zipCode": "90210",
        "country": "USA"
      }
    }
  }
  ```
- **Error Response (400 Bad Request - Validation Error)**:
  ```json
  {
    "success": false,
    "error": "Invalid user data provided.",
    "details": {
      "email": ["Invalid email format"]
    }
  }
  ```

---

## 2. Order Management

### 2.1. Ingest Order Data

- **Endpoint**: `POST /order`
- **Description**: Ingests order data for a customer. Assumes the customer (`customerId`) already exists.
- **Request Body**: `application/json`
  ```json
  {
    "customerId": "customer-uuid",
    "items": [
      {
        "productId": "prod-123",
        "name": "Awesome T-Shirt",
        "price": 2500, // In cents
        "quantity": 2,
        "total": 5000 // In cents
      }
    ],
    "totalAmount": 5000, // In cents
    "currency": "USD",
    "status": "delivered"
  }
  ```
  - `customerId` (string, UUID, required): The ID of the customer placing the order.
  - `items` (array of objects, required): List of items in the order.
    - `productId` (string, required): Identifier for the product.
    - `name` (string, required): Name of the product.
    - `price` (integer, required): Price of one unit of the product (in cents).
    - `quantity` (integer, required): Quantity of the product.
    - `total` (integer, required): Total price for this item line (price \* quantity, in cents).
  - `totalAmount` (integer, required): Total amount for the entire order (in cents).
  - `currency` (string, required): Currency code (e.g., "USD").
  - `status` (string, required): Status of the order (e.g., "processing", "shipped", "delivered").
- **Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Order data ingested successfully.",
    "data": {
      "id": "generated-order-uuid",
      "customerId": "customer-uuid",
      "totalAmount": 5000,
      "currency": "USD",
      "status": "delivered",
      "createdAt": "iso-timestamp",
      "items": [
        {
          "id": "generated-item-uuid",
          "orderId": "generated-order-uuid",
          "productId": "prod-123",
          "name": "Awesome T-Shirt",
          "price": 2500,
          "quantity": 2,
          "total": 5000
        }
      ]
    }
  }
  ```
- **Error Response (404 Not Found - Customer not found)**:
  ```json
  {
    "success": false,
    "error": "Customer with ID customer-uuid not found."
  }
  ```

---

## 3. Segment Management

### 3.1. Preview Segment Audience

- **Endpoint**: `POST /segments/preview`
- **Description**: Calculates the potential audience size for a given set of segment rules without saving the segment.
- **Request Body**: `application/json`
  ```json
  {
    "rules": {
      "groups": [
        {
          "conditions": [
            {
              "field": "totalSpend",
              "operator": "greaterThan",
              "value": 10000
            },
            { "field": "state", "operator": "equals", "value": "CA" }
          ]
        },
        {
          "conditions": [
            {
              "field": "orderCount",
              "operator": "greaterThanOrEqual",
              "value": 5
            }
          ]
        }
      ]
    }
  }
  ```
  - `rules` (object, required): The segmentation rules. See `segment-rules-schema.ts` for detailed structure.
    - `groups` (array of objects, required): Represents OR conditions between groups.
      - `conditions` (array of objects, required): Represents AND conditions within a group.
        - `field` (string, required): Field to evaluate (e.g., `totalSpend`, `orderCount`, `lastOrderDate`, `state`, `userCreatedAt`).
        - `operator` (string, required): Operator (e.g., `greaterThan`, `equals`, `newerThanDays`, `olderThanDays`).
        - `value` (any, required): Value to compare against.
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "audienceSize": 150,
      "sampleUserIds": ["user-uuid-1", "user-uuid-2", "..."] // Up to 20 sample IDs
    }
  }
  ```

### 3.2. Create Segment

- **Endpoint**: `POST /segments`
- **Description**: Creates and saves a new segment based on the provided rules.
- **Request Body**: `application/json`
  ```json
  {
    "name": "High Value CA Customers",
    "rules": {
      "groups": [
        {
          "conditions": [
            {
              "field": "totalSpend",
              "operator": "greaterThan",
              "value": 10000
            },
            { "field": "state", "operator": "equals", "value": "CA" }
          ]
        }
      ]
    }
  }
  ```
  - `name` (string, required): Name for the segment.
  - `rules` (object, required): Segmentation rules (same structure as preview).
- **Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Segment \"High Value CA Customers\" created successfully.",
    "data": {
      "id": "generated-segment-uuid",
      "name": "High Value CA Customers",
      "rules": {
        /* rules object */
      },
      "audienceUserIds": ["user-uuid-1", "..."],
      "createdAt": "iso-timestamp",
      "updatedAt": "iso-timestamp"
    }
  }
  ```

### 3.3. List All Segments

- **Endpoint**: `GET /segments`
- **Description**: Retrieves a list of all saved segments, ordered by creation date (newest first).
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "segment-uuid-1",
        "name": "High Value CA Customers",
        "rules": {
          /* rules object */
        },
        "audienceUserIds": ["..."],
        "createdAt": "iso-timestamp",
        "updatedAt": "iso-timestamp"
      },
      {
        "id": "segment-uuid-2",
        "name": "Recent Shoppers"
        // ... other fields
      }
    ]
  }
  ```

### 3.4. Get Specific Segment

- **Endpoint**: `GET /segments/:segmentId`
- **Description**: Retrieves details for a specific segment by its ID.
- **Path Parameters**:
  - `segmentId` (string, UUID, required): The ID of the segment to retrieve.
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "segment-uuid-1",
      "name": "High Value CA Customers",
      "rules": {
        /* rules object */
      },
      "audienceUserIds": ["..."],
      "createdAt": "iso-timestamp",
      "updatedAt": "iso-timestamp"
    }
  }
  ```

---

## 4. Campaign Management

### 4.1. Create Campaign (and associated Segment)

- **Endpoint**: `POST /campaigns`
- **Description**: Creates a new segment and a new campaign associated with it in a single operation. The campaign will immediately be in `PROCESSING` status.
- **Request Body**: `application/json`
  ```json
  {
    "campaignName": "Welcome New Users Q2",
    "message": "Hello {{name}}, welcome to our platform! Enjoy 10% off your first order.",
    "segmentName": "New Users - Last 14 Days",
    "segmentRules": {
      "groups": [
        {
          "conditions": [
            {
              "field": "userCreatedAt",
              "operator": "newerThanDays",
              "value": 14
            }
          ]
        }
      ]
    }
  }
  ```
  - `campaignName` (string, required, min 3 chars): Name for the campaign.
  - `message` (string, required, min 10 chars): Message template for the campaign. Use `{{name}}` for personalization.
  - `segmentName` (string, required, min 3 chars): Name for the new segment to be created.
  - `segmentRules` (object, required): Segmentation rules for the new segment (same structure as `/segments/preview`).
- **Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Segment \"New Users - Last 14 Days\" and Campaign \"Welcome New Users Q2\" created successfully. Campaign status: PROCESSING.",
    "data": {
      "segment": {
        "id": "generated-segment-uuid",
        "name": "New Users - Last 14 Days",
        "rules": {
          /* rules object */
        },
        "audienceUserIds": ["..."],
        "createdAt": "iso-timestamp",
        "updatedAt": "iso-timestamp"
      },
      "campaign": {
        "id": "generated-campaign-uuid",
        "name": "Welcome New Users Q2",
        "messageTemplate": "Hello {{name}}, welcome to our platform! Enjoy 10% off your first order.",
        "status": "PROCESSING",
        "audienceSize": 120, // Example
        "sentCount": 0,
        "failedCount": 0,
        "createdAt": "iso-timestamp",
        "updatedAt": "iso-timestamp",
        "segmentId": "generated-segment-uuid"
      }
    }
  }
  ```

### 4.2. List All Campaigns

- **Endpoint**: `GET /campaigns`
- **Description**: Retrieves a list of all campaigns, ordered by creation date (newest first). Includes the name of the associated segment.
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "campaign-uuid-1",
        "name": "Welcome New Users Q2",
        "messageTemplate": "Hello {{name}}, ...",
        "status": "PROCESSING",
        "audienceSize": 120,
        "sentCount": 0,
        "failedCount": 0,
        "createdAt": "iso-timestamp",
        "updatedAt": "iso-timestamp",
        "segmentId": "segment-uuid-associated",
        "segmentName": "New Users - Last 14 Days", // Flattened for convenience
        "segment": {
          // Original nested segment object
          "name": "New Users - Last 14 Days"
        }
      }
      // ... other campaigns
    ]
  }
  ```

### 4.3. Get Specific Campaign

- **Endpoint**: `GET /campaigns/:campaignId`
- **Description**: Retrieves details for a specific campaign by its ID, including full details of its associated segment.
- **Path Parameters**:
  - `campaignId` (string, UUID, required): The ID of the campaign to retrieve.
- **Successful Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "campaign-uuid-1",
      "name": "Welcome New Users Q2",
      "messageTemplate": "Hello {{name}}, ...",
      "status": "PROCESSING",
      "audienceSize": 120,
      "sentCount": 0,
      "failedCount": 0,
      "createdAt": "iso-timestamp",
      "updatedAt": "iso-timestamp",
      "segmentId": "segment-uuid-associated",
      "segment": {
        // Full segment details
        "id": "segment-uuid-associated",
        "name": "New Users - Last 14 Days",
        "rules": {
          /* rules object */
        },
        "audienceUserIds": ["..."]
      }
    }
  }
  ```

---
