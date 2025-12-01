# Prospera API Documentation

## Overview

Base URL: `http://localhost:5000/api`

All requests require `Content-Type: application/json` header.

Protected routes require Authorization header: `Bearer <token>`

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+94771234567",
  "role": "farmer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

## Farm Management

### Register Farm
```
POST /farm/register
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Green Valley Farm",
  "landSize": 5.5,
  "location": {
    "coordinates": [80.6337, 7.2906],
    "address": "Kandy Road, Kurunegala",
    "region": "North Western",
    "district": "Kurunegala"
  },
  "soilData": {
    "type": "loamy",
    "pH": 6.5
  },
  "waterSource": "irrigation"
}
```

### Get Farm Dashboard
```
GET /farm/:id/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 450000,
    "totalExpenses": 185000,
    "profit": 265000,
    "roi": "143.24",
    "currentCrops": 3,
    "recentExpenses": [...],
    "recentRevenue": [...]
  }
}
```

### Add Expense
```
POST /farm/:id/expense
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "category": "fertilizer",
  "amount": 5000,
  "description": "NPK fertilizer 50kg",
  "date": "2025-12-01",
  "crop": "Tomato"
}
```

### Add Crop
```
POST /farm/:id/crop
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cropName": "Tomato",
  "variety": "Thilina F1",
  "plantedDate": "2025-12-01",
  "expectedHarvestDate": "2026-03-10",
  "area": 2.5,
  "status": "planted"
}
```

## Market

### Create Listing
```
POST /market/listing
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "wholesale",
  "product": {
    "name": "Fresh Tomatoes",
    "category": "vegetables",
    "variety": "Thilina F1",
    "images": ["url1", "url2"],
    "description": "Premium quality tomatoes"
  },
  "quantity": {
    "amount": 500,
    "unit": "kg"
  },
  "pricing": {
    "pricePerUnit": 150,
    "currency": "LKR",
    "negotiable": true
  },
  "quality": {
    "grade": "A",
    "organic": false
  },
  "location": {
    "district": "Kurunegala",
    "city": "Kurunegala"
  }
}
```

### Get Market Listings
```
GET /market/listings?category=vegetables&minPrice=100&maxPrice=200
```

### Get Price Tracking
```
GET /market/prices?product=tomato&market=Colombo
```

## Social Network

### Create Post
```
POST /social/post
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": {
    "text": "Great harvest this season! #farming",
    "images": ["url1", "url2"]
  },
  "type": "post",
  "category": "general",
  "tags": ["harvest", "success"]
}
```

### Create Group
```
POST /social/group
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Organic Farmers Sri Lanka",
  "description": "Community for organic farming enthusiasts",
  "category": "organic-farming",
  "privacy": "public"
}
```

### Create Article
```
POST /social/article
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Best Practices for Tomato Cultivation",
  "content": "Full article content here...",
  "summary": "Learn the best practices...",
  "category": "crop-rotation",
  "tags": ["tomato", "cultivation"],
  "language": "en"
}
```

## Learning

### Get Courses
```
GET /learning/courses?category=crop-management&level=beginner
```

### Enroll in Course
```
POST /learning/course/:id/enroll
Authorization: Bearer <token>
```

### Submit Skill Test
```
POST /learning/skill-test/:id/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "answers": ["answer1", "answer2", "answer3"]
}
```

## AI Tools

### Disease Detection
```
POST /ai-tools/disease-detection
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/leaf-image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "disease": "Late Blight",
    "confidence": 0.87,
    "severity": "moderate",
    "treatment": {
      "immediate": ["Remove affected leaves", "Apply fungicide"],
      "preventive": ["Use resistant varieties"]
    }
  }
}
```

### Yield Prediction
```
POST /ai-tools/yield-prediction
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cropType": "tomato",
  "landSize": 2.5,
  "soilType": "loamy",
  "climate": "tropical",
  "waterAvailability": "adequate"
}
```

