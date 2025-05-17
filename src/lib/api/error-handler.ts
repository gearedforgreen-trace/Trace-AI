// Centralized error handling for API requests
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  static fromResponse(error: any): ApiError {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Server error";
      return new ApiError(message, error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return new ApiError("No response from server", 0);
    } else {
      // Something happened in setting up the request that triggered an Error
      return new ApiError(error.message || "Request error", 0);
    }
  }

  // Helper methods for common error types
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }
}

// Function to handle API errors in a consistent way
export function handleApiError(error: any, toast?: any): ApiError {
  const apiError = ApiError.fromResponse(error);

  console.error("API Error:", apiError);

  // If toast is provided, show an error message
  if (toast) {
    toast({
      title: "Error",
      description: apiError.message,
      variant: "destructive",
    });
  }

  return apiError;
}
