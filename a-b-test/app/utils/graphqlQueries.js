// GraphQL queries and mutations for product and inventory management

export const GET_PRODUCT = `
    query getProduct($id: ID!) {
        product(id: $id) {
            id
            title
            description
            handle
            status
        }
    }
`;

export const GET_PRODUCT_VARIANT = `
    query getVariant($productId: ID!) {
        product(id: $productId) {
            variants(first: 1) {
                edges {
                    node {
                        id
                        inventoryItem {
                            id
                            inventoryLevels(first: 1) {
                                edges {
                                    node {
                                        id
                                        location {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const GET_PRODUCT_INVENTORY = `
    query getProductInventory($id: ID!) {
        product(id: $id) {
            variants(first: 1) {
                edges {
                    node {
                        id
                        inventoryQuantity
                        inventoryItem {
                            id
                            inventoryLevels(first: 1) {
                                edges {
                                    node {
                                        id
                                        location {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const GET_ORIGINAL_PRODUCT_INVENTORY = `
    query getOriginalProductInventory($id: ID!) {
        product(id: $id) {
            variants(first: 1) {
                edges {
                    node {
                        id
                        inventoryQuantity
                        inventoryItem {
                            id
                            inventoryLevels(first: 1) {
                                edges {
                                    node {
                                        id
                                        location {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const DELETE_PRODUCT = `
    mutation productDelete($id: ID!) {
        productDelete(input: { id: $id }) {
            deletedProductId
            shop {
                id
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const ADJUST_INVENTORY = `
    mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
            inventoryAdjustmentGroup {
                changes {
                    name
                    delta
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const DUPLICATE_PRODUCT = `
    mutation productDuplicate($productId: ID!, $newTitle: String!, $includeImages: Boolean!, $newStatus: ProductStatus!) {
        productDuplicate(
            productId: $productId,
            newTitle: $newTitle,
            includeImages: $includeImages,
            newStatus: $newStatus
        ) {
            newProduct {
                id
                title
                handle
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const UPDATE_PRODUCT = `
    mutation updateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
            product {
                id
                descriptionHtml
                status
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const CREATE_PRODUCT_MEDIA = `
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
        productCreateMedia(media: $media, productId: $productId) {
            media {
                ... on MediaImage {
                    id
                }
            }
            mediaUserErrors {
                field
                message
            }
        }
    }
`;

export const CREATE_SCRIPT_TAG = `
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
            scriptTag {
                id
                src
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const GET_SHOP_DETAILS = `
    query {
        shop {
            name
            email
            myshopifyDomain
        }
    }
`;

// ============ NEW QUERIES AND MUTATIONS ============

// From app.test.$testId.jsx
export const GET_PRODUCTS_AND_SHOP = `
    query {
        products(first: 240) {
            nodes {
                id
                title
                handle
                description
                status
                variants(first: 10) {
                    edges {
                        node {
                            id
                            title
                            price
                            compareAtPrice
                            barcode
                            inventoryQuantity
                        }
                    }
                }
                images(first: 10) {
                    edges {
                        node {
                            url
                            altText
                        }
                    }
                }
            }
        }
        shop {
            id
            name
            myshopifyDomain
            primaryDomain {
                url
                host
            }
        }
    }
`;

export const GET_SHOPIFY_FUNCTIONS = `
    query {
        shopifyFunctions(first: 10) {
            nodes {
                id
                title
                apiType
            }
        }
    }
`;

// From app._index.jsx
export const CREATE_PRODUCT_POPULATE = `
    mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
            product {
                id
                title
                handle
                status
                variants(first: 10) {
                    edges {
                        node {
                            id
                            price
                            barcode
                            createdAt
                        }
                    }
                }
            }
        }
    }
`;

export const UPDATE_PRODUCT_VARIANTS_BULK = `
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
                id
                price
                barcode
                createdAt
            }
        }
    }
`;

// From api.upload-image.js
export const STAGED_UPLOADS_CREATE = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
            stagedTargets {
                url
                resourceUrl
                parameters {
                    name
                    value
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const FILE_CREATE = `
    mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
            files {
                ... on MediaImage {
                    id
                    status
                    image {
                        url
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const GET_MEDIA_IMAGE = `
    query getMediaImage($id: ID!) {
        node(id: $id) {
            ... on MediaImage {
                image {
                    url
                }
            }
        }
    }
`;

// From api.store-info.js
export const GET_SHOP_INFO = `
    query {
        shop {
            url
            myshopifyDomain
        }
    }
`;

// From api.shopify.shop-data.js
export const GET_SHOP_DATA = `
    query {
        shop {
            id
            name
            domain
            url
        }
    }
`;

// New query to get shop currency
export const GET_SHOP_CURRENCY = `
    query {
        shop {
            currencyCode
        }
    }
`;

// From api.script-tags.js
export const GET_SCRIPT_TAGS = `
    query {
        scriptTags(first: 10) {
            edges {
                node {
                    id
                    src
                    cache
                    displayScope
                }
            }
        }
    }
`;

export const CREATE_SCRIPT_TAG_ALTERNATIVE = `
    mutation scriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
            scriptTag {
                id
                src
                cache
                displayScope
            }
            userErrors {
                field
                message
            }
        }
    }
`;

// From discount.js
export const DISCOUNT_AUTOMATIC_APP_CREATE = `
    mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
            automaticAppDiscount {
                discountId
                title
                startsAt
                endsAt
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const DISCOUNT_AUTOMATIC_DELETE = `
    mutation discountAutomaticDelete($id: ID!) {
        discountAutomaticDelete(id: $id) {
            deletedAutomaticDiscountId
            userErrors {
                field
                code
                message
            }
        }
    }
`;

export const GET_DISCOUNT_AUTOMATIC_APP = `
    query getDiscountAutomaticApp($id: ID!) {
        discountAutomaticApp(id: $id) {
            id
            title
            status
        }
    }
`;

export const GET_DISCOUNT_AUTOMATIC_APPS = `
    query {
        discountAutomaticApps(first: 50) {
            edges {
                node {
                    id
                    title
                    status
                    metafields(first: 1, namespace: "$app:product-discount", key: "function-configuration") {
                        edges {
                            node {
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const DISCOUNT_AUTOMATIC_ACTIVATE = `
    mutation discountAutomaticActivate($id: ID!) {
        discountAutomaticActivate(id: $id) {
            automaticDiscountNode {
                id
                automaticDiscount {
                    ... on DiscountAutomaticBasic {
                        status
                        startsAt
                        endsAt
                    }
                    ... on DiscountAutomaticBxgy {
                        status
                        startsAt
                        endsAt
                    }
                    ... on DiscountAutomaticApp {
                        status
                        startsAt
                        endsAt
                    }
                }
            }
            userErrors {
                field
                code
                message
            }
        }
    }
`;

export const DISCOUNT_AUTOMATIC_DEACTIVATE = `
    mutation discountAutomaticDeactivate($id: ID!) {
        discountAutomaticDeactivate(id: $id) {
            automaticDiscountNode {
                id
                automaticDiscount {
                    ... on DiscountAutomaticBasic {
                        status
                        startsAt
                        endsAt
                    }
                    ... on DiscountAutomaticBxgy {
                        status
                        startsAt
                        endsAt
                    }
                }
            }
            userErrors {
                field
                code
                message
            }
        }
    }
`; 