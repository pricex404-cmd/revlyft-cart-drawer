import { authenticate } from "../shopify.server";
import { STAGED_UPLOADS_CREATE, FILE_CREATE, GET_MEDIA_IMAGE } from "../utils/graphqlQueries";

export const action = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);

        // Get the file data from the request
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            throw new Error('No valid file provided');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Validate file size (max 20MB)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 20MB');
        }

        // Step 1: Get staged upload URL
        console.log('Step 1: Getting staged upload URL...');
        const stagedResponse = await admin.graphql(
            STAGED_UPLOADS_CREATE,
            {
                variables: {
                    input: [{
                        filename: file.name || 'upload.jpg',
                        mimeType: file.type,
                        httpMethod: "POST",
                        fileSize: String(file.size),
                        resource: "IMAGE"
                    }]
                }
            }
        );

        const stagedData = await stagedResponse.json();
        console.log('Staged upload response:', stagedData);

        if (stagedData.data?.stagedUploadsCreate?.userErrors?.length > 0) {
            throw new Error(stagedData.data.stagedUploadsCreate.userErrors[0].message);
        }

        const { url, parameters, resourceUrl } = stagedData.data.stagedUploadsCreate.stagedTargets[0];

        // Step 2: Upload to Google Cloud Storage
        console.log('Step 2: Uploading to Google Cloud Storage...');
        const uploadFormData = new FormData();
        parameters.forEach(({ name, value }) => {
            uploadFormData.append(name, value);
        });
        uploadFormData.append('file', file);

        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: uploadFormData
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload to storage: ${uploadResponse.statusText}`);
        }

        // Step 3: Create file in Shopify
        console.log('Step 3: Creating file in Shopify...');
        const fileResponse = await admin.graphql(
            FILE_CREATE,
            {
                variables: {
                    files: [{
                        alt: file.name || 'Uploaded image',
                        contentType: "IMAGE",
                        originalSource: resourceUrl
                    }]
                }
            }
        );

        const fileData = await fileResponse.json();
        console.log('File create response:', fileData);

        if (fileData.data?.fileCreate?.userErrors?.length > 0) {
            throw new Error(fileData.data.fileCreate.userErrors[0].message);
        }

        const mediaImage = fileData.data?.fileCreate?.files[0];
        if (!mediaImage) {
            throw new Error('No file created');
        }

        // If image is not immediately available, poll for it
        let imageUrl = mediaImage.image?.url;
        if (!imageUrl) {
            // Poll for the image URL up to 5 times with 1 second delay
            for (let i = 0; i < 5; i++) {
                console.log(`Polling for image URL attempt ${i + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));

                const pollResponse = await admin.graphql(
                    GET_MEDIA_IMAGE,
                    {
                        variables: {
                            id: mediaImage.id
                        }
                    }
                );

                const pollData = await pollResponse.json();
                imageUrl = pollData.data?.node?.image?.url;
                if (imageUrl) break;
            }
        }

        if (!imageUrl) {
            throw new Error('Image URL not available after multiple attempts');
        }

        return new Response(JSON.stringify({ url: imageUrl }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in upload handler:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to upload image'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 