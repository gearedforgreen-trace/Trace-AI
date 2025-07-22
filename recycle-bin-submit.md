# Recycle Bin Submission API Documentation

## Overview
This API endpoint allows users to submit recycling materials to a specific bin. The system uses AI-powered image analysis to verify the material type and count before processing the submission.

**Endpoint:** `POST /api/recycle-histories/submit`

## Authentication
This endpoint requires authentication using Bearer token authentication.

### How to Authenticate

1. First, obtain a session token by signing in through the authentication endpoints
2. Include the Bearer token in the Authorization header:
   ```
   Authorization: Bearer <your-session-token>
   ```

## Request Payload

### Schema
```typescript
{
  binId: string;        // UUID of the bin where materials are being recycled
  totalCount: number;   // Number of items being recycled (minimum: 1)
  mediaUrl: string;     // URL of the captured image (must be a valid URL)
}
```

### Payload Validation
- `binId`: Must be a valid UUID format
- `totalCount`: Must be a number greater than or equal to 1
- `mediaUrl`: Must be a valid URL pointing to an image

## Image Handling for React Native

### Capturing Images
1. Use React Native's camera library (e.g., `react-native-camera` or `expo-camera`)
2. Capture the image of the materials being recycled
3. Ensure good lighting and clear focus for better AI analysis

### Converting to Base64 and Uploading
Since the API expects a URL, you'll need to:
1. Convert the captured image to base64
2. Upload it to a temporary storage service (like Cloudinary, AWS S3, or your own server)
3. Use the returned URL in the API request

#### Example React Native Implementation:
```javascript
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

const captureAndSubmitRecycle = async () => {
  try {
    // 1. Capture image
    const photo = await camera.takePictureAsync({
      quality: 0.8,
      base64: true,
    });

    // 2. Compress and resize image
    const processedImage = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // 3. Upload to temporary storage (example with your own endpoint)
    const uploadResponse = await fetch('YOUR_UPLOAD_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        image: processedImage.base64,
        filename: `recycle-${Date.now()}.jpg`,
      }),
    });

    const { imageUrl } = await uploadResponse.json();

    // 4. Submit to recycle API
    const submitResponse = await fetch('/api/recycle-histories/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        binId: 'your-bin-uuid',
        totalCount: 5,
        mediaUrl: imageUrl,
      }),
    });

    const result = await submitResponse.json();
    
    if (submitResponse.ok) {
      console.log('Recycle submitted successfully:', result);
    } else {
      console.error('Submission failed:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Response Format

### Success Response (201 Created)
```json
{
  "message": "Recycle history created successfully",
  "data": {
    "id": "recycle-history-uuid",
    "pointsEarned": 25,
    "totalCount": 5,
    "material": {
      "id": "material-uuid",
      "name": "Plastic Bottles",
      "description": "Recyclable plastic bottles"
    },
    "store": {
      "id": "store-uuid",
      "name": "Downtown Store",
      "organizationName": "Green Organization"
    },
    "rewardRule": {
      "name": "Plastic Bottle Rewards",
      "unitType": "bottles",
      "unit": 1,
      "point": 5
    },
    "recycledAt": "2024-01-15T10:30:00Z",
    "mediaUrl": "https://res.cloudinary.com/.../image.jpg"
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 422 Validation Error
```json
{
  "error": "Validation Error",
  "details": {
    "binId": ["Invalid bin ID"],
    "totalCount": ["Total count must be at least 1"],
    "mediaUrl": ["Invalid media URL"]
  }
}
```

#### 400 Bad Request - AI Analysis Errors
```json
{
  "errorType": "count_discrepancy",
  "errorMessage": "Detected count is too different from what you provided. Please try again with the correct material or try again with a clearer image"
}
```

## AI Analysis Error Types

The API uses AI to analyze the submitted image and may return specific error types:

| Error Type | Description | Action Required |
|------------|-------------|-----------------|
| `count_discrepancy` | AI detected a different count than claimed | Verify your count and retry |
| `low_confidence` | AI confidence is below threshold | Take a clearer photo |
| `material_mismatch` | Detected material doesn't match bin type | Use correct bin for material |
| `no_items_detected` | No recyclable items found in image | Ensure items are visible |
| `image_not_clear` | Image quality too poor for analysis | Improve lighting/focus |
| `reverify_required` | Manual verification needed | Contact support |

## Points Calculation

Points are calculated based on the bin's reward rule:
```
pointsEarned = Math.floor((totalCount / unit) * point)
```

Example: If reward rule is 1 bottle = 5 points, and you submit 3 bottles:
- `pointsEarned = Math.floor((3 / 1) * 5) = 15 points`

## Best Practices

### Image Quality
- Ensure good lighting
- Focus clearly on the materials
- Avoid shadows and reflections
- Include all items in the frame
- Use a stable camera position

### Count Accuracy
- Count items carefully before submission
- Double-check your count
- Ensure all items are visible in the photo

### Error Handling
- Always handle network errors
- Implement retry logic for temporary failures
- Show user-friendly error messages
- Provide guidance for each error type

### Security
- Never store session tokens in plain text
- Use secure storage for authentication
- Validate all user inputs
- Handle sensitive data appropriately

## Rate Limiting
- Be mindful of API rate limits
- Implement appropriate delays between requests
- Handle rate limit errors gracefully

## Testing
Test your implementation with:
1. Valid submissions with different material counts
2. Invalid bin IDs
3. Poor quality images
4. Network connectivity issues
5. Authentication failures

## Support
For technical support or questions about this API, contact the development team or refer to the main API documentation.