### Crop Planner
```
POST /ai-tools/crop-planner
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "location": "Kurunegala",
  "soilType": "loamy",
  "season": "Maha",
  "marketDemand": true,
  "previousCrop": "paddy"
}
```

## Marketplace

### List Product
```
POST /marketplace/product
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Deere Tractor 5055E",
  "category": "machinery",
  "description": "Well-maintained tractor, 3 years old",
  "images": ["url1", "url2"],
  "specifications": {
    "brand": "John Deere",
    "model": "5055E",
    "yearManufactured": 2022,
    "condition": "good",
    "warranty": {
      "available": true,
      "duration": "1 year"
    }
  },
  "pricing": {
    "price": 3500000,
    "currency": "LKR",
    "saleType": "sale"
  },
  "location": {
    "city": "Kandy",
    "country": "Sri Lanka"
  }
}
```

### Create Order
```
POST /marketplace/order
Authorization: Bearer <token>
```

## Government

### Get Schemes
```
GET /government/schemes?type=subsidy&status=active
```

### Apply for Scheme
```
POST /government/scheme/:id/apply
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "documents": [
    {
      "name": "Land ownership certificate",
      "url": "document-url"
    }
  ]
}
```

### Submit Insurance Claim
```
POST /government/insurance-claim
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "policyNumber": "AGR-2025-12345",
  "claimType": "crop-loss",
  "claimDetails": {
    "incidentDate": "2025-11-25",
    "cropAffected": "Rice",
    "areaAffected": 2.5,
    "estimatedLoss": 150000,
    "description": "Flood damage to paddy field"
  },
  "supportingDocuments": [
    {
      "name": "Photo evidence",
      "url": "document-url"
    }
  ]
}
```

## Weather

### Get Current Weather
```
GET /weather/current?city=Colombo
GET /weather/current?lat=6.9271&lon=79.8612
```

### Get Forecast
```
GET /weather/forecast?city=Kandy
```

### Get Agricultural Insights
```
GET /weather/agricultural?city=Kurunegala
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {
      "temperature": 28.5,
      "humidity": 75,
      "rainfall": 0
    },
    "forecast": {
      "avgTemperature": "27.8",
      "totalRainfall": "15.5",
      "avgHumidity": "78.2"
    },
    "alerts": [
      {
        "type": "high-humidity",
        "severity": "info",
        "message": "High humidity levels may increase disease risk"
      }
    ],
    "recommendations": ["Irrigate during early morning"],
    "suitableForPlanting": true
  }
}
```

## Support

### Create Support Ticket
```
POST /support/ticket
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "Cannot access marketplace",
  "category": "technical",
  "priority": "medium",
  "description": "Detailed description of the issue..."
}
```

### Chat with Bot
```
POST /support/chatbot/message
```

**Request Body:**
```json
{
  "sessionId": "unique-session-id",
  "message": "How do I check market prices?",
  "userId": "optional-user-id"
}
```

## FinTech

### Apply for Loan
```
POST /fintech/loan/apply
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "loanType": "fertilizer-loan",
  "amount": {
    "requested": 50000,
    "currency": "LKR"
  },
  "purpose": "Purchase fertilizer for upcoming season",
  "terms": {
    "duration": 6,
    "repaymentSchedule": "monthly"
  }
}
```

### Get Credit Score
```
GET /fintech/credit-score
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 75,
    "rating": "Good",
    "factors": {
      "farmSize": 10,
      "totalRevenue": 15,
      "profitMargin": 10,
      "cropHistory": 5,
      "repaymentHistory": 20
    },
    "recommendations": []
  }
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API is rate limited to 100 requests per 15 minutes per IP address.

## Pagination

Endpoints that return lists support pagination:

```
GET /api/endpoint?page=1&limit=20
```

Response includes pagination info:
```json
{
  "success": true,
  "data": [...],
  "totalPages": 5,
  "currentPage": 1
}
```
