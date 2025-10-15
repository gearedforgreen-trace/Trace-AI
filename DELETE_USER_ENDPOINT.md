# Delete User Account Endpoint

This endpoint allows users to delete their own account and all associated data. This is required by Apple's App Store guidelines.

## API Endpoint

**DELETE** `/api/user`

### Authentication
- Requires user to be authenticated
- User can only delete their own account

### Response

**Success (200)**
```json
{
  "message": "Your account has been successfully deleted.",
  "success": true
}
```

**Unauthorized (401)**
```json
{
  "message": "Unauthorized. You must be logged in to delete your account."
}
```

**Error (500)**
```json
{
  "message": "Failed to delete account. Please try again later.",
  "error": "Error details..."
}
```

## Usage with RTK Query

The project uses RTK Query for all API communications. The delete user endpoint is available through the `useDeleteCurrentUserMutation` hook.

### Import the hook

```typescript
import { useDeleteCurrentUserMutation } from "@/store/api/usersApi";
```

### Example: Delete Account Button Component

```typescript
"use client";

import { useDeleteCurrentUserMutation } from "@/store/api/usersApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [deleteAccount, { isLoading }] = useDeleteCurrentUserMutation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount().unwrap();

      // Account deleted successfully
      console.log(result.message);

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      // Handle error
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {!showConfirmation ? (
        <Button
          variant="destructive"
          onClick={() => setShowConfirmation(true)}
        >
          Delete My Account
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-600">
            Are you sure? This action cannot be undone. All your data will be permanently deleted.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Yes, Delete My Account"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Data Deletion

When a user deletes their account, the following data is permanently deleted:

1. **User Account** - All user profile information
2. **Sessions** - All active and expired sessions
3. **Accounts** - OAuth and password authentication records
4. **Recycle History** - All recycling activity records
5. **Redeem History** - All coupon redemption records
6. **User Total Points** - Points balance
7. **Organization Memberships** - All organization memberships
8. **Invitations** - Sent invitations
9. **Favourite Coupons** - Saved/favorited coupons

All deletions are performed in a database transaction to ensure data consistency.

## Testing

To test this endpoint:

1. **Create a test user account** (or use an existing non-production account)
2. **Authenticate** and obtain a valid session
3. **Make a DELETE request** to `/api/user`
4. **Verify** that the user and all associated data are deleted

### Test with curl

```bash
# Replace with your actual session token
curl -X DELETE http://localhost:3000/api/user \
  -H "Cookie: your-session-cookie"
```

### Test with Postman

1. Set request method to `DELETE`
2. Set URL to `http://localhost:3000/api/user`
3. Include authentication cookies in the request
4. Send the request

## Security

- ✅ User must be authenticated to delete their account
- ✅ Users can only delete their own account (cannot delete other users)
- ✅ All data deletion is performed in a transaction
- ✅ Cascade deletes handle related records automatically
- ✅ Error handling prevents partial deletions

## Apple App Store Compliance

This endpoint satisfies Apple's requirement that apps must provide users with a way to:
1. Delete their account from within the app
2. Remove all personal data associated with their account

For more information, see [Apple's Account Deletion Guidelines](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

## Support

For questions about account deletion or any other support needs, please contact:
- **Email**: jimmyh@gearedforgreen.com
- **Phone**: 786-239-1776
- **Support Page**: Visit `/support` for comprehensive help
