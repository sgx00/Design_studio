# VertexAI Setup Guide

This guide will help you set up Google Cloud VertexAI for the AI Design Platform.

## Prerequisites

1. **Google Cloud Platform Account**
   - Sign up at [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or use an existing one

2. **Enable Required APIs**
   - Go to the [API Library](https://console.cloud.google.com/apis/library)
   - Enable the following APIs:
     - Vertex AI API
     - Cloud Storage API (if using GCS for images)

## Authentication Setup

### Option 1: Application Default Credentials (Recommended)

1. **Install Google Cloud CLI**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Windows
   # Download from https://cloud.google.com/sdk/docs/install
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Authenticate**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

3. **Set your project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

### Option 2: Service Account Key

1. **Create a Service Account**
   - Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Give it a name like "vertexai-service"
   - Grant the "Vertex AI User" role

2. **Create and Download Key**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the key file

3. **Set Environment Variable**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   ```

## Configuration

### Update Project Settings

In `services/aiDesignGenerator.js`, update the project configuration:

```javascript
this.ai = new GoogleGenAI({
  vertexai: true,
  project: 'YOUR_PROJECT_ID',  // Replace with your project ID
  location: 'global'
});
```

### Environment Variables (Optional)

You can also set these as environment variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export VERTEXAI_LOCATION="global"
```

## Testing

1. **Run the test script**
   ```bash
   node test-vertexai.js
   ```

2. **Check the server logs**
   - Look for "Sending request to VertexAI Gemini..." messages
   - Check for any authentication errors

## Troubleshooting

### Common Issues

1. **Authentication Error**
   ```
   Error: Could not load the default credentials
   ```
   - Solution: Run `gcloud auth application-default login`

2. **Project Not Found**
   ```
   Error: Project 'garment-design-ai-2025' not found
   ```
   - Solution: Update the project ID in `aiDesignGenerator.js`

3. **API Not Enabled**
   ```
   Error: API 'aiplatform.googleapis.com' not enabled
   ```
   - Solution: Enable Vertex AI API in Google Cloud Console

4. **Quota Exceeded**
   ```
   Error: Quota exceeded
   ```
   - Solution: Check your VertexAI quotas in Google Cloud Console

### Getting Help

- [VertexAI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Cloud Support](https://cloud.google.com/support)

## Cost Considerations

- VertexAI has usage-based pricing
- Image generation with Gemini may incur costs
- Monitor your usage in the Google Cloud Console
- Set up billing alerts to avoid unexpected charges
